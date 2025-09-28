import { NextRequest, NextResponse } from 'next/server';
import { beds24Service } from '@/services/beds24';

/**
 * Test Availability API endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propId = searchParams.get('propId') || '161445'; // Deluxe property
    const roomId = searchParams.get('roomId') || '357931'; // Deluxe room
    const startDate = searchParams.get('startDate') || '2024-11-01';
    const endDate = searchParams.get('endDate') || '2024-11-02';
    const adults = searchParams.get('adults');
    const children = searchParams.get('children');

    console.log('🧪 Testing Availability API:', { 
      propId, roomId, startDate, endDate, adults, children 
    });

    const requestParams: any = {
      propId,
      roomId,
      startDate,
      endDate
    };

    // Add guest parameters if provided
    if (adults) {
      requestParams.numAdults = parseInt(adults);
    }
    if (children) {
      requestParams.numChildren = parseInt(children);
    }

    const result = await beds24Service.getAvailability(requestParams);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Availability API test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
