import { NextRequest, NextResponse } from 'next/server';
import { getBeds24Service } from '@/services/beds24';

/**
 * Debug endpoint for BEDS24 authentication
 * Shows token information without exposing sensitive data
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debugging BEDS24 authentication...');
    
    const beds24Service = getBeds24Service();
    
    if (!beds24Service) {
      return NextResponse.json({
        success: false,
        error: 'Beds24Service not available - check environment variables',
        debug: {
          hasAccessToken: !!process.env.BEDS24_ACCESS_TOKEN,
          hasRefreshToken: !!process.env.BEDS24_REFRESH_TOKEN,
          timestamp: new Date().toISOString()
        }
      }, { status: 500 });
    }
    
    // Get current token (this will trigger refresh if needed)
    const accessToken = await beds24Service.ensureValidToken();
    
    // Test the token with a simple API call
    const testResponse = await fetch('https://api.beds24.com/v2/authentication/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        refreshToken: process.env.BEDS24_REFRESH_TOKEN
      })
    });
    
    const testData = await testResponse.json();
    
    return NextResponse.json({
      success: true,
      debug: {
        hasAccessToken: !!accessToken,
        accessTokenLength: accessToken?.length || 0,
        accessTokenPrefix: accessToken?.substring(0, 10) + '...',
        hasRefreshToken: !!process.env.BEDS24_REFRESH_TOKEN,
        refreshTokenLength: process.env.BEDS24_REFRESH_TOKEN?.length || 0,
        refreshTokenPrefix: process.env.BEDS24_REFRESH_TOKEN?.substring(0, 10) + '...',
        baseUrl: 'https://api.beds24.com/v2',
        propId: process.env.BEDS24_PROP_ID || '357931',
        tokenTestResponse: {
          status: testResponse.status,
          ok: testResponse.ok,
          hasData: !!testData,
          dataKeys: Object.keys(testData || {})
        },
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ BEDS24 auth debug failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        hasAccessToken: !!process.env.BEDS24_ACCESS_TOKEN,
        hasRefreshToken: !!process.env.BEDS24_REFRESH_TOKEN,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}
