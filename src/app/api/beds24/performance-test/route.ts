import { NextRequest, NextResponse } from 'next/server';
import { beds24Service } from '@/services/beds24';
import { beds24OptimizedService } from '@/services/beds24-optimized';

/**
 * Performance comparison endpoint for Phase 2 testing
 * Compares old vs optimized Beds24 service performance
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const apartment = searchParams.get('apartment') || 'design-apartman';
  const checkIn = searchParams.get('checkIn') || '2024-01-15';
  const checkOut = searchParams.get('checkOut') || '2024-01-20';
  const guests = parseInt(searchParams.get('guests') || '2');
  const children = parseInt(searchParams.get('children') || '0');
  const iterations = parseInt(searchParams.get('iterations') || '3');

  // Apartment mapping
  const apartmentMapping: Record<string, { propId: string; roomId: string }> = {
    'design-apartman': { propId: '227484', roomId: '483027' },
    'lite-apartman': { propId: '168900', roomId: '357932' },
    'deluxe-apartman': { propId: '161445', roomId: '357931' },
    'maly-apartman': { propId: '357931', roomId: '357931' }
  };

  const apartmentConfig = apartmentMapping[apartment];
  if (!apartmentConfig) {
    return NextResponse.json({
      success: false,
      error: `Unknown apartment: ${apartment}`
    }, { status: 400 });
  }

  console.log(`🧪 Starting performance test for ${apartment} (${iterations} iterations)`);

  const results = {
    apartment,
    checkIn,
    checkOut,
    guests,
    children,
    iterations,
    oldService: {
      times: [] as number[],
      averageTime: 0,
      minTime: 0,
      maxTime: 0,
      errors: 0
    },
    optimizedService: {
      times: [] as number[],
      averageTime: 0,
      minTime: 0,
      maxTime: 0,
      errors: 0,
      cacheStats: {}
    },
    improvement: {
      averageSpeedup: 0,
      percentageImprovement: 0,
      cacheHitRate: 0
    }
  };

  // Test old service
  console.log('🔄 Testing old service...');
  for (let i = 0; i < iterations; i++) {
    try {
      const startTime = Date.now();
      await beds24Service.getInventoryOffers({
        propId: apartmentConfig.propId,
        roomId: apartmentConfig.roomId,
        startDate: checkIn,
        endDate: checkOut,
        adults: guests,
        children: children
      });
      const endTime = Date.now();
      const duration = endTime - startTime;
      results.oldService.times.push(duration);
      console.log(`  Iteration ${i + 1}: ${duration}ms`);
    } catch (error) {
      console.error(`  Iteration ${i + 1} failed:`, error);
      results.oldService.errors++;
    }
    
    // Wait 2 seconds between calls (rate limiting)
    if (i < iterations - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Clear cache before testing optimized service
  beds24OptimizedService.clearCache();

  // Test optimized service
  console.log('🚀 Testing optimized service...');
  for (let i = 0; i < iterations; i++) {
    try {
      const startTime = Date.now();
      await beds24OptimizedService.getAvailabilityWithDeduplication({
        propId: apartmentConfig.propId,
        roomId: apartmentConfig.roomId,
        startDate: checkIn,
        endDate: checkOut,
        numAdults: guests,
        numChildren: children
      });
      const endTime = Date.now();
      const duration = endTime - startTime;
      results.optimizedService.times.push(duration);
      console.log(`  Iteration ${i + 1}: ${duration}ms`);
    } catch (error) {
      console.error(`  Iteration ${i + 1} failed:`, error);
      results.optimizedService.errors++;
    }
    
    // Shorter wait for optimized service (1 second)
    if (i < iterations - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Calculate statistics
  if (results.oldService.times.length > 0) {
    results.oldService.averageTime = results.oldService.times.reduce((a, b) => a + b, 0) / results.oldService.times.length;
    results.oldService.minTime = Math.min(...results.oldService.times);
    results.oldService.maxTime = Math.max(...results.oldService.times);
  }

  if (results.optimizedService.times.length > 0) {
    results.optimizedService.averageTime = results.optimizedService.times.reduce((a, b) => a + b, 0) / results.optimizedService.times.length;
    results.optimizedService.minTime = Math.min(...results.optimizedService.times);
    results.optimizedService.maxTime = Math.max(...results.optimizedService.times);
    results.optimizedService.cacheStats = beds24OptimizedService.getCacheStats();
  }

  // Calculate improvements
  if (results.oldService.averageTime > 0 && results.optimizedService.averageTime > 0) {
    results.improvement.averageSpeedup = results.oldService.averageTime / results.optimizedService.averageTime;
    results.improvement.percentageImprovement = ((results.oldService.averageTime - results.optimizedService.averageTime) / results.oldService.averageTime) * 100;
  }

  const cacheStats = beds24OptimizedService.getCacheStats();
  results.improvement.cacheHitRate = cacheStats.hitRate;

  console.log('📊 Performance test results:', {
    oldAverage: `${results.oldService.averageTime.toFixed(0)}ms`,
    optimizedAverage: `${results.optimizedService.averageTime.toFixed(0)}ms`,
    speedup: `${results.improvement.averageSpeedup.toFixed(2)}x`,
    improvement: `${results.improvement.percentageImprovement.toFixed(1)}%`,
    cacheHitRate: `${results.improvement.cacheHitRate.toFixed(1)}%`
  });

  return NextResponse.json({
    success: true,
    testResults: results,
    summary: {
      oldServiceAverage: `${results.oldService.averageTime.toFixed(0)}ms`,
      optimizedServiceAverage: `${results.optimizedService.averageTime.toFixed(0)}ms`,
      speedupFactor: `${results.improvement.averageSpeedup.toFixed(2)}x`,
      percentageImprovement: `${results.improvement.percentageImprovement.toFixed(1)}%`,
      cacheHitRate: `${results.improvement.cacheHitRate.toFixed(1)}%`,
      recommendation: results.improvement.percentageImprovement > 30 
        ? '✅ Significant improvement achieved!' 
        : results.improvement.percentageImprovement > 10 
        ? '⚠️ Moderate improvement' 
        : '❌ Minimal improvement'
    }
  });
}

/**
 * POST endpoint for batch performance testing
 */
