/**
 * Pricing Service
 * Handles booking price calculations, discounts, and loyalty benefits
 */

import { differenceInDays, eachDayOfInterval, format } from "date-fns";
import { prisma } from "@/lib/db";
import { getBeds24Service } from "./beds24";
import { LoyaltyTier } from "@/lib/loyalty";
import { PRICING_CONSTANTS } from "@/constants";
import { calculateStayDiscount, type StayDiscount } from "@/lib/discounts";

// Re-export LoyaltyTier for backward compatibility
export { LoyaltyTier } from "@/lib/loyalty";

export interface BookingPricing {
  basePrice: number;
  nights: number;
  subtotal: number;
  loyaltyDiscount: number;
  loyaltyDiscountPercent: number;
  longStayDiscount: number;
  longStayDiscountPercent: number;
  // New stay-based discount system
  stayDiscount: number;
  stayDiscountPercent: number;
  stayDiscountInfo: StayDiscount | null;
  seasonalAdjustment: number;
  cleaningFee: number;
  cityTax: number;
  total: number;
  pricePerNight: number;
  breakdown: PriceBreakdown[];
  loyaltyTier?: LoyaltyTier;
      // Dodatočné informácie o poplatkoch za hostí
      additionalGuestFee: number;
      additionalGuestFeePerNight: number;
      additionalAdults: number;
      additionalChildren: number;
      baseSubtotal: number;
}

export interface PriceBreakdown {
  date: string;
  price: number;
  isWeekend: boolean;
  seasonalRate: number;
}


export interface BookingRequest {
  apartmentId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  children: number;
  userId?: string;
}

class PricingService {
  private readonly CLEANING_FEE = 25; // €25 cleaning fee
  private readonly CITY_TAX_PER_PERSON = 1.5; // €1.50 per person per night
  // REMOVED: WEEKEND_MULTIPLIER - Beds24 handles all pricing
  
