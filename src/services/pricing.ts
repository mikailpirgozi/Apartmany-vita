/**
 * Pricing Service
 * Handles booking price calculations, discounts, and loyalty benefits
 */

import { differenceInDays, eachDayOfInterval, format } from "date-fns";
import { prisma } from "@/lib/db";
import { beds24Service } from "./beds24";
import { LoyaltyTier } from "@/lib/loyalty";

// Re-export LoyaltyTier for backward compatibility
export { LoyaltyTier } from "@/lib/loyalty";

export interface BookingPricing {
  basePrice: number;
  nights: number;
  subtotal: number;
  loyaltyDiscount: number;
  loyaltyDiscountPercent: number;
  seasonalAdjustment: number;
  cleaningFee: number;
  cityTax: number;
  total: number;
  pricePerNight: number;
  breakdown: PriceBreakdown[];
  loyaltyTier?: LoyaltyTier;
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
  private readonly WEEKEND_MULTIPLIER = 1.2; // 20% weekend premium
  
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
    
    // Get dynamic pricing from Beds24 if available
    const dynamicPrices = await this.getDynamicPricing(apartment.slug, checkIn, checkOut);
    
    // Calculate daily breakdown
    const breakdown = this.calculateDailyBreakdown(
      checkIn, 
      checkOut, 
      Number(apartment.basePrice),
      dynamicPrices
    );
    
    const subtotal = breakdown.reduce((sum, day) => sum + day.price, 0);
    
    // Calculate loyalty discount
    const loyaltyData = userId ? await this.calculateLoyaltyDiscount(userId, subtotal) : null;
    
    // Calculate additional fees
    const cleaningFee = this.CLEANING_FEE;
    const cityTax = this.calculateCityTax(guests + children, nights);
    
    // Seasonal adjustments (summer/winter rates)
    const seasonalAdjustment = this.calculateSeasonalAdjustment(checkIn, subtotal);
    
    const total = subtotal 
      - (loyaltyData?.discountAmount || 0)
      + seasonalAdjustment
      + cleaningFee 
      + cityTax;
    
    return {
      basePrice: Number(apartment.basePrice),
      nights,
      subtotal,
      loyaltyDiscount: loyaltyData?.discountAmount || 0,
      loyaltyDiscountPercent: loyaltyData?.discountPercent || 0,
      seasonalAdjustment,
      cleaningFee,
      cityTax,
      total: Math.max(0, total),
      pricePerNight: subtotal / nights,
      breakdown,
      loyaltyTier: loyaltyData?.tier
    };
  }
  
  /**
   * Get dynamic pricing from Beds24
   */
  private async getDynamicPricing(
    apartmentSlug: string, 
    checkIn: Date, 
    checkOut: Date
  ): Promise<Record<string, number>> {
    try {
      const roomMapping: Record<string, string> = {
        'maly-apartman': process.env.BEDS24_ROOM_ID_MALY || '357930',
        'design-apartman': process.env.BEDS24_ROOM_ID_DESIGN || '483027',
        'lite-apartman': process.env.BEDS24_ROOM_ID_LITE || '357932',
        'deluxe-apartman': process.env.BEDS24_ROOM_ID_DELUXE || '357931'
      };
      
      const roomId = roomMapping[apartmentSlug];
      if (!roomId) return {};
      
      return await beds24Service.getRoomRates(
        process.env.BEDS24_PROP_ID!,
        roomId,
        format(checkIn, 'yyyy-MM-dd'),
        format(checkOut, 'yyyy-MM-dd')
      );
    } catch (error) {
      console.error('Failed to get dynamic pricing:', error);
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
      
      // Use dynamic price if available, otherwise base price
      let price = dynamicPrices[dateStr] || basePrice;
      
      // Apply weekend premium if no dynamic pricing
      if (isWeekend && !dynamicPrices[dateStr]) {
        price *= this.WEEKEND_MULTIPLIER;
      }
      
      const seasonalRate = this.getSeasonalRate(date);
      price *= seasonalRate;
      
      return {
        date: dateStr,
        price: Math.round(price * 100) / 100,
        isWeekend,
        seasonalRate
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
   * Calculate seasonal rate multiplier
   */
  private getSeasonalRate(date: Date): number {
    const month = date.getMonth() + 1; // 1-12
    
    // Summer season (June-August): +15%
    if (month >= 6 && month <= 8) return 1.15;
    
    // Winter holidays (December-January): +10%
    if (month === 12 || month === 1) return 1.10;
    
    // Spring/Fall: standard rate
    return 1.0;
  }
  
  /**
   * Calculate seasonal adjustment for total price
   */
  private calculateSeasonalAdjustment(checkIn: Date, subtotal: number): number {
    const month = checkIn.getMonth() + 1;
    
    // Peak season surcharge
    if (month >= 6 && month <= 8) {
      return Math.round(subtotal * 0.05 * 100) / 100; // 5% summer surcharge
    }
    
    return 0;
  }
  
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