export async function POST(request: NextRequest) {
  try {
    const { apartments, startDate, endDate, adults, children = 0 } = await request.json();
    
    if (!apartments || !Array.isArray(apartments) || apartments.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'apartments array is required'
      }, { status: 400 });
    }

    console.log(`🧪 Starting batch performance test for ${apartments.length} apartments`);

    const batchStartTime = Date.now();
    
    // Test batch API
    const batchResult = await beds24OptimizedService.getBatchAvailability({
      apartments: apartments.map((apt: any) => ({
        slug: apt.slug,
        propId: apt.propId,
        roomId: apt.roomId
      })),
      startDate,
      endDate,
      adults,
      children
    });

    const batchEndTime = Date.now();
    const batchTotalTime = batchEndTime - batchStartTime;

    // Compare with individual requests
    const individualStartTime = Date.now();
    const individualPromises = apartments.map(async (apt: any) => {
      return beds24OptimizedService.getAvailabilityWithDeduplication({
        propId: apt.propId,
        roomId: apt.roomId,
        startDate,
        endDate,
        numAdults: adults,
        numChildren: children
      });
    });

    await Promise.all(individualPromises);
    const individualEndTime = Date.now();
    const individualTotalTime = individualEndTime - individualStartTime;

    const results = {
      apartments: apartments.length,
      batchTime: batchTotalTime,
      individualTime: individualTotalTime,
      speedup: individualTotalTime / batchTotalTime,
      percentageImprovement: ((individualTotalTime - batchTotalTime) / individualTotalTime) * 100,
      batchResult: batchResult.timing,
      cacheStats: beds24OptimizedService.getCacheStats()
    };

    console.log('📊 Batch performance results:', results);

    return NextResponse.json({
      success: true,
      results,
      summary: {
        apartmentCount: apartments.length,
        batchTime: `${batchTotalTime}ms`,
        individualTime: `${individualTotalTime}ms`,
        speedup: `${results.speedup.toFixed(2)}x`,
        improvement: `${results.percentageImprovement.toFixed(1)}%`,
        recommendation: results.percentageImprovement > 50 
          ? '✅ Excellent batch performance!' 
          : results.percentageImprovement > 20 
          ? '⚠️ Good batch performance' 
          : '❌ Batch may not be beneficial'
      }
    });

  } catch (error) {
    console.error('❌ Batch performance test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
