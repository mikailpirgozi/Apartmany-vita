import { NextResponse } from 'next/server';

/**
 * Production-safe database check endpoint
 * Returns obfuscated connection info without exposing credentials
 */
export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    return NextResponse.json({
      status: 'error',
      error: 'DATABASE_URL is not configured',
      message: 'Please set DATABASE_URL in Railway environment variables',
      documentation: 'https://docs.railway.app/guides/postgresql',
    }, { status: 500 });
  }

  try {
    // Parse DATABASE_URL safely
    const url = new URL(dbUrl);
    
    return NextResponse.json({
      status: 'configured',
      protocol: url.protocol.replace(':', ''),
      host: url.hostname.substring(0, 15) + '***',
      port: url.port || 'default',
      database: url.pathname.split('/')[1]?.substring(0, 10) + '***' || 'unknown',
      isValidFormat: true,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: 'Invalid DATABASE_URL format',
      message: 'DATABASE_URL exists but has invalid format',
      expectedFormat: 'postgresql://user:password@host:port/database',
      actualPrefix: dbUrl.substring(0, 20) + '***',
    }, { status: 500 });
  }
}
