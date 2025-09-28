// Beds24 API Schemas - Payment & Stripe Types
// ============================================

// Stripe Create Session
export interface StripeCreateSession {
  [key: string]: any;
}

// Stripe Charge Payment Method
export interface StripeChargePaymentMethod {
  [key: string]: any;
}

// Stripe Refund Charge
export interface StripeRefundCharge {
  [key: string]: any;
}

// Stripe Release Charge
export interface StripeReleaseCharge {
  [key: string]: any;
}

// Stripe Capture Charge
export interface StripeCaptureCharge {
  [key: string]: any;
}

// Stripe Add Payment Method
export interface StripeAddPaymentMethod {
  [key: string]: any;
}

// Stripe Detach Payment Method
export interface StripeDetachPaymentMethod {
  [key: string]: any;
}

// Stripe Payment Method
export interface StripePaymentMethod {
  [key: string]: any;
}

// Stripe Charge
export interface StripeCharge {
  [key: string]: any;
}

// VRBO Payment Schedule
export interface VrboPaymentSchedule {
  [key: string]: any;
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
