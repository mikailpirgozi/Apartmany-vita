import { Decimal } from '@prisma/client/runtime/library'

// Database types
export interface User {
  id: string
  email: string
  name?: string
  image?: string
  emailVerified?: Date
  phone?: string
  dateOfBirth?: Date
  preferences?: Record<string, string | number | boolean>
  createdAt: Date
  updatedAt: Date
  bookings?: Booking[]
  reviews?: Review[]
}

export interface Apartment {
  id: string
  name: string
  slug: string
  description: string
  floor: number
  size: number
  maxGuests: number
  maxChildren: number
  images: string[]
  amenities: string[]
  basePrice: number | Decimal
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  bookings?: Booking[]
}

export interface Booking {
  id: string
  checkIn: Date
  checkOut: Date
  guests: number
  children: number
  totalPrice: number | Decimal
  discount: number | Decimal
  status: BookingStatus
  paymentId?: string
  userId: string
  apartmentId: string
  user?: User
  apartment?: Apartment
  extras?: BookingExtra[]
  createdAt: Date
  updatedAt: Date
}

export interface BookingExtra {
  id: string
  name: string
  price: number | Decimal
  quantity: number
  bookingId: string
}

export interface Review {
  id: string
  rating: number
  comment: string
  userId: string
  apartmentId: string
  user?: User
  apartment?: Apartment
  createdAt: Date
  updatedAt: Date
}

// Enums
export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export enum LoyaltyTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD'
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Booking flow types
export interface BookingData {
  apartmentId?: string
  checkIn?: Date
  checkOut?: Date
  guests?: number
  children?: number
  guestInfo?: {
    firstName: string
    lastName: string
    email: string
    phone: string
    specialRequests?: string
  }
  extras?: BookingExtra[]
  totalPrice?: number | Decimal
  discount?: number | Decimal
}

// Pricing calculation types
export interface PricingBreakdown {
  basePrice: number | Decimal
  discount: number | Decimal
  total: number | Decimal
  nights: number
  loyaltyTier?: LoyaltyTier
  discountPercentage?: number
}

// Search and filter types
export interface SearchFilters {
  priceRange: [number, number]
  size: [number, number]
  floor: number[]
  amenities: string[]
  maxGuests?: number
}

export interface AvailabilityData {
  available: string[]
  booked: string[]
  prices: Record<string, number>
}

// Beds24 Availability Response with pricing info
export interface Beds24AvailabilityResponse {
  success: boolean
  apartment: string
  checkIn: string
  checkOut: string
  isAvailable: boolean
  totalPrice: number
  pricePerNight: number
  nights: number
  available: string[]
  booked: string[]
  prices: Record<string, number>
  minStay: number
  maxStay: number
  bookedDates: string[]
  dailyPrices: Record<string, number>
  pricingInfo: {
    guestCount: number
    childrenCount: number
    source: string
    totalDays: number
    averagePricePerNight: number
    basePrice: number
    additionalGuestFee: number
    additionalGuestFeePerNight: number
    additionalAdults: number
    additionalChildren: number
  }
  performance: {
    responseTime: number
    cacheHit: boolean
    source: string
    cacheKey: string
    cacheStats: {
      hits: number
      misses: number
      activeRequests: number
      hitRate: number
    }
    timestamp: string
  }
}

// Google Reviews types
export interface GoogleReview {
  author_name: string
  author_url: string
  language: string
  profile_photo_url: string
  rating: number
  relative_time_description: string
  text: string
  time: number
}

export interface GoogleReviewsData {
  reviews: GoogleReview[]
  averageRating: number
  totalReviews: number
}

// Chat types
export interface Message {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
}

// Newsletter types
export interface NewsletterSubscriber {
  id: string
  email: string
  isActive: boolean
  subscribedAt: Date
}
