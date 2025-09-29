import { NextResponse } from 'next/server';

/**
 * Debug endpoint to check environment variables (PRODUCTION SAFE)
 * Only shows if variables exist, not their values
 */
export async function GET() {
  // Import database validation
  const { validateDatabaseUrl, getDatabaseInfo } = await import('@/lib/db-check');
  const dbValidation = validateDatabaseUrl();
  const dbInfo = getDatabaseInfo();
  
  const envCheck = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    databaseValidation: {
      isValid: dbValidation.valid,
      error: dbValidation.error || null,
      info: dbInfo
    },
    beds24: {
      hasLongLifeToken: !!process.env.BEDS24_LONG_LIFE_TOKEN,
      longLifeTokenLength: process.env.BEDS24_LONG_LIFE_TOKEN?.length || 0,
      hasAccessToken: !!process.env.BEDS24_ACCESS_TOKEN,
      accessTokenLength: process.env.BEDS24_ACCESS_TOKEN?.length || 0,
      hasRefreshToken: !!process.env.BEDS24_REFRESH_TOKEN,
      refreshTokenLength: process.env.BEDS24_REFRESH_TOKEN?.length || 0,
    },
    database: {
      hasUrl: !!process.env.DATABASE_URL,
      urlLength: process.env.DATABASE_URL?.length || 0,
      urlPrefix: process.env.DATABASE_URL?.substring(0, 20) || 'N/A'
    },
    nextAuth: {
      hasSecret: !!process.env.NEXTAUTH_SECRET,
      secretLength: process.env.NEXTAUTH_SECRET?.length || 0,
      hasUrl: !!process.env.NEXTAUTH_URL,
      url: process.env.NEXTAUTH_URL
    },
    stripe: {
      hasPublicKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET
    },
    redis: {
      hasUrl: !!process.env.REDIS_URL,
      hasHost: !!process.env.REDIS_HOST
    }
  };

  return NextResponse.json(envCheck);
}