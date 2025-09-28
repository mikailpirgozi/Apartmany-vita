// Beds24 API Schemas - Core Response Types
// ========================================

export interface SuccessfulApiResponse<T = unknown> {
  success: true;
  type?: string;
  count?: number;
  data?: T;
  pages?: Pages;
}

export interface UnsuccessfulApiResponse {
  success: false;
  type: string;
  code: number;
  error: string;
}

export type ApiResponse<T = unknown> = SuccessfulApiResponse<T> | UnsuccessfulApiResponse;

// Pagination
export interface Pages {
  nextPageExists: boolean;
  nextPageLink?: string;
}

// Authentication - Enhanced per official Beds24 API V2 OpenAPI specification
export interface Token {
  token: string;
  expiresIn: number;
}

export interface RefreshToken {
  token: string;
  expiresIn: number;
  refreshToken: string;
}

// ENHANCED: Official response formats per OpenAPI specification

export interface Pages {
  nextPageExists: boolean;
  nextPageLink?: string;
}

export interface TokenDetails {
  validToken: boolean;
  token?: {
    ownerId: number;
    expiresIn: number;
    created: string;
    scopes: string[];
    deviceName: string;
    linkedProperties: boolean;
    onlyPropertyId?: number;
    whiteListOnly: boolean;
    whiteList: string[];
  };
  diagnostics?: {
    requestIp: string;
  };
}

// Multiple Operations Response
export interface MultiplePostResponse {
  success: boolean;
  new?: {
    field: string;
    subField: any[];
  };
  modified?: {
    field: string;
    subField: any[];
  };
  errors?: any[];
  warnings?: any[];
  info?: any[];
}

// Common Enums
export type BookingStatus = 'confirmed' | 'request' | 'new' | 'cancelled' | 'black' | 'inquiry';
export type BookingSubStatus = 'actionRequired' | 'allotment' | 'cancelledByGuest' | 'cancelledByHost' | 'noShow' | 'waitlist' | 'walkin' | 'none' | 'nonPayment';
export type BookingChannel = 'agoda' | 'airbnb' | 'booking' | 'vrbo' | 'expedia' | 'tripadvisorrentals' | 'hrs' | 'hostelworld' | 'traveloka' | 'tiket' | 'tomastravel' | 'traumferienwohnungen' | 'vacationstay' | 'webroomsconz';
export type PropertyType = 'apartment' | 'bedAndBreakfast' | 'cabin' | 'guesthouse' | 'hostel' | 'hotel' | 'house' | 'villa' | 'aparthotel' | 'barn' | 'boat' | 'boutiqueHotel' | 'building' | 'bungalow' | 'camping' | 'caravan' | 'casaParticular' | 'castle' | 'chacara' | 'chalet' | 'chateau' | 'condo' | 'cottage' | 'House' | 'estate' | 'farmhouse' | 'heritageHotel' | 'houseBoat' | 'lodge' | 'loft' | 'mas' | 'mill' | 'mobileHome' | 'recreationalVehicle' | 'resort' | 'riad' | 'servicedApartment' | 'studio' | 'tent' | 'tour' | 'tower' | 'townhome' | 'treeHouse' | 'yacht';
export type RoomType = 'single' | 'double' | 'twin' | 'triple' | 'quad' | 'family' | 'suite' | 'apartment' | 'studio' | 'dormitory' | 'bungalow' | 'villa' | 'chalet' | 'cabin' | 'cottage' | 'loft' | 'penthouse' | 'maisonette' | 'duplex' | 'townhouse' | 'condo' | 'house';
export type BookingType = 'blackoutPeriod' | 'autoConfirmed' | 'requestWithManualConfirmation' | 'requestWithCreditCard' | 'confirmedWithCreditCard' | 'confirmedWithDepositCollection1' | 'confirmedWithDepositCollection2';
export type CancellationType = 'propertyDefault' | 'never' | 'always' | 'daysBeforeArrival';
export type MessageSource = 'host' | 'guest' | 'internalNote' | 'system';
export type InvoiceItemType = 'charge' | 'payment';

// ENHANCED: Additional types from official Beds24 API V2 documentation
export interface ApiError {
  success: false;
  code: number;
  error: string;
  details?: string;
}

export interface ApiSuccess<T = unknown> {
  success: true;
  type: string;
  count?: number;
  data?: T;
  pages?: Pages;
}

// ApiResponse is already defined above

// Rate limiting and performance - Enhanced per official OpenAPI specification
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// ENHANCED: Official rate limiting headers per OpenAPI specification
export interface Beds24RateLimitHeaders {
  'X-FiveMinCreditLimit'?: string;
  'X-FiveMinCreditLimit-ResetsIn'?: string;
  'X-FiveMinCreditLimit-Remaining'?: string;
  'X-RequestCost'?: string;
}

// Enhanced request headers
export interface ApiHeaders {
  'Content-Type': string;
  'Accept': string;
  'token': string;
  'User-Agent': string;
  'X-Request-ID'?: string;
}
