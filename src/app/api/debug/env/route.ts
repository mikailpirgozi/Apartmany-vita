import { NextResponse } from 'next/server';

/**
 * Debug endpoint to check environment variables on production
 * Shows which BEDS24 variables are available (without exposing values)
 */
export async function GET() {
  try {
    console.log('🔍 Checking environment variables on production...');
    
    const envCheck = {
      // BEDS24 Configuration
      hasBeds24AccessToken: !!process.env.BEDS24_ACCESS_TOKEN,
      beds24AccessTokenLength: process.env.BEDS24_ACCESS_TOKEN?.length || 0,
      hasBeds24RefreshToken: !!process.env.BEDS24_REFRESH_TOKEN,
      beds24RefreshTokenLength: process.env.BEDS24_REFRESH_TOKEN?.length || 0,
      // LONG LIFE TOKEN
      hasBeds24LongLifeToken: !!process.env.BEDS24_LONG_LIFE_TOKEN,
      beds24LongLifeTokenLength: process.env.BEDS24_LONG_LIFE_TOKEN?.length || 0,
      beds24BaseUrl: process.env.BEDS24_BASE_URL || 'not set',
      beds24PropId: process.env.BEDS24_PROP_ID || 'not set',
      
      // Database
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      
      // NextAuth
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      
      // Environment
      nodeEnv: process.env.NODE_ENV || 'not set',
      vercelEnv: process.env.VERCEL_ENV || 'not set',
      
      // App URL
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'not set',
      
      timestamp: new Date().toISOString()
    };
    
    console.log('Environment check result:', envCheck);
    
    return NextResponse.json({
      success: true,
      environment: envCheck,
      message: 'Environment variables check completed'
    });
    
  } catch (error) {
    console.error('❌ Environment check failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
