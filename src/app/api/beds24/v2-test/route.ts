import { NextRequest, NextResponse } from 'next/server';
import { beds24Service } from '@/services/beds24';

/**
 * Test Beds24 API V2 integration
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get('test') || 'availability';
    
    console.log('Testing Beds24 API V2 with test type:', testType);
    
    switch (testType) {
      case 'availability':
        // Test availability endpoint
        const availabilityResult = await beds24Service.getAvailability({
          propId: '357931',
          startDate: '2024-12-01',
          endDate: '2024-12-31'
        });
        
        return NextResponse.json({
          success: true,
          testType: 'availability',
          data: availabilityResult,
          message: 'Availability test successful'
        });
        
      case 'rates':
        // Test rates endpoint
        const ratesResult = await beds24Service.getRoomRates(
          '357931',
          '357931',
          '2024-12-01',
          '2024-12-31'
        );
        
        return NextResponse.json({
          success: true,
          testType: 'rates',
          data: ratesResult,
          message: 'Rates test successful'
        });
        
      case 'bookings':
        // Test bookings endpoint
        const bookingsResult = await beds24Service.getBooking('test-booking-id');
        
        return NextResponse.json({
          success: true,
          testType: 'bookings',
          data: bookingsResult,
          message: 'Bookings test successful'
        });
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid test type. Use: availability, rates, or bookings'
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Beds24 V2 test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Beds24 V2 test failed'
    }, { status: 500 });
  }
}

/**
 * Test booking creation with V2 API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Testing Beds24 V2 booking creation:', body);
    
    const bookingResult = await beds24Service.createBooking({
      propId: body.propId || '357931',
      roomId: body.roomId || '357931',
      checkIn: body.checkIn || '2024-12-15',
      checkOut: body.checkOut || '2024-12-17',
      numAdult: body.numAdult || 2,
      numChild: body.numChild || 0,
      guestFirstName: body.guestFirstName || 'Test',
      guestName: body.guestName || 'User',
      guestEmail: body.guestEmail || 'test@example.com',
      guestPhone: body.guestPhone || '+421123456789',
      totalPrice: body.totalPrice || 200,
      bookingId: body.bookingId || `test-${Date.now()}`
    });
    
    return NextResponse.json({
      success: true,
      data: bookingResult,
      message: 'Booking creation test successful'
    });
    
  } catch (error) {
    console.error('Beds24 V2 booking test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Beds24 V2 booking test failed'
    }, { status: 500 });
  }
}
