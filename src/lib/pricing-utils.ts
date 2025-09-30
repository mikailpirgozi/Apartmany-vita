/**
 * Client-side pricing utilities for instant calculations
 * These functions calculate prices locally without API calls for better UX
 */

import { getLoyaltyDiscount, type LoyaltyTier } from './loyalty';
import { calculateStayDiscount, type StayDiscount } from './discounts';

/**
 * Calculate additional guest fees (instant, no API needed)
 */
export function calculateAdditionalGuestFee(
  guests: number,
  children: number,
  nights: number
): {
  additionalAdults: number;
  additionalChildren: number;
  feePerNight: number;
  totalFee: number;
} {
  const additionalAdults = Math.max(0, guests - 2);
  const additionalChildren = Math.max(0, children);
  const feePerNight = (additionalAdults * 20) + (additionalChildren * 10);
  const totalFee = feePerNight * nights;
  
  return {
    additionalAdults,
    additionalChildren,
    feePerNight,
    totalFee
  };
}

/**
 * Calculate loyalty discount amount (instant, no API needed for calculation)
 * Note: tier is determined from user's booking history (passed from parent)
 */
export function calculateLoyaltyDiscountAmount(
  subtotal: number,
  tier: LoyaltyTier
): {
  discountPercent: number;
  discountAmount: number;
  tier: LoyaltyTier;
} {
  const discountPercent = getLoyaltyDiscount(tier);
  const discountAmount = subtotal * discountPercent;
  
  return {
    discountPercent,
    discountAmount,
    tier
  };
}

/**
 * Calculate complete pricing breakdown (instant, client-side)
 */
export interface ClientPricingBreakdown {
  // Base prices from Beds24
  basePrice: number;
  nights: number;
  
  // Additional fees (calculated locally)
  additionalGuestFee: number;
  additionalGuestFeePerNight: number;
  additionalAdults: number;
  additionalChildren: number;
  
  // Subtotal before discounts
  subtotal: number;
  
  // Discounts (calculated locally)
  stayDiscount: number;
  stayDiscountPercent: number;
  stayDiscountInfo: StayDiscount | null;
  
  loyaltyDiscount: number;
  loyaltyDiscountPercent: number;
  loyaltyTier: LoyaltyTier | null;
  
  // Final totals
  totalDiscount: number;
  finalPrice: number;
  pricePerNight: number;
}

/**
 * Calculate complete pricing with all fees and discounts
 * This is the main function for instant price calculations
 */
export function calculateClientPricing(params: {
  basePrice: number; // From Beds24 API
  nights: number;
  guests: number;
  children: number;
  loyaltyTier?: LoyaltyTier | null | undefined; // From user's booking history
}): ClientPricingBreakdown {
  const { basePrice, nights, guests, children, loyaltyTier = null } = params;
  
  // 1. Calculate additional guest fees
  const guestFees = calculateAdditionalGuestFee(guests, children, nights);
  
  // 2. Calculate subtotal (base + guest fees)
  const subtotal = basePrice + guestFees.totalFee;
  
  // 3. Calculate stay discount
  const stayDiscountInfo = calculateStayDiscount(nights, subtotal);
  const stayDiscount = stayDiscountInfo?.discountAmount || 0;
  const stayDiscountPercent = stayDiscountInfo?.discountPercent || 0;
  
  // 4. Calculate loyalty discount
  let loyaltyDiscount = 0;
  let loyaltyDiscountPercent = 0;
  
  if (loyaltyTier) {
    const loyaltyData = calculateLoyaltyDiscountAmount(subtotal, loyaltyTier);
    loyaltyDiscount = loyaltyData.discountAmount;
    loyaltyDiscountPercent = loyaltyData.discountPercent;
  }
  
  // 5. Calculate final price
  const totalDiscount = stayDiscount + loyaltyDiscount;
  const finalPrice = subtotal - totalDiscount;
  const pricePerNight = finalPrice / nights;
  
  return {
    basePrice,
    nights,
    additionalGuestFee: guestFees.totalFee,
    additionalGuestFeePerNight: guestFees.feePerNight,
    additionalAdults: guestFees.additionalAdults,
    additionalChildren: guestFees.additionalChildren,
    subtotal,
    stayDiscount,
    stayDiscountPercent,
    stayDiscountInfo,
    loyaltyDiscount,
    loyaltyDiscountPercent,
    loyaltyTier,
    totalDiscount,
    finalPrice,
    pricePerNight
  };
}

/**
 * Adjust calendar day price for guest count (instant)
 * Used by calendar to show correct prices when guest count changes
 */
export function adjustPriceForGuests(
  baseDayPrice: number,
  guests: number,
  children: number
): number {
  const additionalAdults = Math.max(0, guests - 2);
  const additionalChildren = Math.max(0, children);
  const additionalFee = (additionalAdults * 20) + (additionalChildren * 10);
  
  return baseDayPrice + additionalFee;
}

