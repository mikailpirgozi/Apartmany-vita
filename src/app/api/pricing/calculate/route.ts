import { NextRequest, NextResponse } from 'next/server';
import { calculateBookingPrice } from '@/services/pricing';
import { z } from 'zod';

const CalculatePricingSchema = z.object({
  apartmentId: z.string(),
  apartmentSlug: z.string(),
  basePrice: z.number(),
  checkIn: z.string().transform(str => new Date(str)),
  checkOut: z.string().transform(str => new Date(str)),
  guests: z.number().min(1).max(10),
  children: z.number().min(0).max(10),
  userId: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CalculatePricingSchema.parse(body);

    const pricing = await calculateBookingPrice(validatedData);

    return NextResponse.json(pricing);
  } catch (error) {
    console.error('Pricing calculation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to calculate pricing' },
      { status: 500 }
    );
  }
}

