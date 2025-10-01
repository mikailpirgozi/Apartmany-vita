import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id' },
        { status: 400 }
      );
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'total_details']
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get booking from metadata
    const bookingId = session.metadata?.bookingId;
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID not found in session' },
        { status: 400 }
      );
    }

    // Get booking details from database
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        apartment: true,
        user: true
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update booking status if payment was successful
    if (session.payment_status === 'paid' && booking.status === 'PENDING') {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CONFIRMED',
          updatedAt: new Date()
        }
      });
    }

    // Calculate tax amount (5% of subtotal)
    const totalAmount = (session.amount_total || 0) / 100; // Convert from cents
    const taxAmount = (session.total_details?.amount_tax || 0) / 100; // Convert from cents

    return NextResponse.json({
      bookingId: booking.id,
      apartmentName: booking.apartment.name,
      checkIn: booking.checkIn.toISOString(),
      checkOut: booking.checkOut.toISOString(),
      totalAmount,
      taxAmount,
      paymentStatus: session.payment_status,
      sessionStatus: session.status
    });

  } catch (error) {
    console.error('Error verifying session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


