import { NextRequest, NextResponse } from 'next/server';
import { getBeds24Service } from '@/services/beds24';

/**
 * Test Blocked Dates API endpoint - specifically for testing manually blocked dates
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propId = searchParams.get('propId') || '161445'; // Deluxe property
    const roomId = searchParams.get('roomId') || '357931'; // Deluxe room
    const startDate = searchParams.get('startDate') || '2025-01-01';
    const endDate = searchParams.get('endDate') || '2025-01-31'; // Longer range to catch blocked dates

    console.log('🧪 Testing Blocked Dates API:', { 
      propId, roomId, startDate, endDate 
    });

    const results: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      parameters: { propId, roomId, startDate, endDate }
    };

    // Test 1: Raw Calendar API with detailed logging
    try {
      console.log('📅 Testing Raw Calendar API for blocked dates...');
      const accessToken = await getBeds24Service().ensureValidToken();
      
      const calendarUrl = new URL(`${process.env.BEDS24_BASE_URL || 'https://api.beds24.com/v2'}/inventory/rooms/calendar`);
      calendarUrl.searchParams.set('startDate', startDate);
      calendarUrl.searchParams.set('endDate', endDate);
      calendarUrl.searchParams.set('propertyId', propId);
      calendarUrl.searchParams.set('roomId', roomId);
      calendarUrl.searchParams.set('includePrices', 'true');
      calendarUrl.searchParams.set('includeNumAvail', 'true');
      calendarUrl.searchParams.set('includeMinStay', 'true');
      calendarUrl.searchParams.set('includeMaxStay', 'true');
      calendarUrl.searchParams.set('includeMultiplier', 'true');
      calendarUrl.searchParams.set('includeOverride', 'true');
      calendarUrl.searchParams.set('includeChannels', 'true');

      const calendarResponse = await fetch(calendarUrl.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'token': accessToken,
          'User-Agent': 'ApartmanyVita/1.0'
        }
      });

      if (calendarResponse.ok) {
        const rawCalendarData = await calendarResponse.json();
        
        // Analyze the raw data for blocked dates
        const analysis = analyzeCalendarData(rawCalendarData, startDate, endDate);
        
        results.rawCalendar = {
          success: true,
          status: calendarResponse.status,
          data: rawCalendarData,
          analysis: analysis
        };
      } else {
        const errorText = await calendarResponse.text();
        results.rawCalendar = {
          success: false,
          status: calendarResponse.status,
          error: errorText
        };
      }
    } catch (error) {
      results.rawCalendar = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }

    // Test 2: Processed Calendar API (our service)
    try {
      console.log('📅 Testing Processed Calendar API...');
      const processedCalendar = await getBeds24Service().getInventoryCalendar({
        propId,
        roomId,
        startDate,
        endDate
      });
      
      results.processedCalendar = {
        success: true,
        data: processedCalendar
      };
    } catch (error) {
      results.processedCalendar = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }

    // Test 3: Compare results
    if (results.rawCalendar.success && results.processedCalendar.success) {
      results.comparison = compareResults(
        results.rawCalendar.analysis,
        results.processedCalendar.data
      );
    }

    return NextResponse.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Blocked Dates API test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Analyze raw calendar data to identify blocked dates
 */
function analyzeCalendarData(data: Record<string, unknown>, startDate: string, endDate: string) {
  const analysis = {
    totalDates: 0,
    availableDates: 0,
    blockedDates: 0,
    datesWithZeroAvailability: [] as string[],
    datesWithFalseAvailability: [] as string[],
    datesWithStatusBlocked: [] as string[],
    datesWithStatusUnavailable: [] as string[],
    datesWithOverride: [] as string[],
    allDates: [] as Record<string, unknown>[],
    rawDataStructure: {}
  };

  // Generate date range
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    analysis.totalDates++;
    
    // Find corresponding data for this date
    let dateData = null;
    
    if (data && typeof data === 'object') {
      if ('data' in data && Array.isArray(data.data)) {
        dateData = (data.data as Record<string, unknown>[]).find((item: Record<string, unknown>) => 
          item.date === dateStr || item.day === dateStr
        );
      } else if ('calendar' in data && Array.isArray(data.calendar)) {
        dateData = (data.calendar as Record<string, unknown>[]).find((item: Record<string, unknown>) => 
          item.date === dateStr || item.day === dateStr
        );
      } else if (Array.isArray(data)) {
        dateData = (data as Record<string, unknown>[]).find((item: Record<string, unknown>) => 
          item.date === dateStr || item.day === dateStr
        );
      }
    }
    
    if (dateData) {
      analysis.allDates.push({
        date: dateStr,
        rawData: dateData
      });
      
      // Check various blocking indicators
      if (dateData.available === 0) {
        analysis.datesWithZeroAvailability.push(dateStr);
        analysis.blockedDates++;
      } else if (dateData.available === false) {
        analysis.datesWithFalseAvailability.push(dateStr);
        analysis.blockedDates++;
      } else if (dateData.status === 'blocked' || dateData.status === 'unavailable') {
        if (dateData.status === 'blocked') {
          analysis.datesWithStatusBlocked.push(dateStr);
        } else {
          analysis.datesWithStatusUnavailable.push(dateStr);
        }
        analysis.blockedDates++;
      } else if (dateData.override) {
        analysis.datesWithOverride.push(dateStr);
        // Check if override blocks the date
        if (dateData.override.available === false || dateData.override.available === 0) {
          analysis.blockedDates++;
        }
      } else {
        analysis.availableDates++;
      }
    } else {
      // No data for this date - assume available
      analysis.availableDates++;
    }
  }

  // Store raw data structure for debugging
  analysis.rawDataStructure = {
    hasData: !!data,
    dataType: Array.isArray(data) ? 'array' : typeof data,
    dataKeys: data && typeof data === 'object' ? Object.keys(data) : [],
    firstItem: data && Array.isArray(data) && data.length > 0 ? data[0] : null,
    sampleItems: data && Array.isArray(data) ? data.slice(0, 3) : null
  };

  return analysis;
}

/**
 * Compare raw analysis with processed results
 */
function compareResults(rawAnalysis: Record<string, unknown>, processedData: Record<string, unknown>) {
  const comparison = {
    rawAvailable: rawAnalysis.availableDates,
    processedAvailable: processedData.available?.length || 0,
    rawBlocked: rawAnalysis.blockedDates,
    processedBlocked: processedData.booked?.length || 0,
    discrepancies: [] as string[],
    summary: ''
  };

  // Check for discrepancies
  if (comparison.rawAvailable !== comparison.processedAvailable) {
    comparison.discrepancies.push(
      `Available dates mismatch: Raw=${comparison.rawAvailable}, Processed=${comparison.processedAvailable}`
    );
  }

  if (comparison.rawBlocked !== comparison.processedBlocked) {
    comparison.discrepancies.push(
      `Blocked dates mismatch: Raw=${comparison.rawBlocked}, Processed=${comparison.processedBlocked}`
    );
  }

  // Generate summary
  if (comparison.discrepancies.length === 0) {
    comparison.summary = '✅ Perfect match between raw and processed data';
  } else {
    comparison.summary = `⚠️ Found ${comparison.discrepancies.length} discrepancies`;
  }

  return comparison;
}
