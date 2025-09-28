import { NextRequest, NextResponse } from 'next/server';
import { getBeds24Service } from '@/services/beds24';

/**
 * Test endpoint for BEDS24 token refresh functionality
 * This helps debug token refresh issues in production
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing BEDS24 token refresh...');
    
    const beds24Service = getBeds24Service();
    
    // Test token refresh
    const startTime = Date.now();
    const accessToken = await beds24Service.ensureValidToken();
    const responseTime = Date.now() - startTime;
    
    console.log('✅ Token refresh test successful:', {
      hasToken: !!accessToken,
      tokenLength: accessToken?.length || 0,
      responseTime: `${responseTime}ms`
    });
    
    return NextResponse.json({
      success: true,
      message: 'Token refresh test successful',
      data: {
        hasToken: !!accessToken,
        tokenLength: accessToken?.length || 0,
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Token refresh test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        timestamp: new Date().toISOString(),
        hasBeds24Config: !!(process.env.BEDS24_ACCESS_TOKEN && process.env.BEDS24_REFRESH_TOKEN)
      }
    }, { status: 500 });
  }
}
