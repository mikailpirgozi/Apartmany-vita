/**
 * Stripe Payment Integration
 * Handles payment intents, webhooks, and booking payments
 */

import Stripe from 'stripe';

// Validate Stripe credentials
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// Server-side only validation (SECRET_KEY should never be in browser)
if (typeof window === 'undefined') {
  // Running on server
  if (!stripeSecretKey && process.env.NODE_ENV === 'production') {
    console.error('STRIPE_SECRET_KEY is missing in production!');
  }
}

// Client-side validation (PUBLIC_KEY is safe in browser)
if (!stripePublishableKey && process.env.NODE_ENV === 'production') {
  console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing in production!');
}

// Server-side Stripe instance
export const stripe = new Stripe(stripeSecretKey || 'sk_test_dummy_key_for_build', {
  apiVersion: '2025-08-27.basil',
  typescript: true,
});

// Client-side publishable key
export const STRIPE_PUBLISHABLE_KEY = stripePublishableKey || 'pk_test_dummy_key_for_build';

export interface PaymentIntentData {
  amount: number; // in euros
  bookingId: string;
  apartmentId: string;
  guestEmail: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
}

export interface BookingPaymentResult {
  paymentIntentId: string;
  clientSecret: string;
  status: string;
}

export interface CheckoutSessionData {
  amount: number; // in euros
  bookingId: string;
  apartmentId: string;
  apartmentName: string;
  guestEmail: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

/**
 * Create payment intent for booking
 * Uses authorize-only mode (manual capture)
 */
export async function createBookingPaymentIntent(data: PaymentIntentData): Promise<BookingPaymentResult> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(data.amount * 100), // Convert to cents
      currency: 'eur',
      capture_method: 'manual', // Authorize now, capture later
      payment_method_types: ['card'],
      metadata: {
        bookingId: data.bookingId,
        apartmentId: data.apartmentId,
        guestEmail: data.guestEmail,
        guestName: data.guestName,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        type: 'booking_payment'
      },
      description: `Apartmány Vita - Rezervácia ${data.bookingId}`,
      receipt_email: data.guestEmail,
      statement_descriptor: 'APARTMANY VITA',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never' // Only card payments for now
      }
    });

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret!,
      status: paymentIntent.status
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new Error('Failed to create payment intent');
  }
}

/**
 * Create Stripe Checkout Session with automatic tax calculation
 * Tax code txcd_10103100 = Hotel/Accommodation (5% VAT in Slovakia)
 */
