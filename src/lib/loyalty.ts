// Define LoyaltyTier enum locally to avoid circular dependencies
export enum LoyaltyTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER', 
  GOLD = 'GOLD'
}

export interface LoyaltyTierInfo {
  name: LoyaltyTier
  displayName: string
  discount: number
  minBookings: number
  color: string
  icon: string
  benefits: string[]
}

export const LOYALTY_TIERS: Record<LoyaltyTier, LoyaltyTierInfo> = {
  [LoyaltyTier.BRONZE]: {
    name: LoyaltyTier.BRONZE,
    displayName: 'Bronze',
    discount: 0.05, // 5%
    minBookings: 0,
    color: 'text-amber-600',
    icon: '🥉',
    benefits: [
      '5% zľava na všetky rezervácie',
      'Prioritná zákaznícka podpora',
      'Mesačný newsletter s ponukami'
    ]
  },
  [LoyaltyTier.SILVER]: {
    name: LoyaltyTier.SILVER,
    displayName: 'Silver',
    discount: 0.07, // 7%
    minBookings: 3,
    color: 'text-slate-600',
    icon: '🥈',
    benefits: [
      '7% zľava na všetky rezervácie',
      'Bezplatné zrušenie do 24h pred príchodom',
      'Skorý check-in a neskorý check-out (podľa dostupnosti)',
      'Všetky Bronze výhody'
    ]
  },
  [LoyaltyTier.GOLD]: {
    name: LoyaltyTier.GOLD,
    displayName: 'Gold',
    discount: 0.10, // 10%
    minBookings: 6,
    color: 'text-yellow-600',
    icon: '🥇',
    benefits: [
      '10% zľava na všetky rezervácie',
      'Bezplatný upgrade apartmánu (podľa dostupnosti)',
      'Uvítací balíček s lokálnymi špecialitami',
      'Osobný concierge servis',
      'Všetky Silver a Bronze výhody'
    ]
  }
}

export function calculateLoyaltyTier(totalBookings: number): LoyaltyTier {
  if (totalBookings >= LOYALTY_TIERS[LoyaltyTier.GOLD].minBookings) {
    return LoyaltyTier.GOLD
  }
  if (totalBookings >= LOYALTY_TIERS[LoyaltyTier.SILVER].minBookings) {
    return LoyaltyTier.SILVER
  }
  return LoyaltyTier.BRONZE
}

export function getLoyaltyDiscount(tier: LoyaltyTier): number {
  return LOYALTY_TIERS[tier].discount
}

export function getLoyaltyTierInfo(tier: LoyaltyTier): LoyaltyTierInfo {
  return LOYALTY_TIERS[tier]
}

export function getNextTier(currentTier: LoyaltyTier): LoyaltyTierInfo | null {
  switch (currentTier) {
    case LoyaltyTier.BRONZE:
      return LOYALTY_TIERS[LoyaltyTier.SILVER]
    case LoyaltyTier.SILVER:
      return LOYALTY_TIERS[LoyaltyTier.GOLD]
    case LoyaltyTier.GOLD:
      return null // Already at highest tier
  }
}

export function getBookingsToNextTier(currentBookings: number, currentTier: LoyaltyTier): number {
  const nextTier = getNextTier(currentTier)
  if (!nextTier) return 0
  
  return Math.max(0, nextTier.minBookings - currentBookings)
}

export function calculateDiscountAmount(basePrice: number, tier: LoyaltyTier): number {
  const discount = getLoyaltyDiscount(tier)
  return basePrice * discount
}

export function formatLoyaltyDiscount(tier: LoyaltyTier): string {
  const discount = getLoyaltyDiscount(tier)
  return `${Math.round(discount * 100)}%`
}
