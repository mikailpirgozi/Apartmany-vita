/**
 * Discount System
 * Handles stay-based discounts independent of user registration
 */

import { STAY_DISCOUNTS } from "@/constants";

export interface StayDiscount {
  type: keyof typeof STAY_DISCOUNTS;
  minNights: number;
  discount: number;
  label: string;
  discountPercent: number;
  discountAmount: number;
}

export interface DiscountCalculation {
  originalPrice: number;
  discountedPrice: number;
  stayDiscount: StayDiscount | null;
  totalSavings: number;
}

/**
 * Calculate the best applicable stay discount based on number of nights
 * Returns the highest discount that applies
 */
export function calculateStayDiscount(nights: number, subtotal: number): StayDiscount | null {
  // Sort discounts by minimum nights in descending order to get the best applicable discount
  const sortedDiscounts = Object.entries(STAY_DISCOUNTS)
    .sort(([, a], [, b]) => b.minNights - a.minNights);

  for (const [type, config] of sortedDiscounts) {
    if (nights >= config.minNights) {
      const discountAmount = Math.round(subtotal * config.discount * 100) / 100;
      
      return {
        type: type as keyof typeof STAY_DISCOUNTS,
        minNights: config.minNights,
        discount: config.discount,
        label: config.label,
        discountPercent: Math.round(config.discount * 100),
        discountAmount
      };
    }
  }

  return null;
}

/**
 * Calculate complete discount breakdown for a booking
 */
export function calculateDiscountBreakdown(
  nights: number, 
  subtotal: number
): DiscountCalculation {
  const stayDiscount = calculateStayDiscount(nights, subtotal);
  const totalSavings = stayDiscount?.discountAmount || 0;
  const discountedPrice = Math.max(0, subtotal - totalSavings);

  return {
    originalPrice: subtotal,
    discountedPrice,
    stayDiscount,
    totalSavings
  };
}

/**
 * Get all available discount tiers for display purposes
 */
export function getDiscountTiers() {
  return Object.entries(STAY_DISCOUNTS).map(([type, config]) => ({
    type: type as keyof typeof STAY_DISCOUNTS,
    minNights: config.minNights,
    discount: config.discount,
    label: config.label,
    discountPercent: Math.round(config.discount * 100)
  }));
}

/**
 * Format discount for display
 */
export function formatDiscount(discount: StayDiscount): string {
  return `${discount.discountPercent}% zľava (${discount.label})`;
}

/**
 * Check if a stay qualifies for any discount
 */
export function qualifiesForDiscount(nights: number): boolean {
  return nights >= STAY_DISCOUNTS.WEEK_STAY.minNights;
}

/**
 * Get next discount tier information
 */
export function getNextDiscountTier(nights: number): { 
  nextTier: StayDiscount | null; 
  nightsNeeded: number 
} {
  // Find the next higher tier
  const sortedDiscounts = Object.entries(STAY_DISCOUNTS)
    .sort(([, a], [, b]) => a.minNights - b.minNights);

  for (const [type, config] of sortedDiscounts) {
    if (config.minNights > nights) {
      return {
        nextTier: {
          type: type as keyof typeof STAY_DISCOUNTS,
          minNights: config.minNights,
          discount: config.discount,
          label: config.label,
          discountPercent: Math.round(config.discount * 100),
          discountAmount: 0 // Will be calculated when needed
        },
        nightsNeeded: config.minNights - nights
      };
    }
  }

  return { nextTier: null, nightsNeeded: 0 };
}
