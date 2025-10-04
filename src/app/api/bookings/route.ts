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
 * GET /api/bookings
 * Get all bookings for the authenticated user
 * Query params:
 *  - status: 'upcoming' | 'past' | 'cancelled' | 'all'
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') || 'all';

    // Build where clause based on filter
    const now = new Date();
    let whereClause: Record<string, unknown> = {
      userId: session.user.id
    };

    switch (statusFilter) {
      case 'upcoming':
        whereClause = {
          ...whereClause,
          status: { in: ['PENDING', 'CONFIRMED'] },
          checkIn: { gte: now }
        };
        break;
      case 'past':
        whereClause = {
          ...whereClause,
          status: { in: ['CONFIRMED', 'COMPLETED'] },
          checkOut: { lt: now }
        };
        break;
      case 'cancelled':
        whereClause = {
          ...whereClause,
          status: 'CANCELLED'
        };
        break;
      case 'all':
      default:
        // No additional filter
        break;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        apartment: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: true,
            basePrice: true
          }
        },
        extras: true
      },
      orderBy: [
        { checkIn: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // Convert Decimal values to numbers before JSON serialization
    const bookingsWithNumbers = bookings.map(booking => ({
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
    }));

    return NextResponse.json({
      success: true,
      bookings: bookingsWithNumbers
    });

  } catch (error) {
    console.error('❌ Error fetching bookings:', error);
    
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

