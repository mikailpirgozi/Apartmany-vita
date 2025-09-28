import { NextRequest, NextResponse } from 'next/server';
import { getBeds24Service } from '@/services/beds24';

/**
 * Test endpoint to verify the fixed parsing logic for date ranges
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propId = searchParams.get('propId') || '161445';
    const roomId = searchParams.get('roomId') || '357931';
    const startDate = searchParams.get('startDate') || '2025-12-27';
    const endDate = searchParams.get('endDate') || '2026-01-17';

    console.log('🧪 Testing FIXED parsing logic:', { 
      propId, roomId, startDate, endDate 
    });

    // Test the fixed Calendar API parsing
    const calendarResult = await getBeds24Service().getInventoryCalendar({
      propId,
      roomId,
      startDate,
      endDate
    });

    console.log('✅ Fixed parsing result:', {
      available: calendarResult.available.length,
      booked: calendarResult.booked.length,
      availableDates: calendarResult.available.slice(0, 5),
      bookedDates: calendarResult.booked.slice(0, 5),
      prices: Object.keys(calendarResult.prices).length
    });

    return NextResponse.json({
      success: true,
      data: {
        result: calendarResult,
        summary: {
          totalAvailable: calendarResult.available.length,
          totalBooked: calendarResult.booked.length,
          totalPrices: Object.keys(calendarResult.prices).length,
          availableDates: calendarResult.available,
          bookedDates: calendarResult.booked,
          prices: calendarResult.prices
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Fixed parsing test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
