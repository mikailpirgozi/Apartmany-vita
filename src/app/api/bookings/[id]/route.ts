import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Helper function to convert Decimal to number
 * Prevents "toNumber is not a function" error after JSON serialization
 */
const toNumber = (value: number | Decimal): number => {
  return typeof value === 'number' ? value : value.toNumber();
};

/**
 * DELETE /api/bookings/[id]
 * Cancel a booking if it's more than 7 days before check-in
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Validate booking exists and belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        apartment: true
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden - This booking does not belong to you' },
        { status: 403 }
      );
    }

    // Check if booking is already cancelled
    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Booking is already cancelled' },
        { status: 400 }
      );
    }

    // Check if booking is already completed
    if (booking.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot cancel completed booking' },
        { status: 400 }
      );
    }

    // Check 7-day cancellation policy
    const now = new Date();
    const checkInDate = new Date(booking.checkIn);
    const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilCheckIn < 7) {
      return NextResponse.json(
        { 
          error: 'Cannot cancel booking less than 7 days before check-in',
          daysUntilCheckIn 
        },
        { status: 400 }
      );
    }

    // Update booking status to CANCELLED
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    });

    // TODO: Cancel booking in Beds24 if beds24Id exists
    if (booking.beds24Id) {
      console.log(`🏨 TODO: Cancel booking in Beds24: ${booking.beds24Id}`);
      // This would require Beds24 API implementation
      // await cancelBeds24Booking(booking.beds24Id);
    }

    // TODO: Send cancellation email notification
    console.log(`📧 TODO: Send cancellation email to ${booking.guestEmail}`);
    // await sendCancellationEmail(booking);

    // Convert Decimal values to numbers before JSON serialization
    const bookingWithNumbers = {
      ...updatedBooking,
      totalPrice: toNumber(updatedBooking.totalPrice),
      discount: toNumber(updatedBooking.discount)
    };

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: bookingWithNumbers,
      daysUntilCheckIn
    });

  } catch (error) {
    console.error('❌ Error cancelling booking:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bookings/[id]
 * Get single booking detail for authenticated user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        apartment: true,
        extras: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden - This booking does not belong to you' },
        { status: 403 }
      );
    }

    // Calculate days until check-in
    const now = new Date();
    const checkInDate = new Date(booking.checkIn);
    const checkOutDate = new Date(booking.checkOut);
    const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const canCancel = daysUntilCheckIn >= 7 && booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED';
    const canReview = booking.status === 'COMPLETED' || (booking.status === 'CONFIRMED' && checkOutDate < now);

    // Convert Decimal values to numbers before JSON serialization
    const bookingWithNumbers = {
      ...booking,
      totalPrice: toNumber(booking.totalPrice),
      discount: toNumber(booking.discount),
      apartment: {
        ...booking.apartment,
        basePrice: toNumber(booking.apartment.basePrice)
      },
      extras: booking.extras?.map(extra => ({
        ...extra,
        price: toNumber(extra.price)
      }))
    };

    return NextResponse.json({
      success: true,
      booking: bookingWithNumbers,
      meta: {
        daysUntilCheckIn,
        canCancel,
        canReview
      }
    });

  } catch (error) {
    console.error('❌ Error fetching booking:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

