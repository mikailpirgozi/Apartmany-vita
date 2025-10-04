import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ProfileForm } from '@/components/account/profile-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TypographyH1, TypographyP } from '@/components/ui/typography'
import { LoyaltyTier } from '@/services/pricing'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface UserWithCompanyData {
  id: string
  name: string | null
  email: string
  phone: string | null
  dateOfBirth: Date | null
  image: string | null
  companyName: string | null
  companyId: string | null
  companyVat: string | null
  companyAddress: string | null
  createdAt: Date
  _count: {
    bookings: number
  }
}

export default async function ProfilePage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  let user = await prisma.user.findUnique({
    where: { id: session.user.id }
  }) as UserWithCompanyData | null

  // If user doesn't exist in DB (OAuth without adapter), create them
  if (!user && session.user.email) {
    const newUser = await prisma.user.create({
      data: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        emailVerified: new Date(),
      }
    })
    user = {
      ...newUser,
      _count: { bookings: 0 }
    } as unknown as UserWithCompanyData
  }

  if (!user) {
    redirect('/auth/signin')
  }

  // Get booking count separately
  const bookingCount = await prisma.booking.count({
    where: { 
      userId: session.user.id,
      status: 'COMPLETED'
    }
  })

  // Add _count to user object
  user._count = { bookings: bookingCount }

  // Calculate loyalty tier
  const calculateLoyaltyTier = (bookings: number): LoyaltyTier => {
    if (bookings >= 6) return LoyaltyTier.GOLD
    if (bookings >= 3) return LoyaltyTier.SILVER
    return LoyaltyTier.BRONZE
  }

  const loyaltyTier = calculateLoyaltyTier(user._count.bookings)
  
  const getTierColor = (tier: LoyaltyTier) => {
    switch (tier) {
      case LoyaltyTier.BRONZE:
        return 'bg-amber-100 text-amber-800'
      case LoyaltyTier.SILVER:
        return 'bg-slate-100 text-slate-800'
      case LoyaltyTier.GOLD:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getTierIcon = (tier: LoyaltyTier) => {
    switch (tier) {
      case LoyaltyTier.BRONZE:
        return '🥉'
      case LoyaltyTier.SILVER:
        return '🥈'
      case LoyaltyTier.GOLD:
        return '🥇'
    }
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).filter(Boolean).join('').toUpperCase()
    }
    return email.charAt(0).toUpperCase()
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <TypographyH1 className="mb-2">Môj profil</TypographyH1>
        <TypographyP className="text-muted-foreground">
          Spravujte svoje osobné údaje a nastavenia účtu
        </TypographyP>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Prehľad účtu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-20 h-20 mb-4">
                  <AvatarImage src={user.image || undefined} alt={user.name || user.email} />
                  <AvatarFallback className="text-lg">
                    {getInitials(user.name, user.email)}
                  </AvatarFallback>
                </Avatar>
                
                <h3 className="font-semibold text-lg">
                  {user.name || 'Nepomenovaný používateľ'}
                </h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>

              {/* Loyalty Status */}
              <div className="space-y-3">
                <h4 className="font-medium">Loyalty Status</h4>
                <div className="flex items-center justify-center">
                  <Badge className={getTierColor(loyaltyTier)}>
                    {getTierIcon(loyaltyTier)} {loyaltyTier}
                  </Badge>
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  {user._count.bookings} dokončených rezervácií
                </div>
              </div>

              {/* Company Info */}
              {user.companyName && (
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-medium">Firemné údaje</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Firma:</span>
                      <p className="font-medium">{user.companyName}</p>
                    </div>
                    {user.companyId && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">IČO:</span>
                        <span>{user.companyId}</span>
                      </div>
                    )}
                    {user.companyVat && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">DIČ:</span>
                        <span>{user.companyVat}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Account Info */}
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium">Informácie o účte</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Člen od:</span>
                    <span>{user.createdAt?.toISOString().split('T')[0]?.split('-').reverse().join('.') || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rezervácie:</span>
                    <span>{user._count.bookings}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <ProfileForm user={user} />
        </div>
      </div>
      </div>
    </div>
  )
}
