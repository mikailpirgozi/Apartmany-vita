/**
 * Beds24 API Constants
 * Centralized configuration for Beds24 integration
 */

export const BEDS24_CONFIG = {
  API_BASE_URL: 'https://api.beds24.com/v2',
  API_VERSION: 'v2',
  TIMEOUT: 10000, // 10 seconds
} as const;

/**
 * Apartment to Beds24 Property/Room ID Mapping
 * SINGLE SOURCE OF TRUTH - Use this everywhere!
 */
export const BEDS24_APARTMENT_MAPPING = {
  'design-apartman': {
    propId: '227484',
    roomId: '483027',
    name: 'Design Apartmán',
    slug: 'design-apartman'
  },
  'lite-apartman': {
    propId: '168900',
    roomId: '357932',
    name: 'Lite Apartmán',
    slug: 'lite-apartman'
  },
  'deluxe-apartman': {
    propId: '161445',
    roomId: '357931',
    name: 'Deluxe Apartmán',
    slug: 'deluxe-apartman'
  }
} as const;

/**
 * Type-safe apartment slug
 */
export type ApartmentSlug = keyof typeof BEDS24_APARTMENT_MAPPING;

/**
 * Get Beds24 config for apartment
 */
export function getBeds24Config(apartmentSlug: string) {
  const config = BEDS24_APARTMENT_MAPPING[apartmentSlug as ApartmentSlug];
  
  if (!config) {
    throw new Error(`Unknown apartment slug: ${apartmentSlug}`);
  }
  
  return config;
}

/**
 * Check if apartment slug is valid
 */
export function isValidApartmentSlug(slug: string): slug is ApartmentSlug {
  return slug in BEDS24_APARTMENT_MAPPING;
}

/**
 * Get all apartment slugs
 */
export function getAllApartmentSlugs(): ApartmentSlug[] {
  return Object.keys(BEDS24_APARTMENT_MAPPING) as ApartmentSlug[];
}

/**
 * Beds24 API Error Codes
 */
export const BEDS24_ERROR_CODES = {
  INVALID_TOKEN: 'INVALID_TOKEN',
  PROPERTY_NOT_FOUND: 'PROPERTY_NOT_FOUND',
  ROOM_NOT_AVAILABLE: 'ROOM_NOT_AVAILABLE',
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
  BOOKING_FAILED: 'BOOKING_FAILED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

/**
 * Beds24 Booking Status
 */
export const BEDS24_BOOKING_STATUS = {
  NEW: 'new',
  REQUEST: 'request',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  CHECKED_IN: 'checked_in',
  CHECKED_OUT: 'checked_out',
} as const;

export type Beds24BookingStatus = typeof BEDS24_BOOKING_STATUS[keyof typeof BEDS24_BOOKING_STATUS];
