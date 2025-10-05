import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createCheckoutSession } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { createApartmentBooking } from '@/services/beds24';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limiter';

const createPaymentIntentSchema = z.object({
  amount: z.number().positive(),
  apartmentId: z.string(), // Can be either ID or slug
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
  extrasTotal: z.number().min(0),
  breakfastData: z.object({
    wantsBreakfast: z.boolean(),
    adults: z.number().min(0),
    children: z.number().min(0),
    delivery: z.boolean(),
    specialRequests: z.string()
  }).optional()
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimit = await checkRateLimit(request, RATE_LIMITS.PAYMENT);
    if (rateLimit.limited) {
      return NextResponse.json({
        error: rateLimit.message
      }, { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': RATE_LIMITS.PAYMENT.maxRequests.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString()
        }
      });
    }
    
    const body = await request.json();
    const validatedData = createPaymentIntentSchema.parse(body);

    // Get apartment details - try by ID first, then by slug
    let apartment = await prisma.apartment.findUnique({
      where: { id: validatedData.apartmentId }
    });

    // If not found by ID, try by slug
    if (!apartment) {
      apartment = await prisma.apartment.findUnique({
        where: { slug: validatedData.apartmentId }
      });
    }

    if (!apartment) {
      console.error('❌ Apartment not found:', {
        providedId: validatedData.apartmentId,
        attemptedBy: ['id', 'slug']
      });
      return NextResponse.json(
        { error: 'Apartment not found' },
        { status: 404 }
      );
    }

    console.log('✅ Found apartment:', {
      id: apartment.id,
      name: apartment.name,
      slug: apartment.slug
    });

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
        apartmentId: apartment.id, // Use actual DB ID, not the slug from request
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

    // Create breakfast order if requested
    if (validatedData.breakfastData?.wantsBreakfast) {
      const BREAKFAST_ADULT_PRICE = 9.90;
      const BREAKFAST_CHILD_PRICE = 5.90;
      
      const breakfastTotal = 
        (validatedData.breakfastData.adults * BREAKFAST_ADULT_PRICE) +
        (validatedData.breakfastData.children * BREAKFAST_CHILD_PRICE);

      await prisma.breakfastOrder.create({
        data: {
          bookingId: booking.id,
          adults: validatedData.breakfastData.adults,
          children: validatedData.breakfastData.children,
          adultPrice: BREAKFAST_ADULT_PRICE,
          childPrice: BREAKFAST_CHILD_PRICE,
          totalPrice: breakfastTotal,
          delivery: validatedData.breakfastData.delivery,
          specialRequests: validatedData.breakfastData.specialRequests || null
        }
      });

      console.log('✅ Breakfast order created:', {
        bookingId: booking.id,
        adults: validatedData.breakfastData.adults,
        children: validatedData.breakfastData.children,
        total: breakfastTotal,
        delivery: validatedData.breakfastData.delivery
      });
    }

    // Create Stripe Checkout Session with automatic tax
    const checkoutResult = await createCheckoutSession({
      amount: validatedData.amount,
      bookingId: booking.id,
      apartmentId: apartment.id, // Use actual DB ID for metadata
      apartmentName: apartment.name,
      guestEmail: validatedData.guestInfo.email,
      guestName: validatedData.guestName,
      checkIn: validatedData.checkIn,
      checkOut: validatedData.checkOut,
      nights: validatedData.pricing.nights
    });

    // Update booking with session ID
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentId: checkoutResult.sessionId
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
      sessionId: checkoutResult.sessionId,
      url: checkoutResult.url,
      bookingId: booking.id
    });

  } catch (error) {
    console.error('❌ Error creating payment intent:', error);

    // Zod validation errors
    if (error instanceof z.ZodError) {
      console.error('🔴 Validation error:', error.issues);
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    // Stripe-specific errors
    if (error && typeof error === 'object' && 'type' in error) {
      const stripeError = error as { 
        type: string; 
        message: string; 
        code?: string; 
        param?: string;
        raw?: unknown;
      };
      console.error('🔴 Stripe error details:', {
        type: stripeError.type,
        message: stripeError.message,
        code: stripeError.code,
        param: stripeError.param,
        raw: JSON.stringify(stripeError.raw || {})
      });
      
      return NextResponse.json(
        { 
          error: `Stripe error: ${stripeError.message}`,
          code: stripeError.code,
          type: stripeError.type,
          param: stripeError.param
        },
        { status: 500 }
      );
    }

    // Generic error with full details
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('🔴 Full error:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      errorObject: JSON.stringify(error, Object.getOwnPropertyNames(error || {}))
    });
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
