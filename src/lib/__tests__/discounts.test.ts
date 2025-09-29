/**
 * Discount System Tests
 * Tests for stay-based discount calculations
 */

import { describe, it, expect } from 'vitest';
import {
  calculateStayDiscount,
  calculateDiscountBreakdown,
  getDiscountTiers,
  formatDiscount,
  qualifiesForDiscount,
  getNextDiscountTier
} from '../discounts';
import { STAY_DISCOUNTS } from '@/constants';

describe('Discount System', () => {
  describe('calculateStayDiscount', () => {
    it('should return null for stays less than 7 nights', () => {
      const result = calculateStayDiscount(6, 600);
      expect(result).toBeNull();
    });

    it('should return 10% discount for 7-13 nights', () => {
      const result = calculateStayDiscount(7, 700);
      expect(result).toEqual({
        type: 'WEEK_STAY',
        minNights: 7,
        discount: 0.10,
        label: '7+ dní',
        discountPercent: 10,
        discountAmount: 70
      });
    });

    it('should return 15% discount for 14-29 nights', () => {
      const result = calculateStayDiscount(14, 1400);
      expect(result).toEqual({
        type: 'TWO_WEEK_STAY',
        minNights: 14,
        discount: 0.15,
        label: '14+ dní',
        discountPercent: 15,
        discountAmount: 210
      });
    });

    it('should return 20% discount for 30+ nights', () => {
      const result = calculateStayDiscount(30, 3000);
      expect(result).toEqual({
        type: 'MONTH_STAY',
        minNights: 30,
        discount: 0.20,
        label: '30+ dní',
        discountPercent: 20,
        discountAmount: 600
      });
    });

    it('should return highest applicable discount', () => {
      // 45 nights should get the 30+ nights discount (20%), not lower tiers
      const result = calculateStayDiscount(45, 4500);
      expect(result?.type).toBe('MONTH_STAY');
      expect(result?.discountPercent).toBe(20);
      expect(result?.discountAmount).toBe(900);
    });

    it('should handle edge cases correctly', () => {
      // Exactly 7 nights
      const result7 = calculateStayDiscount(7, 700);
      expect(result7?.type).toBe('WEEK_STAY');
      
      // Exactly 14 nights
      const result14 = calculateStayDiscount(14, 1400);
      expect(result14?.type).toBe('TWO_WEEK_STAY');
      
      // Exactly 30 nights
      const result30 = calculateStayDiscount(30, 3000);
      expect(result30?.type).toBe('MONTH_STAY');
    });

    it('should round discount amounts correctly', () => {
      const result = calculateStayDiscount(7, 733.33);
      expect(result?.discountAmount).toBe(73.33);
    });
  });

  describe('calculateDiscountBreakdown', () => {
    it('should calculate complete breakdown with discount', () => {
      const result = calculateDiscountBreakdown(14, 1400);
      
      expect(result).toEqual({
        originalPrice: 1400,
        discountedPrice: 1190, // 1400 - 210
        stayDiscount: {
          type: 'TWO_WEEK_STAY',
          minNights: 14,
          discount: 0.15,
          label: '14+ dní',
          discountPercent: 15,
          discountAmount: 210
        },
        totalSavings: 210
      });
    });

    it('should handle no discount case', () => {
      const result = calculateDiscountBreakdown(5, 500);
      
      expect(result).toEqual({
        originalPrice: 500,
        discountedPrice: 500,
        stayDiscount: null,
        totalSavings: 0
      });
    });

    it('should not allow negative prices', () => {
      const result = calculateDiscountBreakdown(30, 100);
      expect(result.discountedPrice).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getDiscountTiers', () => {
    it('should return all discount tiers', () => {
      const tiers = getDiscountTiers();
      
      expect(tiers).toHaveLength(3);
      expect(tiers[0]).toEqual({
        type: 'WEEK_STAY',
        minNights: 7,
        discount: 0.10,
        label: '7+ dní',
        discountPercent: 10
      });
      expect(tiers[1]).toEqual({
        type: 'TWO_WEEK_STAY',
        minNights: 14,
        discount: 0.15,
        label: '14+ dní',
        discountPercent: 15
      });
      expect(tiers[2]).toEqual({
        type: 'MONTH_STAY',
        minNights: 30,
        discount: 0.20,
        label: '30+ dní',
        discountPercent: 20
      });
    });
  });

  describe('formatDiscount', () => {
    it('should format discount correctly', () => {
      const discount = {
        type: 'WEEK_STAY' as const,
        minNights: 7,
        discount: 0.10,
        label: '7+ dní',
        discountPercent: 10,
        discountAmount: 70
      };
      
      const formatted = formatDiscount(discount);
      expect(formatted).toBe('10% zľava (7+ dní)');
    });
  });

  describe('qualifiesForDiscount', () => {
    it('should return false for stays less than 7 nights', () => {
      expect(qualifiesForDiscount(6)).toBe(false);
      expect(qualifiesForDiscount(1)).toBe(false);
    });

    it('should return true for stays 7+ nights', () => {
      expect(qualifiesForDiscount(7)).toBe(true);
      expect(qualifiesForDiscount(14)).toBe(true);
      expect(qualifiesForDiscount(30)).toBe(true);
      expect(qualifiesForDiscount(100)).toBe(true);
    });
  });

  describe('getNextDiscountTier', () => {
    it('should return next tier for 5 nights', () => {
      const result = getNextDiscountTier(5);
      
      expect(result.nextTier).toEqual({
        type: 'WEEK_STAY',
        minNights: 7,
        discount: 0.10,
        label: '7+ dní',
        discountPercent: 10,
        discountAmount: 0
      });
      expect(result.nightsNeeded).toBe(2);
    });

    it('should return next tier for 10 nights', () => {
      const result = getNextDiscountTier(10);
      
      expect(result.nextTier?.type).toBe('TWO_WEEK_STAY');
      expect(result.nightsNeeded).toBe(4);
    });

    it('should return next tier for 20 nights', () => {
      const result = getNextDiscountTier(20);
      
      expect(result.nextTier?.type).toBe('MONTH_STAY');
      expect(result.nightsNeeded).toBe(10);
    });

    it('should return null for maximum tier', () => {
      const result = getNextDiscountTier(35);
      
      expect(result.nextTier).toBeNull();
      expect(result.nightsNeeded).toBe(0);
    });
  });

  describe('Integration with constants', () => {
    it('should use correct discount values from constants', () => {
      expect(STAY_DISCOUNTS.WEEK_STAY.discount).toBe(0.10);
      expect(STAY_DISCOUNTS.TWO_WEEK_STAY.discount).toBe(0.15);
      expect(STAY_DISCOUNTS.MONTH_STAY.discount).toBe(0.20);
    });

    it('should use correct minimum nights from constants', () => {
      expect(STAY_DISCOUNTS.WEEK_STAY.minNights).toBe(7);
      expect(STAY_DISCOUNTS.TWO_WEEK_STAY.minNights).toBe(14);
      expect(STAY_DISCOUNTS.MONTH_STAY.minNights).toBe(30);
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle typical 1-week vacation', () => {
      const nights = 7;
      const pricePerNight = 80;
      const totalPrice = nights * pricePerNight; // 560€
      
      const discount = calculateStayDiscount(nights, totalPrice);
      expect(discount?.discountAmount).toBe(56); // 10% of 560€
      
      const breakdown = calculateDiscountBreakdown(nights, totalPrice);
      expect(breakdown.discountedPrice).toBe(504); // 560€ - 56€
    });

    it('should handle business trip (2 weeks)', () => {
      const nights = 14;
      const pricePerNight = 90;
      const totalPrice = nights * pricePerNight; // 1260€
      
      const discount = calculateStayDiscount(nights, totalPrice);
      expect(discount?.discountAmount).toBe(189); // 15% of 1260€
      
      const breakdown = calculateDiscountBreakdown(nights, totalPrice);
      expect(breakdown.discountedPrice).toBe(1071); // 1260€ - 189€
    });

    it('should handle long-term stay (1 month)', () => {
      const nights = 30;
      const pricePerNight = 75;
      const totalPrice = nights * pricePerNight; // 2250€
      
      const discount = calculateStayDiscount(nights, totalPrice);
      expect(discount?.discountAmount).toBe(450); // 20% of 2250€
      
      const breakdown = calculateDiscountBreakdown(nights, totalPrice);
      expect(breakdown.discountedPrice).toBe(1800); // 2250€ - 450€
    });
  });
});