export async function createCheckoutSession(data: CheckoutSessionData): Promise<CheckoutSessionResult> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${data.apartmentName} - Ubytovanie`,
              description: `${data.nights} ${data.nights === 1 ? 'noc' : data.nights < 5 ? 'noci' : 'nocí'} (${data.checkIn} - ${data.checkOut})`,
              tax_code: 'txcd_20030000', // General Services - 5% VAT in Slovakia for accommodation
            },
            unit_amount: Math.round(data.amount * 100), // Convert to cents
            tax_behavior: 'inclusive', // Price includes VAT - Stripe will calculate the breakdown
          },
          quantity: 1,
        },
      ],
      automatic_tax: {
        enabled: true, // Enable automatic tax calculation
      },
      customer_email: data.guestEmail,
      metadata: {
        bookingId: data.bookingId,
        apartmentId: data.apartmentId,
        guestEmail: data.guestEmail,
        guestName: data.guestName,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        type: 'booking_payment',
      },
      success_url: `${baseUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/booking/cancel?booking_id=${data.bookingId}`,
      locale: 'sk', // Slovak language
    });

    return {
      sessionId: session.id,
      url: session.url!,
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create checkout session');
  }
}

/**
 * Capture authorized payment (call this 7 days before check-in)
 */
export async function captureBookingPayment(paymentIntentId: string): Promise<boolean> {
  try {
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
    return paymentIntent.status === 'succeeded';
  } catch (error) {
    console.error('Error capturing payment:', error);
    return false;
  }
}

/**
 * Cancel authorized payment (for booking cancellations)
 */
export async function cancelBookingPayment(paymentIntentId: string): Promise<boolean> {
  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    return paymentIntent.status === 'canceled';
  } catch (error) {
    console.error('Error canceling payment:', error);
    return false;
  }
}

/**
 * Create refund for captured payment
 */
export async function refundBookingPayment(
  paymentIntentId: string, 
  amount?: number, 
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
): Promise<{ success: boolean; refundId?: string }> {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Partial refund if amount specified
      reason: reason || 'requested_by_customer',
      metadata: {
        type: 'booking_refund'
      }
    });

    return {
      success: refund.status === 'succeeded',
      refundId: refund.id
    };
  } catch (error) {
    console.error('Error creating refund:', error);
    return { success: false };
  }
}

/**
 * Get payment intent details
 */
export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent | null> {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    return null;
  }
}

/**
 * Validate webhook signature
 */
export function validateWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event | null {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error('Webhook signature validation failed:', error);
    return null;
  }
}

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  console.log('Processing Stripe webhook:', event.type);

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;
      
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
      break;
      
    case 'payment_intent.canceled':
      await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
      break;
      
    case 'charge.dispute.created':
      await handleChargeDispute(event.data.object as Stripe.Dispute);
      break;
      
    default:
      console.log(`Unhandled webhook event type: ${event.type}`);
  }
}

/**
 * Handle successful payment authorization
 */
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const bookingId = paymentIntent.metadata.bookingId;
  
  if (!bookingId) {
    console.error('No booking ID in payment intent metadata');
    return;
  }

  try {
    // Update booking status to confirmed
    const { prisma } = await import('@/lib/db');
    
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        paymentId: paymentIntent.id,
        updatedAt: new Date()
      }
    });

    // Send confirmation email
    const { sendBookingConfirmation } = await import('@/services/email');
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        apartment: true
      }
    });

    if (booking) {
      await sendBookingConfirmation(booking, booking.user);
    }

    console.log(`Booking ${bookingId} confirmed after successful payment`);
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const bookingId = paymentIntent.metadata.bookingId;
  
  if (!bookingId) return;

  try {
    const { prisma } = await import('@/lib/db');
    
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    });

    console.log(`Booking ${bookingId} cancelled due to payment failure`);
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

/**
 * Handle canceled payment
 */
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const bookingId = paymentIntent.metadata.bookingId;
  
  if (!bookingId) return;

  try {
    const { prisma } = await import('@/lib/db');
    
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    });

    console.log(`Booking ${bookingId} cancelled due to payment cancellation`);
  } catch (error) {
    console.error('Error handling canceled payment:', error);
  }
}

/**
 * Handle charge dispute
 */
async function handleChargeDispute(dispute: Stripe.Dispute): Promise<void> {
  console.log('Charge dispute created:', dispute.id);
  
  // TODO: Implement dispute handling logic
  // - Notify admin
  // - Gather evidence
  // - Update booking status if needed
}

/**
 * Calculate Stripe fees for transparent pricing
 */
export function calculateStripeFees(amount: number): {
  stripeFee: number;
  netAmount: number;
} {
  // Stripe fees for European cards: 1.4% + €0.25
  const stripeFee = Math.round((amount * 0.014 + 0.25) * 100) / 100;
  const netAmount = Math.round((amount - stripeFee) * 100) / 100;
  
  return { stripeFee, netAmount };
}

/**
 * Format amount for display
 */
export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('sk-SK', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Validate card details format (client-side helper)
 */
export function validateCardNumber(cardNumber: string): boolean {
  // Remove spaces and check if it's a valid length
  const cleaned = cardNumber.replace(/\s/g, '');
  return /^\d{13,19}$/.test(cleaned);
}

export function validateExpiryDate(expiry: string): boolean {
  // Format: MM/YY
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  
  const month = parseInt(match[1]);
  const year = parseInt(match[2]) + 2000;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  if (month < 1 || month > 12) return false;
  if (year < currentYear || (year === currentYear && month < currentMonth)) return false;
  
  return true;
}

export function validateCVC(cvc: string): boolean {
  return /^\d{3,4}$/.test(cvc);
}

/**
 * Payment method types configuration
 */
export const SUPPORTED_PAYMENT_METHODS = {
  card: {
    name: 'Platobná karta',
    description: 'Visa, Mastercard, American Express',
    icon: '💳',
    fees: 'Bez poplatkov'
  }
} as const;

/**
 * Test card numbers for development
 */
export const TEST_CARDS = {
  visa: '4242424242424242',
  visaDebit: '4000056655665556',
  mastercard: '5555555555554444',
  amex: '378282246310005',
  declined: '4000000000000002',
  insufficientFunds: '4000000000009995',
  expired: '4000000000000069'
} as const;
