import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserStats } from '@/components/account/user-stats'
import { BookingsList } from '@/components/account/bookings-list'
import { TypographyH1, TypographyP } from '@/components/ui/typography'
import { LoyaltyTier } from '@/services/pricing'
import Link from 'next/link'
import { Settings, User, CreditCard } from 'lucide-react'
import { Decimal } from '@prisma/client/runtime/library'

/**
 * Helper function to convert Decimal to number
 * Prevents "toNumber is not a function" error after JSON serialization
 */
const toNumber = (value: number | Decimal): number => {
  return typeof value === 'number' ? value : value.toNumber();
}

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  try {
    // Get user with bookings (or create if doesn't exist - OAuth without adapter)
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        bookings: {
          include: { 
            apartment: {
              select: {
                name: true,
                images: true,
                basePrice: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    // If user doesn't exist in DB (OAuth without adapter), create them
    if (!user && session.user.email) {
      console.log('[Dashboard] Creating new OAuth user:', { 
        id: session.user.id, 
        email: session.user.email 
      })
      
      user = await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
          emailVerified: new Date(), // OAuth users are verified
        },
        include: {
          bookings: {
            include: { 
              apartment: {
                select: {
                  name: true,
                  images: true,
                  basePrice: true
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      })
      
      console.log('[Dashboard] User created successfully:', user.id)
    }

    if (!user) {
      redirect('/auth/signin')
    }

  // Calculate user stats
  const completedBookings = await prisma.booking.findMany({
    where: { 
      userId: session.user.id,
      status: 'COMPLETED'
    },
    select: {
      totalPrice: true,
      discount: true
    }
  })

  const totalBookings = completedBookings.length
  const totalSpent = completedBookings.reduce((sum, booking) => sum + Number(booking.totalPrice), 0)
  const totalSavings = completedBookings.reduce((sum, booking) => sum + Number(booking.discount), 0)

  // Calculate loyalty tier
  const calculateLoyaltyTier = (bookings: number): LoyaltyTier => {
    if (bookings >= 6) return LoyaltyTier.GOLD
    if (bookings >= 3) return LoyaltyTier.SILVER
    return LoyaltyTier.BRONZE
  }

  const loyaltyTier = calculateLoyaltyTier(totalBookings)
  
  const getCurrentDiscount = (tier: LoyaltyTier): number => {
    switch (tier) {
      case LoyaltyTier.GOLD: return 10
      case LoyaltyTier.SILVER: return 7
      case LoyaltyTier.BRONZE: return 5
    }
  }

  const getNextTierInfo = (tier: LoyaltyTier, currentBookings: number) => {
    if (tier === LoyaltyTier.BRONZE) {
      return {
        nextTierBookings: Math.max(0, 3 - currentBookings),
        nextTierName: 'SILVER'
      }
    } else if (tier === LoyaltyTier.SILVER) {
      return {
        nextTierBookings: Math.max(0, 6 - currentBookings),
        nextTierName: 'GOLD'
      }
    }
    return {
      nextTierBookings: 0,
      nextTierName: ''
    }
  }

  const nextTierInfo = getNextTierInfo(loyaltyTier, totalBookings)

  const stats = {
    totalBookings,
    totalSpent,
    totalSavings,
    loyaltyTier,
    currentDiscount: getCurrentDiscount(loyaltyTier),
    ...nextTierInfo
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <TypographyH1 className="mb-2">Môj účet</TypographyH1>
          <TypographyP className="text-muted-foreground">
            Vitajte späť, {user.name || user.email}!
          </TypographyP>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/account/profile">
              <User className="h-4 w-4 mr-2" />
              Profil
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/account/settings">
              <Settings className="h-4 w-4 mr-2" />
              Nastavenia
            </Link>
          </Button>
        </div>
      </div>

      {/* User Stats */}
      <UserStats stats={stats} />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Nová rezervácia</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Rezervujte si apartmán s {stats.currentDiscount}% zľavou
            </p>
            <Button asChild className="w-full">
              <Link href="/apartments">
                Rezervovať
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Upraviť profil</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Aktualizujte svoje osobné údaje
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link href="/account/profile">
                Upraviť
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">História rezervácií</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Zobraziť všetky vaše rezervácie
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link href="/account/bookings">
                Zobraziť
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Nedávne rezervácie</CardTitle>
            {user.bookings.length > 0 && (
              <Button variant="outline" asChild>
                <Link href="/account/bookings">
                  Zobraziť všetky
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <BookingsList bookings={user.bookings.map(booking => ({
            ...booking,
            totalPrice: toNumber(booking.totalPrice),
            discount: toNumber(booking.discount),
            apartment: {
              ...booking.apartment,
              basePrice: toNumber(booking.apartment.basePrice)
            }
          }))} />
        </CardContent>
      </Card>
    </div>
  )
} catch (error) {
    console.error('[Dashboard] Error:', error)
    // Show error page with details
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Chyba pri načítaní účtu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive mb-4">
              Nastala chyba pri načítaní vášho účtu. Skúste sa odhlásiť a prihlásiť znova.
            </p>
            <pre className="text-xs bg-muted p-4 rounded overflow-auto">
              {error instanceof Error ? error.message : String(error)}
            </pre>
            <div className="flex gap-2 mt-4">
              <Button asChild>
                <Link href="/api/auth/signout">Odhlásiť sa</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Domov</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}
