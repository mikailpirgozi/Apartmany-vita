import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ProfileForm } from '@/components/account/profile-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TypographyH1, TypographyP } from '@/components/ui/typography'
import { LoyaltyTier } from '@/services/pricing'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default async function ProfilePage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      dateOfBirth: true,
      image: true,
      createdAt: true,
      _count: {
        select: {
          bookings: {
            where: { status: 'COMPLETED' }
          }
        }
      }
    }
  })

  if (!user) {
    redirect('/auth/signin')
  }

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
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    return email[0].toUpperCase()
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

              {/* Account Info */}
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium">Informácie o účte</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Člen od:</span>
                    <span>{new Date(user.createdAt).toLocaleDateString('sk-SK')}</span>
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
