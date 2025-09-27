import { NextRequest, NextResponse } from 'next/server';
import { beds24Service } from '@/services/beds24';

/**
 * Get apartment availability from Beds24
 * GET /api/beds24/availability?apartment=maly-apartman&startDate=2024-01-01&endDate=2024-01-07
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apartmentSlug = searchParams.get('apartment');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!apartmentSlug || !startDate || !endDate) {
      return NextResponse.json({
        success: false,
        message: 'Missing required parameters: apartment, startDate, endDate'
      }, { status: 400 });
    }

    // Map apartment slug to Property ID + Room ID - 3 samostatné Properties
    const apartmentMapping: Record<string, { propId: string; roomId: string }> = {
      'design-apartman': {
        propId: process.env.BEDS24_PROP_ID_DESIGN || '227484',
        roomId: process.env.BEDS24_ROOM_ID_DESIGN || '483027'
      },
      'lite-apartman': {
        propId: process.env.BEDS24_PROP_ID_LITE || '168900', 
        roomId: process.env.BEDS24_ROOM_ID_LITE || '357932'
      },
      'deluxe-apartman': {
        propId: process.env.BEDS24_PROP_ID_DELUXE || '161445',
        roomId: process.env.BEDS24_ROOM_ID_DELUXE || '357931'
      }
    };

    const apartmentData = apartmentMapping[apartmentSlug];
    if (!apartmentData) {
      return NextResponse.json({
        success: false,
        message: `Unknown apartment: ${apartmentSlug}`
      }, { status: 400 });
    }

    const availability = await beds24Service.getAvailability({
      propId: apartmentData.propId,
      roomId: apartmentData.roomId,
      startDate,
      endDate
    });

    return NextResponse.json({
      success: true,
      data: availability,
      apartment: apartmentSlug,
      propId: apartmentData.propId,
      roomId: apartmentData.roomId,
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
