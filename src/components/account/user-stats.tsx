'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar, Euro, Star, TrendingUp } from 'lucide-react'
import { LoyaltyTier } from '@/services/pricing'

interface UserStatsProps {
  stats: {
    totalBookings: number
    totalSpent: number
    totalSavings: number
    loyaltyTier: LoyaltyTier
    currentDiscount: number
    nextTierBookings: number
    nextTierName: string
  }
}

export function UserStats({ stats }: UserStatsProps) {
  const getTierColor = (tier: LoyaltyTier) => {
    switch (tier) {
      case LoyaltyTier.BRONZE:
        return 'text-amber-600 bg-amber-50'
      case LoyaltyTier.SILVER:
        return 'text-slate-600 bg-slate-50'
      case LoyaltyTier.GOLD:
        return 'text-yellow-600 bg-yellow-50'
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

  const progressPercentage = stats.nextTierBookings > 0 
    ? Math.min(100, ((3 - stats.nextTierBookings) / 3) * 100)
    : 100

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Bookings */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-primary" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Celkom rezervácií</p>
              <p className="text-2xl font-bold">{stats.totalBookings}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Spent */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Euro className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Celkom utratené</p>
              <p className="text-2xl font-bold">€{stats.totalSpent.toFixed(0)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Savings */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Ušetrené na zľavách</p>
              <p className="text-2xl font-bold text-green-600">€{stats.totalSavings.toFixed(0)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loyalty Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Loyalty status</p>
              <div className="flex items-center gap-2">
                <span className="text-xl">{getTierIcon(stats.loyaltyTier)}</span>
                <Badge className={getTierColor(stats.loyaltyTier)}>
                  {stats.loyaltyTier} - {stats.currentDiscount}%
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress to Next Tier */}
      {stats.nextTierBookings > 0 && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Postup k {stats.nextTierName} tier</h3>
                  <p className="text-sm text-muted-foreground">
                    Ešte {stats.nextTierBookings} rezerváci{stats.nextTierBookings === 1 ? 'a' : 'e/í'} do ďalšej úrovne
                  </p>
                </div>
                <Badge variant="outline">
                  {stats.nextTierName === 'SILVER' ? '7%' : '10%'} zľava
                </Badge>
              </div>
              
              <Progress value={progressPercentage} className="h-2" />
              
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Aktuálne: {stats.totalBookings} rezervácií</span>
                <span>Cieľ: {stats.nextTierName === 'SILVER' ? '3' : '6'} rezervácií</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
