import { NextRequest, NextResponse } from 'next/server';

/**
 * Test endpoint to simulate blocked dates and verify our parsing logic
 * This helps test the availability response when there are actually blocked dates
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propId = searchParams.get('propId') || '357931';
    const roomId = searchParams.get('roomId') || '357931';
    const startDate = searchParams.get('startDate') || '2025-01-01';
    const endDate = searchParams.get('endDate') || '2025-01-07';

    console.log('🧪 Testing blocked dates simulation:', { 
      propId, roomId, startDate, endDate 
    });

    const results: any = {
      timestamp: new Date().toISOString(),
      parameters: { propId, roomId, startDate, endDate },
      scenarios: {}
    };

    // Scenario 1: All dates available (current real situation)
    results.scenarios.allAvailable = {
      description: 'Current real situation - no blocked dates',
      mockCalendarData: {
        success: true,
        type: 'calendar',
        count: 0,
        data: []
      },
      expectedResult: {
        available: generateDateRange(startDate, endDate),
        booked: [],
        description: 'All dates should be available when no calendar data exists'
      }
    };

    // Scenario 2: Some dates blocked by status
    const blockedDates = ['2025-01-03', '2025-01-05'];
    results.scenarios.statusBlocked = {
      description: 'Some dates blocked with status="blocked"',
      mockCalendarData: {
        success: true,
        type: 'calendar',
        count: blockedDates.length,
        data: blockedDates.map(date => ({
          date,
          status: 'blocked',
          available: false,
          numAvail: 0
        }))
      },
      expectedResult: {
        available: generateDateRange(startDate, endDate).filter(d => !blockedDates.includes(d)),
        booked: blockedDates,
        description: 'Dates with status="blocked" should be in booked array'
      }
    };

    // Scenario 3: Some dates blocked by numAvail=0
    const zeroAvailDates = ['2025-01-02', '2025-01-06'];
    results.scenarios.zeroAvailability = {
      description: 'Some dates blocked with numAvail=0',
      mockCalendarData: {
        success: true,
        type: 'calendar',
        count: zeroAvailDates.length,
        data: zeroAvailDates.map(date => ({
          date,
          status: 'available',
          available: true,
          numAvail: 0 // This should make it blocked
        }))
      },
      expectedResult: {
        available: generateDateRange(startDate, endDate).filter(d => !zeroAvailDates.includes(d)),
        booked: zeroAvailDates,
        description: 'Dates with numAvail=0 should be in booked array even if status is available'
      }
    };

    // Scenario 4: Mixed availability with prices
    const mixedDates = [
      { date: '2025-01-01', available: true, price: 120 },
      { date: '2025-01-02', available: false, status: 'blocked' },
      { date: '2025-01-03', available: true, price: 135 },
      { date: '2025-01-04', numAvail: 0 }, // Should be blocked
      { date: '2025-01-05', available: true, price: 140 }
    ];
    results.scenarios.mixedAvailability = {
      description: 'Mixed availability with prices',
      mockCalendarData: {
        success: true,
        type: 'calendar',
        count: mixedDates.length,
        data: mixedDates
      },
      expectedResult: {
        available: ['2025-01-01', '2025-01-03', '2025-01-05', '2025-01-06', '2025-01-07'], // Dates not in calendar = available
        booked: ['2025-01-02', '2025-01-04'],
        prices: {
          '2025-01-01': 120,
          '2025-01-03': 135,
          '2025-01-05': 140
        },
        description: 'Should correctly parse mixed availability and include prices'
      }
    };

    // Test each scenario with our parsing logic
    const { beds24Service } = await import('@/services/beds24');
    
    for (const [scenarioName, scenario] of Object.entries(results.scenarios)) {
      try {
        console.log(`🧪 Testing scenario: ${scenarioName}`);
        
        // Use private method via bracket notation (for testing only)
        const parseMethod = (beds24Service as any).parseInventoryCalendarResponseV2;
        if (typeof parseMethod === 'function') {
          const parsedResult = parseMethod.call(beds24Service, (scenario as any).mockCalendarData, {
            propId,
            roomId,
            startDate,
            endDate
          });
          
          (scenario as any).actualResult = parsedResult;
          (scenario as any).testPassed = compareResults(parsedResult, (scenario as any).expectedResult);
        } else {
          (scenario as any).error = 'Could not access parsing method';
        }
      } catch (error) {
        (scenario as any).error = error instanceof Error ? error.message : String(error);
      }
    }

    // Generate overall test summary
    const passedTests = Object.values(results.scenarios).filter((s: any) => s.testPassed === true).length;
    const totalTests = Object.keys(results.scenarios).length;
    
    results.summary = {
      totalScenarios: totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      overallResult: passedTests === totalTests ? '✅ All tests passed' : `⚠️ ${totalTests - passedTests} tests failed`,
      recommendations: generateRecommendations(results.scenarios)
    };

    return NextResponse.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Blocked dates simulation test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Generate date range array
 */
function generateDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0]);
  }
  
  return dates;
}

/**
 * Compare actual vs expected results
 */
function compareResults(actual: any, expected: any): boolean {
  try {
    // Compare available dates
    if (!arraysEqual(actual.available || [], expected.available || [])) {
      console.log('❌ Available dates mismatch:', {
        actual: actual.available,
        expected: expected.available
      });
      return false;
    }
    
    // Compare booked dates
    if (!arraysEqual(actual.booked || [], expected.booked || [])) {
      console.log('❌ Booked dates mismatch:', {
        actual: actual.booked,
        expected: expected.booked
      });
      return false;
    }
    
    // Compare prices (if expected)
    if (expected.prices) {
      const actualPrices = actual.prices || {};
      for (const [date, price] of Object.entries(expected.prices)) {
        if (actualPrices[date] !== price) {
          console.log('❌ Price mismatch:', {
            date,
            actual: actualPrices[date],
            expected: price
          });
          return false;
        }
      }
    }
    
    console.log('✅ Test passed');
    return true;
  } catch (error) {
    console.log('❌ Test comparison error:', error);
    return false;
  }
}

/**
 * Check if two arrays are equal (order independent)
 */
function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, index) => val === sortedB[index]);
}

/**
 * Generate recommendations based on test results
 */
function generateRecommendations(scenarios: any): string[] {
  const recommendations: string[] = [];
  
  const failedScenarios = Object.entries(scenarios).filter(([_, scenario]: [string, any]) => 
    scenario.testPassed === false
  );
  
  if (failedScenarios.length === 0) {
    recommendations.push('✅ All parsing logic works correctly for blocked dates');
    recommendations.push('🔍 The issue is that Beds24 has no blocked dates for the tested period');
    recommendations.push('💡 Try testing with a different date range or manually block some dates in Beds24 admin');
  } else {
    recommendations.push('❌ Parsing logic needs fixes for the following scenarios:');
    failedScenarios.forEach(([name, scenario]: [string, any]) => {
      recommendations.push(`  - ${name}: ${scenario.description}`);
    });
  }
  
  return recommendations;
}
