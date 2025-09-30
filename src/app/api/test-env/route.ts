import { NextResponse } from 'next/server';

/**
 * Environment Variables Test Endpoint
 * 
 * Tests if all critical environment variables are properly configured
 * 
 * SECURITY: This endpoint should be DISABLED or PROTECTED in production!
 * Only use for debugging deployment issues.
 * 
 * Usage: GET /api/test-env
 */

export async function GET() {
  // SECURITY CHECK: Disable in production
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DEBUG_ENDPOINTS !== 'true') {
    return NextResponse.json(
      { error: 'Debug endpoints are disabled in production' },
      { status: 403 }
    );
  }

  // Test critical environment variables
  const envStatus = {
    // Database
    DATABASE_URL: {
      exists: !!process.env.DATABASE_URL,
      isValid: process.env.DATABASE_URL?.startsWith('postgresql://') || 
               process.env.DATABASE_URL?.startsWith('postgres://') ||
               process.env.DATABASE_URL?.startsWith('prisma://'),
      length: process.env.DATABASE_URL?.length || 0,
      protocol: process.env.DATABASE_URL?.split('://')[0] || 'N/A'
    },
    
    // NextAuth
    NEXTAUTH_SECRET: {
      exists: !!process.env.NEXTAUTH_SECRET,
      length: process.env.NEXTAUTH_SECRET?.length || 0,
      isValid: (process.env.NEXTAUTH_SECRET?.length || 0) >= 32
    },
    NEXTAUTH_URL: {
      exists: !!process.env.NEXTAUTH_URL,
      value: process.env.NEXTAUTH_URL || 'NOT_SET',
      isValid: !!process.env.NEXTAUTH_URL
    },
    
    // Google OAuth
    GOOGLE_CLIENT_ID: {
      exists: !!process.env.GOOGLE_CLIENT_ID,
      isValid: process.env.GOOGLE_CLIENT_ID?.includes('.apps.googleusercontent.com') || false
    },
    GOOGLE_CLIENT_SECRET: {
      exists: !!process.env.GOOGLE_CLIENT_SECRET,
      length: process.env.GOOGLE_CLIENT_SECRET?.length || 0
    },
    
    // Beds24
    BEDS24_LONG_LIFE_TOKEN: {
      exists: !!process.env.BEDS24_LONG_LIFE_TOKEN,
      length: process.env.BEDS24_LONG_LIFE_TOKEN?.length || 0
    },
    BEDS24_PROP_ID_DELUXE: {
      exists: !!process.env.BEDS24_PROP_ID_DELUXE,
      value: process.env.BEDS24_PROP_ID_DELUXE || 'NOT_SET'
    },
    BEDS24_ROOM_ID_DELUXE: {
      exists: !!process.env.BEDS24_ROOM_ID_DELUXE,
      value: process.env.BEDS24_ROOM_ID_DELUXE || 'NOT_SET'
    },
    
    // Stripe
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
      exists: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      isTest: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_') || false,
      isLive: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_live_') || false
    },
    STRIPE_SECRET_KEY: {
      exists: !!process.env.STRIPE_SECRET_KEY,
      isTest: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') || false,
      isLive: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') || false
    },
    STRIPE_WEBHOOK_SECRET: {
      exists: !!process.env.STRIPE_WEBHOOK_SECRET,
      isValid: process.env.STRIPE_WEBHOOK_SECRET?.startsWith('whsec_') || false
    }
  };

  // Calculate summary
  const criticalVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'BEDS24_LONG_LIFE_TOKEN'
  ];

  const criticalIssues: string[] = [];
  
  if (!envStatus.DATABASE_URL.exists || !envStatus.DATABASE_URL.isValid) {
    criticalIssues.push('DATABASE_URL is not properly configured');
  }
  if (!envStatus.NEXTAUTH_SECRET.exists || !envStatus.NEXTAUTH_SECRET.isValid) {
    criticalIssues.push('NEXTAUTH_SECRET is missing or too short (min 32 characters)');
  }
  if (!envStatus.NEXTAUTH_URL.exists) {
    criticalIssues.push('NEXTAUTH_URL is not set');
  }
  if (!envStatus.BEDS24_LONG_LIFE_TOKEN.exists) {
    criticalIssues.push('BEDS24_LONG_LIFE_TOKEN is not set');
  }

  const warnings: string[] = [];
  
  if (!envStatus.GOOGLE_CLIENT_ID.exists || !envStatus.GOOGLE_CLIENT_SECRET.exists) {
    warnings.push('Google OAuth is not configured (optional but recommended)');
  }
  if (!envStatus.STRIPE_SECRET_KEY.exists || !envStatus.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.exists) {
    warnings.push('Stripe payment is not configured (required for bookings)');
  }

  const summary = {
    status: criticalIssues.length === 0 ? 'READY' : 'NOT_READY',
    environment: process.env.NODE_ENV || 'unknown',
    timestamp: new Date().toISOString(),
    criticalIssues,
    warnings,
    readyForBookings: 
      envStatus.DATABASE_URL.isValid &&
      envStatus.NEXTAUTH_SECRET.isValid &&
      envStatus.BEDS24_LONG_LIFE_TOKEN.exists &&
      envStatus.STRIPE_SECRET_KEY.exists
  };

  return NextResponse.json({
    summary,
    details: envStatus
  }, {
    status: criticalIssues.length === 0 ? 200 : 500
  });
}
