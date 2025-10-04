/**
 * Beds24 API Types
 * Type definitions for Beds24 integration
 */

export interface Beds24Config {
  accessToken: string;
  refreshToken: string;
  baseUrl: string;
  propId: string;
  tokenExpiresAt?: number;
}

export interface AvailabilityRequest {
  propId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  roomId?: string;
  numAdults?: number;
  numChildren?: number;
}

export interface AvailabilityResponse {
  available: string[];  // Array of available dates
  booked: string[];     // Array of booked dates
  prices: Record<string, number>; // Date -> price mapping
  minStay: number;
  maxStay: number;
}

export interface BookingData {
  propId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  numAdult: number;
  numChild: number;
  guestFirstName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  totalPrice: number;
  bookingId?: string;
}

export interface Beds24Booking {
  bookId: string;
  status: 'new' | 'confirmed' | 'cancelled';
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  guestName: string;
  guestEmail: string;
}

export interface RateLimitInfo {
  fiveMinLimit?: number;
  fiveMinRemaining?: number;
  fiveMinResetsIn?: number;
  requestCost?: number;
}

export interface TokenRefreshResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface CalendarDataRequest {
  propId: string;
  roomId: string;
  startDate: string;
  endDate: string;
}

export interface CalendarDataResponse {
  available: string[];
  booked: string[];
  prices: Record<string, number>;
  minStay: number;
  maxStay: number;
}

export interface PropertyConfig {
  propId: string;
  roomId: string;
  name: string;
  checkInTime: string;
  checkOutTime: string;
  maxGuests: number;
  basePrice: number;
}
