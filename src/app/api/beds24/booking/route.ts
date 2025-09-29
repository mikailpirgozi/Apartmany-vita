import { NextRequest, NextResponse } from 'next/server';
import { getBeds24Service } from '@/services/beds24';

/**
 * Create booking in Beds24
 * POST /api/beds24/booking
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      apartment: apartmentSlug,
      checkIn,
      checkOut,
      numAdult,
      numChild,
      guestFirstName,
      guestName,
      guestEmail,
      guestPhone,
      totalPrice
    } = body;

    // Validate required fields
    if (!apartmentSlug || !checkIn || !checkOut || !numAdult || !guestFirstName || !guestName || !guestEmail || !totalPrice) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
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

    const beds24Service = getBeds24Service();
    if (!beds24Service) {
      return NextResponse.json({
        success: false,
        message: 'Beds24 service not available'
      }, { status: 503 });
    }
    
    const booking = await beds24Service.createBooking({
      propId: apartmentData.propId,
      roomId: apartmentData.roomId,
      checkIn,
      checkOut,
      numAdult,
      numChild: numChild || 0,
      guestFirstName,
      guestName,
      guestEmail,
      guestPhone: guestPhone || '',
      totalPrice
    });

    return NextResponse.json({
      success: true,
      data: booking,
      message: 'Booking created successfully'
    });
  } catch (error) {
    console.error('Beds24 booking error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to create booking',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
