import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createBookingPaymentIntent } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { createApartmentBooking } from '@/services/beds24';

const createPaymentIntentSchema = z.object({
  amount: z.number().positive(),
  apartmentId: z.string(),
  guestEmail: z.string().email(),
  guestName: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  bookingData: z.object({
    checkIn: z.string().transform((str) => new Date(str)),
    checkOut: z.string().transform((str) => new Date(str)),
    guests: z.number().positive(),
    children: z.number().min(0)
  }),
  guestInfo: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string(),
    country: z.string(),
    city: z.string(),
    needsInvoice: z.boolean().optional(),
    companyName: z.string().optional(),
    companyId: z.string().optional(),
    companyVat: z.string().optional(),
    companyAddress: z.string().optional()
  }),
  pricing: z.object({
    total: z.number(),
    subtotal: z.number(),
    loyaltyDiscount: z.number(),
    cleaningFee: z.number(),
    cityTax: z.number(),
    nights: z.number()
  }),
  extrasTotal: z.number().min(0)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createPaymentIntentSchema.parse(body);

    // Get apartment details
    const apartment = await prisma.apartment.findUnique({
      where: { id: validatedData.apartmentId }
    });

    if (!apartment) {
      return NextResponse.json(
        { error: 'Apartment not found' },
        { status: 404 }
      );
    }

    // First, create or find user
    const user = await prisma.user.upsert({
      where: { email: validatedData.guestInfo.email },
      create: {
        email: validatedData.guestInfo.email,
        name: `${validatedData.guestInfo.firstName} ${validatedData.guestInfo.lastName}`,
        phone: validatedData.guestInfo.phone
      },
      update: {}
    });

    // Create booking record in database
    const booking = await prisma.booking.create({
      data: {
        checkIn: validatedData.bookingData.checkIn,
        checkOut: validatedData.bookingData.checkOut,
        guests: validatedData.bookingData.guests,
        children: validatedData.bookingData.children,
        totalPrice: validatedData.amount,
        discount: validatedData.pricing.loyaltyDiscount,
        status: 'PENDING',
        apartmentId: validatedData.apartmentId,
        userId: user.id,
        guestName: `${validatedData.guestInfo.firstName} ${validatedData.guestInfo.lastName}`,
        guestEmail: validatedData.guestInfo.email,
        guestPhone: validatedData.guestInfo.phone,
        // Company information
        needsInvoice: validatedData.guestInfo.needsInvoice || false,
        companyName: validatedData.guestInfo.companyName,
        companyId: validatedData.guestInfo.companyId,
        companyVat: validatedData.guestInfo.companyVat,
        companyAddress: validatedData.guestInfo.companyAddress
      },
      include: {
        user: true
      }
    });

    // Create payment intent with Stripe
    const paymentResult = await createBookingPaymentIntent({
      amount: validatedData.amount,
      bookingId: booking.id,
      apartmentId: validatedData.apartmentId,
      guestEmail: validatedData.guestInfo.email,
      guestName: validatedData.guestName,
      checkIn: validatedData.checkIn,
      checkOut: validatedData.checkOut
    });

    // Update booking with payment intent ID
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentId: paymentResult.paymentIntentId
      }
    });

    // Create booking in Beds24 (optional - can be done after payment confirmation)
    try {
      await createApartmentBooking(apartment.slug, {
        checkIn: validatedData.checkIn,
        checkOut: validatedData.checkOut,
        numAdult: validatedData.bookingData.guests,
        numChild: validatedData.bookingData.children,
        guestFirstName: validatedData.guestInfo.firstName,
        guestName: validatedData.guestInfo.lastName,
        guestEmail: validatedData.guestInfo.email,
        guestPhone: validatedData.guestInfo.phone,
        totalPrice: validatedData.amount,
        bookingId: booking.id
      });
    } catch (beds24Error) {
      console.error('Failed to create Beds24 booking:', beds24Error);
      // Don't fail the entire process - we can sync later
    }

    return NextResponse.json({
      clientSecret: paymentResult.clientSecret,
      bookingId: booking.id,
      paymentIntentId: paymentResult.paymentIntentId
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
