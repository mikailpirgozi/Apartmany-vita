import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { calculateLoyaltyTier, getLoyaltyDiscount } from '@/lib/loyalty'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user bookings stats
    const bookings = await prisma.booking.findMany({
      where: { 
        userId: session.user.id,
        status: 'COMPLETED'
      },
      select: {
        totalPrice: true,
        discount: true
      }
    })

    const totalBookings = bookings.length
    const totalSpent = bookings.reduce((sum, booking) => sum + Number(booking.totalPrice), 0)
    const totalSavings = bookings.reduce((sum, booking) => sum + Number(booking.discount), 0)

    // Calculate loyalty tier and current discount
    const loyaltyTier = calculateLoyaltyTier(totalBookings)
    const currentDiscount = getLoyaltyDiscount(loyaltyTier)

    // Get recent bookings
    const recentBookings = await prisma.booking.findMany({
      where: { userId: session.user.id },
      include: {
        apartment: {
          select: {
            name: true,
            images: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // Calculate next tier progress
    let nextTierBookings = 0
    let nextTierName = ''
    
    if (loyaltyTier === 'BRONZE') {
      nextTierBookings = 3 - totalBookings
      nextTierName = 'SILVER'
    } else if (loyaltyTier === 'SILVER') {
      nextTierBookings = 6 - totalBookings
      nextTierName = 'GOLD'
    }

    const stats = {
      totalBookings,
      totalSpent,
      totalSavings,
      loyaltyTier,
      currentDiscount: Math.round(currentDiscount * 100), // Convert to percentage
      nextTierBookings: Math.max(0, nextTierBookings),
      nextTierName,
      recentBookings
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Stats fetch error:', error)
    return NextResponse.json(
      { message: 'Nastala chyba pri načítavaní štatistík' },
      { status: 500 }
    )
  }
}
