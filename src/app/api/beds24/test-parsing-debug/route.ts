import { NextRequest, NextResponse } from 'next/server';

/**
 * Debug endpoint to test date range parsing logic
 */
export async function GET(request: NextRequest) {
  try {
    // Simulate the problematic raw data
    const mockCalendarData = [
      {
        "from": "2025-10-26",
        "to": "2025-10-30",
        "numAvail": 1,
        "minStay": 1,
        "maxStay": 365,
        "override": "none",
        "multiplier": 1,
        "price1": 125
      },
      {
        "from": "2025-10-31",
        "to": "2025-10-31",
        "numAvail": 1,
        "minStay": 1,
        "maxStay": 365,
        "override": "none",
        "multiplier": 1,
        "price1": 130
      }
    ];

    console.log('🔍 Testing date range parsing with mock data');

    // Create a map of date -> calendar info
    const calendarMap: Record<string, { 
      available: boolean; 
      price?: number; 
      blocked?: boolean;
      status?: string;
      numAvail?: number;
    }> = {};

    // Process each calendar item
    mockCalendarData.forEach((item: any, index: number) => {
      let dates: string[] = [];
      let price: number | null = null;
      let isAvailable = true;
      let isBlocked = false;
      let numAvail: number | null = null;

      // Handle date ranges (from/to)
      if ('from' in item && 'to' in item && 
          typeof item.from === 'string' && typeof item.to === 'string') {
        // Generate all dates in range
        const fromDate = new Date(item.from);
        const toDate = new Date(item.to);
        
        for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          dates.push(dateStr);
          console.log(`  📅 Generated date: ${dateStr} (${d.toISOString()})`);
        }
        
        console.log(`📅 Range ${index + 1}: ${item.from} to ${item.to} (${dates.length} dates)`);
      }

      // Number available field
      if ('numAvail' in item && typeof item.numAvail === 'number') {
        numAvail = item.numAvail;
      }

      // Check numAvail (0 = not available)
      if (numAvail !== null && numAvail === 0) {
        isAvailable = false;
        isBlocked = true;
        console.log(`🚫 Blocked dates with numAvail=0: ${dates.join(', ')}`);
      }

      // Price field
      if ('price1' in item && typeof item.price1 === 'number') {
        price = item.price1;
      }

      // Apply settings to all dates in range
      dates.forEach(date => {
        console.log(`📅 Setting ${date}: available=${isAvailable}, price=${price}, numAvail=${numAvail}`);
        calendarMap[date] = { 
          available: isAvailable,
          blocked: isBlocked,
          numAvail: numAvail || undefined,
          price: price || undefined
        };
      });
    });

    // Generate final results for specific dates
    const testDates = ['2025-10-29', '2025-10-30', '2025-10-31'];
    const results: Record<string, any> = {};

    testDates.forEach(date => {
      const calendar = calendarMap[date];
      results[date] = {
        hasCalendarData: !!calendar,
        available: calendar?.available || false,
        price: calendar?.price || null,
        numAvail: calendar?.numAvail || null
      };
    });

    return NextResponse.json({
      success: true,
      mockData: mockCalendarData,
      calendarMap,
      testResults: results,
      summary: {
        totalCalendarEntries: Object.keys(calendarMap).length,
        pricesFound: Object.values(calendarMap).filter(c => c.price).length
      }
    });

  } catch (error) {
    console.error('Parsing debug error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}