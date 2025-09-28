import { NextRequest, NextResponse } from 'next/server';
import { beds24OptimizedService } from '@/services/beds24-optimized';
import type { BatchAvailabilityRequest } from '@/services/beds24-optimized';

/**
 * Batch API endpoint for fetching availability of multiple apartments
 * Phase 2: API Optimization - reduces API calls and improves performance
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: BatchAvailabilityRequest = await request.json();
    
    // Validate request
    if (!body.apartments || !Array.isArray(body.apartments) || body.apartments.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'apartments array is required and must not be empty'
      }, { status: 400 });
    }

    if (!body.startDate || !body.endDate) {
      return NextResponse.json({
        success: false,
        error: 'startDate and endDate are required'
      }, { status: 400 });
    }

    if (!body.adults || body.adults < 1) {
      return NextResponse.json({
        success: false,
        error: 'adults must be at least 1'
      }, { status: 400 });
    }

    console.log('🚀 Batch availability request:', {
      apartments: body.apartments.map(a => a.slug),
      dateRange: `${body.startDate} - ${body.endDate}`,
      guests: `${body.adults} adults, ${body.children || 0} children`
    });

    // Execute batch request
    const result = await beds24OptimizedService.getBatchAvailability(body);
    
    const totalTime = Date.now() - startTime;
    console.log(`🏁 Batch request completed in ${totalTime}ms`);

    // Add performance metrics to response
    const response = {
      ...result,
      performance: {
        ...result.timing,
        requestTime: totalTime,
        averageTimePerApartment: totalTime / body.apartments.length,
        cacheStats: beds24OptimizedService.getCacheStats()
      }
    };

    return NextResponse.json(response, {
      headers: {
        // Add caching headers for edge optimization
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'CDN-Cache-Control': 'public, s-maxage=300',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=300'
      }
    });

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error('❌ Batch availability error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timing: {
        totalTime,
        apiCalls: 0,
        cacheHits: 0,
        cacheMisses: 0
      }
    }, { status: 500 });
  }
}

/**
 * GET endpoint for testing batch functionality
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Default test request
  const testRequest: BatchAvailabilityRequest = {
    apartments: [
      { slug: 'design-apartman', propId: '227484', roomId: '483027' },
      { slug: 'lite-apartman', propId: '168900', roomId: '357932' },
      { slug: 'deluxe-apartman', propId: '161445', roomId: '357931' }
    ],
    startDate: searchParams.get('startDate') || '2024-01-15',
    endDate: searchParams.get('endDate') || '2024-01-20',
    adults: parseInt(searchParams.get('adults') || '2'),
    children: parseInt(searchParams.get('children') || '0')
  };

  console.log('🧪 Test batch request:', testRequest);

  try {
    const result = await beds24OptimizedService.getBatchAvailability(testRequest);
    
    return NextResponse.json({
      message: 'Batch availability test',
      request: testRequest,
      result,
      cacheStats: beds24OptimizedService.getCacheStats()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      request: testRequest
    }, { status: 500 });
  }
}
