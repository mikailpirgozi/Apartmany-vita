import { NextRequest, NextResponse } from 'next/server';
import { beds24Service } from '@/services/beds24';

/**
 * Create booking in Beds24
 * POST /api/beds24/booking
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      apartment,
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
    if (!apartment || !checkIn || !checkOut || !numAdult || !guestFirstName || !guestName || !guestEmail || !totalPrice) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
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

    const booking = await beds24Service.createBooking({
      propId: process.env.BEDS24_PROP_ID || 'default_prop_id',
      roomId,
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
