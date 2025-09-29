import { NextRequest, NextResponse } from 'next/server';
import { getBeds24Service } from '@/services/beds24';
import { availabilityCache, CACHE_TTL } from '@/lib/cache';
import { analytics } from '@/lib/analytics';


/**
 * API endpoint pre získanie dostupnosti apartmánov
 * Používa sa v booking widget
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  console.log('🔥 API ENDPOINT CALLED - /api/beds24/availability');
  
  try {
    const { searchParams } = new URL(request.url);
    const apartment = searchParams.get('apartment');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guests = searchParams.get('guests') || '2';
    const children = searchParams.get('children') || '0';
    
    console.log('🔥 API PARAMS:', { apartment, checkIn, checkOut, guests, children });

    if (!apartment || !checkIn || !checkOut) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: apartment, checkIn, checkOut'
      }, { status: 400 });
    }

    // Mapovanie apartmánov na Beds24 IDs (CORRECTED based on API testing)
    const apartmentMapping: Record<string, { propId: string; roomId: string }> = {
      'design-apartman': { propId: '227484', roomId: '483027' }, // ✅ Correct
      'lite-apartman': { propId: '168900', roomId: '357932' },   // ✅ Correct  
      'deluxe-apartman': { propId: '161445', roomId: '357931' }, // 🔧 FIXED: Correct property ID
      'maly-apartman': { propId: '161445', roomId: '357931' }    // ✅ Same as deluxe for now
    };

    const apartmentConfig = apartmentMapping[apartment];
    if (!apartmentConfig) {
      return NextResponse.json({
        success: false,
        error: `Unknown apartment: ${apartment}`
      }, { status: 400 });
    }

    // 🚀 PHASE 3: Redis cache integration - use exact date range for cache key
    const cacheKey = `${apartment}:${checkIn}:${checkOut}:${guests}`;

    console.log(`Fetching availability for ${apartment}:`, {
      propId: apartmentConfig.propId,
      roomId: apartmentConfig.roomId,
      checkIn,
      checkOut,
      guests: parseInt(guests),
      children: parseInt(children),
      cacheKey
    });

    let availability: {
      available: string[];
      booked: string[];
      prices: Record<string, number>;
      minStay?: number;
      maxStay?: number;
    } | null = null;
    let cacheHit = false;
    let source: 'redis' | 'memory' | 'api' = 'api';

    // Try cache first
    try {
      availability = await availabilityCache.getAvailability(cacheKey);
      if (availability) {
        cacheHit = true;
        source = 'redis'; // Cache layer determines actual source
        console.log(`✅ Cache HIT for ${apartment} ${checkIn}-${checkOut}`);
        
        // Track cache hit
        analytics.trackApiRequest(
          '/api/beds24/availability',
          'GET',
          Date.now() - startTime,
          true,
          true,
          { apartment, cacheKey }
        );
      }
    } catch (cacheError) {
      console.warn('Cache error, falling back to API:', cacheError);
      analytics.trackError(
        cacheError instanceof Error ? cacheError : new Error('Cache error'),
        'cache-get',
        apartment
      );
    }

    // Cache miss - fetch from API
    if (!availability) {
      console.log(`❌ Cache MISS for ${apartment} - fetching from API`);
      
      try {
        // Check if BEDS24 environment variables are available
        const hasBeds24Config = process.env.BEDS24_ACCESS_TOKEN && process.env.BEDS24_REFRESH_TOKEN;
        console.log('🔍 BEDS24 Config Check:', {
          hasAccessToken: !!process.env.BEDS24_ACCESS_TOKEN,
          hasRefreshToken: !!process.env.BEDS24_REFRESH_TOKEN,
          hasBaseUrl: !!process.env.BEDS24_BASE_URL,
          nodeEnv: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV
        });
        
        if (!hasBeds24Config) {
          console.warn('⚠️ BEDS24 environment variables not available');
          return NextResponse.json({
            success: false,
            error: 'BEDS24 service not configured',
            available: [],
            booked: [],
            prices: {},
            minStay: 1,
            maxStay: 365
          });
        }
        
        // Use Calendar API directly for calendar display (has prices and blocked dates)
        try {
          const beds24Service = getBeds24Service();
          availability = await beds24Service.getInventoryCalendar({
            propId: apartmentConfig.propId,
            roomId: apartmentConfig.roomId,
            startDate: checkIn,
            endDate: checkOut
          });
        } catch (serviceError) {
          console.error('Beds24Service initialization failed:', serviceError);
          // If service initialization fails, return empty availability instead of throwing
          console.warn('⚠️ Beds24Service failed, returning empty availability');
          return NextResponse.json({
            success: true,
            apartment,
            checkIn,
            checkOut,
            isAvailable: false,
            totalPrice: 0,
            pricePerNight: 0,
            nights: 0,
            available: [],
            booked: [],
            prices: {},
            minStay: 1,
            maxStay: 30,
            bookedDates: [],
            dailyPrices: {},
            pricingInfo: {
              guestCount: parseInt(guests),
              childrenCount: parseInt(children),
              source: 'error',
              totalDays: 0,
              averagePricePerNight: 0,
              basePrice: 0,
              additionalGuestFee: 0,
              additionalGuestFeePerNight: 0,
              additionalAdults: 0,
              additionalChildren: 0
            },
            performance: {
              responseTime: Date.now() - startTime,
              cacheHit: false,
              source: 'error',
              cacheKey,
              cacheStats: { hits: 0, misses: 1, activeRequests: 0, hitRate: 0 },
              timestamp: new Date().toISOString()
            }
          });
        }

        // Store in cache for future requests
        if (availability) {
          try {
            await availabilityCache.setAvailability(cacheKey, availability, CACHE_TTL.AVAILABILITY);
            console.log(`✅ Cached availability for ${apartment}`);
          } catch (cacheError) {
            console.warn('Failed to cache availability:', cacheError);
          }
        }

        // Track API request
        analytics.trackApiRequest(
          '/api/beds24/availability',
          'GET',
          Date.now() - startTime,
          true,
          false,
          { apartment, cacheKey }
        );

      } catch (apiError) {
        console.error(`❌ API error for ${apartment}:`, apiError);
        
        // Track error
        analytics.trackError(
          apiError instanceof Error ? apiError : new Error('API error'),
          'beds24-api',
          apartment
        );

        // Try to serve stale cache data if available
        try {
          const staleData = await availabilityCache.getAvailability(cacheKey);
          if (staleData) {
            console.log(`⚠️ Serving stale cache data for ${apartment}`);
            availability = staleData;
            cacheHit = true;
            source = 'redis';
          }
        } catch (staleError) {
          console.warn('No stale cache data available:', staleError);
        }

        if (!availability) {
          // Return empty availability instead of error to prevent redirect
          const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown error';
          console.error('Final availability fetch failed, returning empty availability:', errorMessage);
          
          return NextResponse.json({
            success: true,
            apartment,
            checkIn,
            checkOut,
            isAvailable: false,
            totalPrice: 0,
            pricePerNight: 0,
            nights: 0,
            available: [],
            booked: [],
            prices: {},
            minStay: 1,
            maxStay: 30,
            bookedDates: [],
            dailyPrices: {},
            pricingInfo: {
              guestCount: parseInt(guests),
              childrenCount: parseInt(children),
              source: 'error',
              totalDays: 0,
              averagePricePerNight: 0,
              basePrice: 0,
              additionalGuestFee: 0,
              additionalGuestFeePerNight: 0,
              additionalAdults: 0,
              additionalChildren: 0
            },
            performance: {
              responseTime: Date.now() - startTime,
              cacheHit: false,
              source: 'error',
              cacheKey,
              cacheStats: { hits: 0, misses: 1, activeRequests: 0, hitRate: 0 },
              timestamp: new Date().toISOString()
            }
          });
        }
      }
    }

    // Ensure we have availability data
    if (!availability) {
      return NextResponse.json({
        success: true,
        apartment,
        checkIn,
        checkOut,
        isAvailable: false,
        totalPrice: 0,
        pricePerNight: 0,
        nights: 0,
        available: [],
        booked: [],
        prices: {},
        minStay: 1,
        maxStay: 30,
        bookedDates: [],
        dailyPrices: {},
        pricingInfo: {
          guestCount: parseInt(guests),
          childrenCount: parseInt(children),
          source: 'no-data',
          totalDays: 0,
          averagePricePerNight: 0,
          basePrice: 0,
          additionalGuestFee: 0,
          additionalGuestFeePerNight: 0,
          additionalAdults: 0,
          additionalChildren: 0
        },
        performance: {
          responseTime: Date.now() - startTime,
          cacheHit: false,
          source: 'no-data',
          cacheKey,
          cacheStats: { hits: 0, misses: 1, activeRequests: 0, hitRate: 0 },
          timestamp: new Date().toISOString()
        }
      });
    }

    // Skontroluj či sú všetky dni dostupné
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const requestedDates: string[] = [];
    
    for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
      requestedDates.push(d.toISOString().split('T')[0]);
    }

    const isAvailable = requestedDates.every(date => 
      availability!.available.includes(date)
    );

    // ✅ SKUTOČNÉ CENY Z BEDS24 OFFERS API!
    // Availability už obsahuje správne ceny pre daný počet hostí z offers API
    const guestCount = parseInt(guests);
    const childrenCount = parseInt(children);
    
    // Vypočítaj celkovú cenu len z dostupných dátumov (nie z obsadených)
    const availableDates = requestedDates.filter(date => 
      availability!.available.includes(date)
    );
    
    // Základná cena z Beds24 (pre 2 ľudí)
    const basePrice = availableDates.reduce((sum, date) => 
      sum + (availability!.prices[date] || 0), 0
    );
    
    // Dodatočné poplatky za hostí nad základ 2 ľudí (ZA KAŽDÚ NOC!)
    const additionalAdults = Math.max(0, guestCount - 2);
    const additionalChildren = Math.max(0, childrenCount);
    const additionalGuestFeePerNight = (additionalAdults * 20) + (additionalChildren * 10);
    const additionalGuestFee = additionalGuestFeePerNight * availableDates.length;
    
    // Celková cena = základná cena + poplatky za ďalších hostí
    const totalPrice = basePrice + additionalGuestFee;

    const response = {
      success: true,
      apartment,
      checkIn,
      checkOut,
      isAvailable,
      totalPrice,
      pricePerNight: availableDates.length > 0 ? totalPrice / availableDates.length : 0,
      nights: availableDates.length,
      // Calendar format - required by SimpleAvailabilityCalendar
      available: availability!.available || [],
      booked: availability!.booked || [],
      prices: availability!.prices || {},
      minStay: availability!.minStay || 1,
      maxStay: availability!.maxStay || 30,
      // Legacy format for backward compatibility
      bookedDates: availability!.booked.filter((date: string) => 
        requestedDates.includes(date)
      ),
      dailyPrices: requestedDates.reduce((acc: Record<string, number>, date: string) => {
        acc[date] = availability!.prices[date] || 0;
        return acc;
      }, {} as Record<string, number>),
      // Debug info pre ceny z Beds24 offers API
      pricingInfo: {
        guestCount,
        childrenCount,
        source: 'beds24-api',
        totalDays: availableDates.length,
        averagePricePerNight: Math.round(totalPrice / (availableDates.length || 1)),
        basePrice,
        additionalGuestFee,
        additionalGuestFeePerNight,
        additionalAdults,
        additionalChildren
      },
      // 🚀 PHASE 3: Enhanced performance metrics with cache info
      performance: {
        responseTime: Date.now() - startTime,
        cacheHit,
        source,
        cacheKey,
        cacheStats: { hits: 0, misses: 1, activeRequests: 0, hitRate: 0 },
        timestamp: new Date().toISOString()
      }
    };

    console.log('Availability response:', response);
    // Track calendar load performance
    analytics.trackCalendarLoad(
      apartment,
      Date.now() - startTime,
      cacheHit,
      source,
      { checkIn, checkOut, guests: parseInt(guests) }
    );

    return NextResponse.json(response, {
      headers: {
        // Enhanced caching headers based on cache status
        'Cache-Control': cacheHit 
          ? 'public, s-maxage=60, stale-while-revalidate=300'
          : 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Performance-Time': `${Date.now() - startTime}ms`,
        'X-Cache-Status': cacheHit ? 'HIT' : 'MISS',
        'X-Cache-Source': source,
        'X-Cache-Key': cacheKey
      }
    });

  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}