import { NextResponse } from 'next/server';

/**
 * Debug endpoint to check environment variables configuration
 * SECURITY: Only accessible in development or with admin access
 */
export async function GET() {
  // Security check - only in development or with proper auth
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ 
      error: 'This endpoint is only available in development mode',
      hint: 'For production, check Railway dashboard variables'
    }, { status: 403 });
  }

  const dbUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_DATABASE_URL;
  
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    database: {
      configured: !!dbUrl,
      urlPrefix: dbUrl ? dbUrl.substring(0, 30) + '...' : 'NOT SET',
      protocol: dbUrl ? dbUrl.split('://')[0] : 'N/A',
      hasDirectUrl: !!directUrl,
    },
    auth: {
      nextAuthUrl: process.env.NEXTAUTH_URL || 'NOT SET',
      nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
    },
    beds24: {
      longLifeToken: process.env.BEDS24_LONG_LIFE_TOKEN ? 'SET' : 'NOT SET',
      baseUrl: process.env.BEDS24_BASE_URL || 'NOT SET',
    },
    stripe: {
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'SET' : 'NOT SET',
      secretKey: process.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET',
    },
  });
}