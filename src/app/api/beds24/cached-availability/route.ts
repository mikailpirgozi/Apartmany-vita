import { NextRequest, NextResponse } from 'next/server';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { availabilityCache, cacheUtils, CACHE_TTL } from '@/lib/cache';
import { getBeds24Service } from '@/services/beds24';
import { APARTMENTS } from '@/constants';
import { z } from 'zod';

// Request validation schema
const CachedAvailabilitySchema = z.object({
  apartment: z.string().min(1, 'Apartment slug is required'),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  guests: z.coerce.number().min(1).max(20, 'Guests must be between 1 and 20'),
  forceRefresh: z.coerce.boolean().optional().default(false),
});

// Response schema
const AvailabilityResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  cached: z.boolean(),
  cacheKey: z.string(),
  loadTime: z.number(),
  source: z.enum(['redis', 'memory', 'api']),
});

/**
 * GET /api/beds24/cached-availability
 * Cache-first availability endpoint with Redis + memory fallback
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  let source: 'redis' | 'memory' | 'api' = 'api';
  
  try {
    // Parse and validate query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const validatedParams = CachedAvailabilitySchema.parse(searchParams);
    
    const { apartment, month, guests, forceRefresh } = validatedParams;

    // Find apartment configuration
    const apartmentConfig = APARTMENTS.find(apt => apt.slug === apartment);
    if (!apartmentConfig) {
      return NextResponse.json(
        AvailabilityResponseSchema.parse({
          success: false,
          error: `Apartment '${apartment}' not found`,
          cached: false,
          cacheKey: '',
          loadTime: Date.now() - startTime,
          source: 'api'
        }),
        { status: 404 }
      );
    }

    // Generate cache key
    const cacheKey = cacheUtils.getAvailabilityKey(apartment, month, guests);
    
    // Calculate month boundaries
    const monthDate = parseISO(`${month}-01`);
    const monthStart = format(startOfMonth(monthDate), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(monthDate), 'yyyy-MM-dd');

    let data = null;
    // let cached = false;

    // 1. Try cache first (unless force refresh)
    if (!forceRefresh) {
      data = await availabilityCache.getAvailability(cacheKey);
      if (data) {
        // cached = true;
        source = 'redis'; // Cache layer will log the actual source
        
        console.log(`✅ Cache HIT for ${apartment} ${month} (${guests} guests)`);
        
        return NextResponse.json(
          AvailabilityResponseSchema.parse({
            success: true,
            data,
            cached: true,
            cacheKey,
            loadTime: Date.now() - startTime,
            source
          }),
          {
            headers: {
              'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
              'X-Cache-Status': 'HIT',
              'X-Cache-Key': cacheKey,
            }
          }
        );
      }
    }

    // 2. Cache miss - fetch from Beds24 API
    console.log(`❌ Cache MISS for ${apartment} ${month} (${guests} guests) - fetching from API`);
    
    try {
      data = await getBeds24Service().getInventory({
        propId: apartmentConfig.propId,
        roomId: apartmentConfig.roomId,
        startDate: monthStart,
        endDate: monthEnd,
        adults: guests,
      });

      if (!data) {
        throw new Error('No data received from Beds24 API');
      }

      // 3. Store in cache for future requests
      await availabilityCache.setAvailability(cacheKey, data, CACHE_TTL.AVAILABILITY);
      
      console.log(`✅ API data fetched and cached for ${apartment} ${month}`);
      
      return NextResponse.json(
        AvailabilityResponseSchema.parse({
          success: true,
          data,
          cached: false,
          cacheKey,
          loadTime: Date.now() - startTime,
          source: 'api'
        }),
        {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            'X-Cache-Status': 'MISS',
            'X-Cache-Key': cacheKey,
          }
        }
      );

    } catch (apiError) {
      console.error(`❌ Beds24 API error for ${apartment} ${month}:`, apiError);
      
      // Try to serve stale cache data if available
      const staleData = await availabilityCache.getAvailability(cacheKey);
      if (staleData) {
        console.log(`⚠️ Serving stale cache data for ${apartment} ${month}`);
        
        return NextResponse.json(
          AvailabilityResponseSchema.parse({
            success: true,
            data: staleData,
            cached: true,
            cacheKey,
            loadTime: Date.now() - startTime,
            source: 'redis'
          }),
          {
            headers: {
              'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
              'X-Cache-Status': 'STALE',
              'X-Cache-Key': cacheKey,
            }
          }
        );
      }

      // No cache data available - return error
      return NextResponse.json(
        AvailabilityResponseSchema.parse({
          success: false,
          error: `Failed to fetch availability data: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`,
          cached: false,
          cacheKey,
          loadTime: Date.now() - startTime,
          source: 'api'
        }),
        { 
          status: 503,
          headers: {
            'X-Cache-Status': 'ERROR',
            'X-Cache-Key': cacheKey,
          }
        }
      );
    }

  } catch (error) {
    console.error('❌ Cached availability endpoint error:', error);
    
    return NextResponse.json(
      AvailabilityResponseSchema.parse({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        cached: false,
        cacheKey: '',
        loadTime: Date.now() - startTime,
        source: 'api'
      }),
      { 
        status: 500,
        headers: {
          'X-Cache-Status': 'ERROR',
        }
      }
    );
  }
}

/**
 * POST /api/beds24/cached-availability
 * Batch availability endpoint for multiple apartments/months
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    
    const BatchRequestSchema = z.object({
      requests: z.array(z.object({
        apartment: z.string(),
        month: z.string().regex(/^\d{4}-\d{2}$/),
        guests: z.number().min(1).max(20),
      })).min(1).max(10), // Limit batch size
      forceRefresh: z.boolean().optional().default(false),
    });

    const { requests, forceRefresh } = BatchRequestSchema.parse(body);
    
    // Process requests in parallel
    const results = await Promise.allSettled(
      requests.map(async (req) => {
        const { apartment, month, guests } = req;
        const cacheKey = cacheUtils.getAvailabilityKey(apartment, month, guests);
        
        // Find apartment config
        const apartmentConfig = APARTMENTS.find(apt => apt.slug === apartment);
        if (!apartmentConfig) {
          throw new Error(`Apartment '${apartment}' not found`);
        }

        let data = null;
        let cached = false;
        let source: 'redis' | 'memory' | 'api' = 'api';

        // Try cache first
        if (!forceRefresh) {
          data = await availabilityCache.getAvailability(cacheKey);
          if (data) {
            cached = true;
            source = 'redis';
            return { apartment, month, guests, data, cached, source, cacheKey };
          }
        }

        // Fetch from API
        const monthDate = parseISO(`${month}-01`);
        const monthStart = format(startOfMonth(monthDate), 'yyyy-MM-dd');
        const monthEnd = format(endOfMonth(monthDate), 'yyyy-MM-dd');

        data = await getBeds24Service().getInventory({
          propId: apartmentConfig.propId,
          roomId: apartmentConfig.roomId,
          startDate: monthStart,
          endDate: monthEnd,
          adults: guests,
        });

        // Cache the result
        await availabilityCache.setAvailability(cacheKey, data, CACHE_TTL.AVAILABILITY);

        return { apartment, month, guests, data, cached: false, source: 'api', cacheKey };
      })
    );

    // Process results
    const successful = results
      .filter((result): result is PromiseFulfilledResult<unknown> => result.status === 'fulfilled')
      .map(result => result.value as unknown);
    
    const failed = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(result => result.reason);

    return NextResponse.json({
      success: true,
      results: successful,
      errors: failed.map(err => err instanceof Error ? err.message : String(err)),
      totalRequests: requests.length,
      successfulRequests: successful.length,
      failedRequests: failed.length,
      loadTime: Date.now() - startTime,
    });

  } catch (error) {
    console.error('❌ Batch cached availability error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        loadTime: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/beds24/cached-availability
 * Cache invalidation endpoint
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    
    const InvalidationSchema = z.object({
      apartment: z.string().optional(),
      pattern: z.string().optional(),
      clearAll: z.coerce.boolean().optional().default(false),
    });

    const { apartment, pattern, clearAll } = InvalidationSchema.parse(searchParams);

    if (clearAll) {
      await availabilityCache.clearAll();
      console.log('🗑️ Cleared all cache entries');
      
      return NextResponse.json({
        success: true,
        message: 'All cache entries cleared',
      });
    }

    if (apartment) {
      const invalidationPattern = cacheUtils.getInvalidationPattern(apartment);
      await availabilityCache.invalidatePattern(invalidationPattern);
      console.log(`🗑️ Invalidated cache for apartment: ${apartment}`);
      
      return NextResponse.json({
        success: true,
        message: `Cache invalidated for apartment: ${apartment}`,
      });
    }

    if (pattern) {
      await availabilityCache.invalidatePattern(pattern);
      console.log(`🗑️ Invalidated cache matching pattern: ${pattern}`);
      
      return NextResponse.json({
        success: true,
        message: `Cache invalidated for pattern: ${pattern}`,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'No invalidation criteria provided',
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Cache invalidation error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
