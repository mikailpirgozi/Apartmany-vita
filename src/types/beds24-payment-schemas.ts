// Beds24 API Schemas - Payment & Stripe Types
// ============================================

// Stripe Create Session
export interface StripeCreateSession {
  [key: string]: unknown;
}

// Stripe Charge Payment Method
export interface StripeChargePaymentMethod {
  [key: string]: unknown;
}

// Stripe Refund Charge
export interface StripeRefundCharge {
  [key: string]: unknown;
}

// Stripe Release Charge
export interface StripeReleaseCharge {
  [key: string]: unknown;
}

// Stripe Capture Charge
export interface StripeCaptureCharge {
  [key: string]: unknown;
}

// Stripe Add Payment Method
export interface StripeAddPaymentMethod {
  [key: string]: unknown;
}

// Stripe Detach Payment Method
export interface StripeDetachPaymentMethod {
  [key: string]: unknown;
}

// Stripe Payment Method
export interface StripePaymentMethod {
  [key: string]: unknown;
}

// Stripe Charge
export interface StripeCharge {
  [key: string]: unknown;
}

// VRBO Payment Schedule
export interface VrboPaymentSchedule {
  [key: string]: unknown;
}

// Index file for all Beds24 schemas
export * from './beds24-api-schemas';
export * from './beds24-booking-schemas';
export * from './beds24-property-schemas';
export * from './beds24-room-schemas';
export * from './beds24-availability-schemas';
export * from './beds24-account-schemas';
export * from './beds24-settings-schemas';
export * from './beds24-payment-schemas';
