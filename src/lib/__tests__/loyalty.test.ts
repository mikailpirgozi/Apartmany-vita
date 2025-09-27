import { describe, it, expect } from 'vitest'
import { 
  calculateLoyaltyTier, 
  getLoyaltyDiscount, 
  calculateDiscountAmount,
  LoyaltyTier 
} from '../loyalty'

describe('Loyalty System', () => {
  describe('calculateLoyaltyTier', () => {
    it('returns BRONZE for new users (0 bookings)', () => {
      expect(calculateLoyaltyTier(0)).toBe(LoyaltyTier.BRONZE)
    })

    it('returns BRONZE for users with 1-2 bookings', () => {
      expect(calculateLoyaltyTier(1)).toBe(LoyaltyTier.BRONZE)
      expect(calculateLoyaltyTier(2)).toBe(LoyaltyTier.BRONZE)
    })

    it('returns SILVER for users with 3-5 bookings', () => {
      expect(calculateLoyaltyTier(3)).toBe(LoyaltyTier.SILVER)
      expect(calculateLoyaltyTier(4)).toBe(LoyaltyTier.SILVER)
      expect(calculateLoyaltyTier(5)).toBe(LoyaltyTier.SILVER)
    })

    it('returns GOLD for users with 6+ bookings', () => {
      expect(calculateLoyaltyTier(6)).toBe(LoyaltyTier.GOLD)
      expect(calculateLoyaltyTier(10)).toBe(LoyaltyTier.GOLD)
      expect(calculateLoyaltyTier(100)).toBe(LoyaltyTier.GOLD)
    })
  })

  describe('getLoyaltyDiscount', () => {
    it('returns 5% discount for BRONZE tier', () => {
      expect(getLoyaltyDiscount(LoyaltyTier.BRONZE)).toBe(0.05)
    })

    it('returns 7% discount for SILVER tier', () => {
      expect(getLoyaltyDiscount(LoyaltyTier.SILVER)).toBe(0.07)
    })

    it('returns 10% discount for GOLD tier', () => {
      expect(getLoyaltyDiscount(LoyaltyTier.GOLD)).toBe(0.10)
    })
  })

  describe('calculateDiscountAmount', () => {
    it('calculates discount amount for different tiers', () => {
      expect(calculateDiscountAmount(100, LoyaltyTier.BRONZE)).toBe(5)
      expect(calculateDiscountAmount(100, LoyaltyTier.SILVER)).toBe(7)
      expect(calculateDiscountAmount(100, LoyaltyTier.GOLD)).toBe(10)
    })

    it('returns 0 for zero price', () => {
      expect(calculateDiscountAmount(0, LoyaltyTier.BRONZE)).toBe(0)
    })

    it('handles large amounts', () => {
      expect(calculateDiscountAmount(1000, LoyaltyTier.GOLD)).toBe(100)
    })
  })

  describe('Loyalty tier progression', () => {
    it('correctly progresses through all tiers', () => {
      // New user
      expect(calculateLoyaltyTier(0)).toBe(LoyaltyTier.BRONZE)
      expect(getLoyaltyDiscount(LoyaltyTier.BRONZE)).toBe(0.05)
      
      // After 3 bookings
      expect(calculateLoyaltyTier(3)).toBe(LoyaltyTier.SILVER)
      expect(getLoyaltyDiscount(LoyaltyTier.SILVER)).toBe(0.07)
      
      // After 6 bookings
      expect(calculateLoyaltyTier(6)).toBe(LoyaltyTier.GOLD)
      expect(getLoyaltyDiscount(LoyaltyTier.GOLD)).toBe(0.10)
    })
  })

  describe('Edge cases', () => {
    it('handles negative booking count', () => {
      expect(calculateLoyaltyTier(-1)).toBe(LoyaltyTier.BRONZE)
    })

    it('handles very large booking count', () => {
      expect(calculateLoyaltyTier(999999)).toBe(LoyaltyTier.GOLD)
    })
  })
})
