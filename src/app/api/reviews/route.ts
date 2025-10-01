import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

const createReviewSchema = z.object({
  apartmentId: z.string().min(1),
  bookingId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(2000)
});

/**
 * POST /api/reviews
 * Create a new review for an apartment after checkout
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createReviewSchema.parse(body);

    // Verify booking exists and belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id: validatedData.bookingId },
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

    // Verify booking is completed or past checkout date
    const now = new Date();
    const checkOutDate = new Date(booking.checkOut);
    
    if (booking.status !== 'COMPLETED' && checkOutDate > now) {
      return NextResponse.json(
        { error: 'Cannot review before checkout date' },
        { status: 400 }
      );
    }

    // Check if user already reviewed this apartment
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        apartmentId: validatedData.apartmentId
      }
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this apartment' },
        { status: 400 }
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        rating: validatedData.rating,
        comment: validatedData.comment,
        userId: session.user.id,
        apartmentId: validatedData.apartmentId,
        isApproved: false // Requires admin approval
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        apartment: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully. It will be published after admin approval.',
      review
    });

  } catch (error) {
    console.error('❌ Error creating review:', error);
    
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
 * GET /api/reviews
 * Get reviews for an apartment (approved only for public, all for admin)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apartmentId = searchParams.get('apartmentId');
    const includeUnapproved = searchParams.get('includeUnapproved') === 'true';

    const session = await auth();
    const isAdmin = session?.user?.email && session.user.email === process.env.ADMIN_EMAIL;

    const whereClause: Record<string, unknown> = {
      ...(apartmentId && { apartmentId }),
      ...(!includeUnapproved || !isAdmin ? { isApproved: true } : {})
    };

    const reviews = await prisma.review.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        apartment: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      reviews
    });

  } catch (error) {
    console.error('❌ Error fetching reviews:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