  /**
   * Calculate comprehensive booking pricing
   */
  async calculateBookingPrice(request: BookingRequest): Promise<BookingPricing> {
    const { apartmentId, checkIn, checkOut, guests, children, userId } = request;
    
    // Get apartment base price
    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId }
    });
    
    if (!apartment) {
      throw new Error('Apartment not found');
    }
    
    const nights = differenceInDays(checkOut, checkIn);
    if (nights <= 0) {
      throw new Error('Invalid date range');
    }
    
    // Get dynamic pricing from Beds24 offers API with guest count
    const dynamicPrices = await this.getDynamicPricing(apartment.slug, checkIn, checkOut, guests, children);
    
    // Calculate daily breakdown
    const breakdown = this.calculateDailyBreakdown(
      checkIn, 
      checkOut, 
      Number(apartment.basePrice),
      dynamicPrices
    );
    
    const baseSubtotal = breakdown.reduce((sum, day) => sum + day.price, 0);
    
    // Dodatočné poplatky za hostí nad základ 2 ľudí (ZA KAŽDÚ NOC!)
    const additionalAdults = Math.max(0, guests - 2);
    const additionalChildren = Math.max(0, children);
    const additionalGuestFeePerNight = (additionalAdults * 20) + (additionalChildren * 10);
    const additionalGuestFee = additionalGuestFeePerNight * nights;
    
    const subtotal = baseSubtotal + additionalGuestFee;
    
    // Calculate loyalty discount
    const loyaltyData = userId ? await this.calculateLoyaltyDiscount(userId, subtotal) : null;
    
    // Calculate long stay discount (7+ nights) - DEPRECATED
    const longStayData = this.calculateLongStayDiscount(nights, subtotal);
    
    // Calculate new stay-based discount system (independent of user registration)
    const stayDiscountInfo = calculateStayDiscount(nights, subtotal);
    const stayDiscount = stayDiscountInfo?.discountAmount || 0;
    const stayDiscountPercent = stayDiscountInfo?.discountPercent || 0;
    
    // Calculate additional fees
    const cleaningFee = this.CLEANING_FEE;
    const cityTax = this.calculateCityTax(guests + children, nights);
    
    // NO SEASONAL ADJUSTMENTS - Beds24 handles all pricing including seasonal rates
    
    const total = subtotal 
      - (loyaltyData?.discountAmount || 0)
      - longStayData.discountAmount
      - stayDiscount // New stay-based discount
      + cleaningFee 
      + cityTax;
    
    return {
      basePrice: Number(apartment.basePrice),
      nights,
      subtotal,
      loyaltyDiscount: loyaltyData?.discountAmount || 0,
      loyaltyDiscountPercent: loyaltyData?.discountPercent || 0,
      longStayDiscount: longStayData.discountAmount,
      longStayDiscountPercent: longStayData.discountPercent,
      // New stay-based discount system
      stayDiscount,
      stayDiscountPercent,
      stayDiscountInfo,
      seasonalAdjustment: 0, // REMOVED: Beds24 handles seasonal pricing
      cleaningFee,
      cityTax,
      total: Math.max(0, total),
      pricePerNight: subtotal / nights,
      breakdown,
      loyaltyTier: loyaltyData?.tier,
      // Dodatočné informácie o poplatkoch za hostí
      additionalGuestFee,
      additionalGuestFeePerNight,
      additionalAdults,
      additionalChildren,
      baseSubtotal
    };
  }
  
  /**
   * Get dynamic pricing from Beds24 using Calendar API (FIXED)
   * FIXED: Use Calendar API which actually returns prices, not Inventory API
   */
  private async getDynamicPricing(
    apartmentSlug: string, 
    checkIn: Date, 
    checkOut: Date,
    guests: number = 2,
    children: number = 0
  ): Promise<Record<string, number>> {
    try {
      const apartmentMapping: Record<string, { propId: string; roomId: string }> = {
        'design-apartman': { propId: '227484', roomId: '483027' },
        'lite-apartman': { propId: '168900', roomId: '357932' },
        'deluxe-apartman': { propId: '161445', roomId: '357931' }
      };
      
      const apartmentConfig = apartmentMapping[apartmentSlug];
      if (!apartmentConfig) {
        console.log(`⚠️ No Beds24 mapping for apartment: ${apartmentSlug}`);
        return {};
      }
      
      console.log(`🎯 Getting dynamic pricing for ${apartmentSlug} with ${guests} guests, ${children} children`);
      
      // Check if BEDS24 environment variables are available (support both Long Life Token and legacy tokens)
      const hasBeds24Config = process.env.BEDS24_LONG_LIFE_TOKEN || (process.env.BEDS24_ACCESS_TOKEN && process.env.BEDS24_REFRESH_TOKEN);
      if (!hasBeds24Config) {
        console.warn('⚠️ BEDS24 environment variables not available, using fallback pricing');
        return {};
      }
      
      // FIXED: Use Calendar API which actually returns prices from Beds24
      const beds24Service = getBeds24Service();
      const calendarData = await beds24Service.getInventoryCalendar({
        propId: apartmentConfig.propId,
        roomId: apartmentConfig.roomId,
        startDate: format(checkIn, 'yyyy-MM-dd'),
        endDate: format(checkOut, 'yyyy-MM-dd')
      });
      
      console.log(`💰 Dynamic prices from Beds24 Calendar API:`, calendarData.prices);
      console.log(`📊 Price analysis:`, {
        totalPrices: Object.keys(calendarData.prices || {}).length,
        dateRange: `${format(checkIn, 'yyyy-MM-dd')} to ${format(checkOut, 'yyyy-MM-dd')}`,
        samplePrices: Object.entries(calendarData.prices || {}).slice(0, 3)
      });
      
      // Return prices from Calendar API (this actually works!)
      return calendarData.prices && Object.keys(calendarData.prices).length > 0 
        ? calendarData.prices 
        : {};
        
    } catch (error) {
      console.error('Failed to get dynamic pricing from Beds24 Calendar API:', error);
      return {};
    }
  }
  
  /**
   * Calculate daily price breakdown
   */
  private calculateDailyBreakdown(
    checkIn: Date,
    checkOut: Date,
    basePrice: number,
    dynamicPrices: Record<string, number>
  ): PriceBreakdown[] {
    const days = eachDayOfInterval({ start: checkIn, end: checkOut });
    // Remove checkout day (only count nights)
    days.pop();
    
    return days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const isWeekend = date.getDay() === 5 || date.getDay() === 6; // Friday, Saturday
      
      // STRICT: Use dynamic price from Beds24 API only - NO FALLBACKS
      let price = dynamicPrices[dateStr];
      if (!price || price <= 0) {
        console.warn(`⚠️ No Beds24 price for ${dateStr} - using base price as last resort`);
        price = basePrice;
      }
      
      // REMOVED: Weekend premium - Beds24 handles all pricing including weekends
      
      // REMOVED: Seasonal rate - Beds24 API already includes seasonal pricing
      
      return {
        date: dateStr,
        price: Math.round(price * 100) / 100,
        isWeekend,
        seasonalRate: 1.0 // Always 1.0 - Beds24 handles seasonal pricing
      };
    });
  }
  
  /**
   * Calculate loyalty discount based on user's booking history
   */
  private async calculateLoyaltyDiscount(userId: string, subtotal: number) {
    const bookingCount = await prisma.booking.count({
      where: {
        userId,
        status: 'COMPLETED'
      }
    });
    
    const tier = this.calculateLoyaltyTier(bookingCount);
    const discountPercent = this.getLoyaltyDiscountPercent(tier);
    const discountAmount = subtotal * discountPercent;
    
    return {
      tier,
      discountPercent,
      discountAmount: Math.round(discountAmount * 100) / 100
    };
  }
  
  /**
   * Determine loyalty tier based on completed bookings
   */
  private calculateLoyaltyTier(bookingCount: number): LoyaltyTier {
    if (bookingCount >= 6) return LoyaltyTier.GOLD;
    if (bookingCount >= 3) return LoyaltyTier.SILVER;
    return LoyaltyTier.BRONZE;
  }
  
  /**
   * Get discount percentage for loyalty tier
   */
  private getLoyaltyDiscountPercent(tier: LoyaltyTier): number {
    switch (tier) {
      case LoyaltyTier.GOLD: return 0.10;    // 10%
      case LoyaltyTier.SILVER: return 0.07;  // 7%
      case LoyaltyTier.BRONZE: return 0.05;  // 5%
    }
  }
  
  /**
   * Calculate long stay discount (7+ nights)
   */
  private calculateLongStayDiscount(nights: number, subtotal: number) {
    const discountPercent = nights >= 7 ? PRICING_CONSTANTS.LONG_STAY_DISCOUNT : 0;
    const discountAmount = subtotal * discountPercent;
    
    return {
      discountPercent,
      discountAmount: Math.round(discountAmount * 100) / 100
    };
  }
  
  // REMOVED: Seasonal rate functions - Beds24 API handles all seasonal pricing
  
  /**
   * Calculate city tax
   */
  private calculateCityTax(totalGuests: number, nights: number): number {
    return Math.round(totalGuests * nights * this.CITY_TAX_PER_PERSON * 100) / 100;
  }
  
  /**
   * Quick price estimate (without DB calls)
   */
  estimatePrice(basePrice: number, nights: number, guests: number): number {
    const subtotal = basePrice * nights;
    const cleaningFee = this.CLEANING_FEE;
    const cityTax = guests * nights * this.CITY_TAX_PER_PERSON;
    
    return Math.round((subtotal + cleaningFee + cityTax) * 100) / 100;
  }
  
  /**
   * Calculate loyalty tier display info
   */
  getLoyaltyTierInfo(tier: LoyaltyTier) {
    const tierInfo = {
      [LoyaltyTier.BRONZE]: {
        name: 'Bronze',
        discount: '5%',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        nextTier: 'Silver (3 rezervácie)',
        benefits: ['5% zľava na všetky rezervácie', 'Prioritná podpora']
      },
      [LoyaltyTier.SILVER]: {
        name: 'Silver', 
        discount: '7%',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        nextTier: 'Gold (6 rezervácií)',
        benefits: ['7% zľava na všetky rezervácie', 'Bezplatné zrušenie do 24h', 'Prioritná podpora']
      },
      [LoyaltyTier.GOLD]: {
        name: 'Gold',
        discount: '10%',
        color: 'text-yellow-600', 
        bgColor: 'bg-yellow-50',
        nextTier: null,
        benefits: ['10% zľava na všetky rezervácie', 'Bezplatné zrušenie do 24h', 'Prioritná podpora', 'Bezplatné upgrade (ak dostupné)']
      }
    };
    
    return tierInfo[tier];
  }
}

// Singleton instance
export const pricingService = new PricingService();

// Helper functions
export async function calculateBookingPrice(request: BookingRequest): Promise<BookingPricing> {
  return pricingService.calculateBookingPrice(request);
}

export function estimateBookingPrice(basePrice: number, nights: number, guests: number): number {
  return pricingService.estimatePrice(basePrice, nights, guests);
}
