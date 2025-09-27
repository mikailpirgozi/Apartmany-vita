import { NextRequest, NextResponse } from 'next/server';
import { beds24Service } from '@/services/beds24';

/**
 * Get apartment availability from Beds24
 * GET /api/beds24/availability?apartment=maly-apartman&startDate=2024-01-01&endDate=2024-01-07
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apartment = searchParams.get('apartment');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!apartment || !startDate || !endDate) {
      return NextResponse.json({
        success: false,
        message: 'Missing required parameters: apartment, startDate, endDate'
      }, { status: 400 });
    }

    // Map apartment slug to room ID - OPRAVENÉ ÚDAJE
    const apartmentRoomMapping: Record<string, string> = {
      'maly-apartman': process.env.BEDS24_ROOM_MALY || 'test_room_maly',
      'design-apartman': process.env.BEDS24_ROOM_DESIGN || '483027',
      'lite-apartman': process.env.BEDS24_ROOM_LITE || '357932',
      'deluxe-apartman': process.env.BEDS24_ROOM_DELUXE || '357931'
    };

    const roomId = apartmentRoomMapping[apartment];
    if (!roomId) {
      return NextResponse.json({
        success: false,
        message: `Unknown apartment: ${apartment}`
      }, { status: 400 });
    }

    const availability = await beds24Service.getAvailability({
      propId: process.env.BEDS24_PROP_ID || '161445',
      roomId,
      startDate,
      endDate
    });

    return NextResponse.json({
      success: true,
      data: availability,
      apartment,
      roomId,
      startDate,
      endDate
    });
  } catch (error) {
    console.error('Beds24 availability error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch availability',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
