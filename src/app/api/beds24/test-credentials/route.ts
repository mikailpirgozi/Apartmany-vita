import { NextRequest, NextResponse } from 'next/server';

/**
 * Test BEDS24 credentials directly
 * This endpoint tests if the current credentials work with BEDS24 API
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing BEDS24 credentials...');
    
    const accessToken = process.env.BEDS24_ACCESS_TOKEN;
    const refreshToken = process.env.BEDS24_REFRESH_TOKEN;
    
    if (!accessToken || !refreshToken) {
      return NextResponse.json({
        success: false,
        error: 'BEDS24 credentials not configured',
        details: {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken
        }
      }, { status: 500 });
    }
    
    // Test 1: Try to refresh token
    console.log('Testing token refresh...');
    const refreshResponse = await fetch('https://api.beds24.com/v2/authentication/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        refreshToken: refreshToken
      })
    });
    
    const refreshData = await refreshResponse.json();
    console.log('Token refresh result:', {
      status: refreshResponse.status,
      ok: refreshResponse.ok,
      data: refreshData
    });
    
    // Test 2: Try to use current access token
    console.log('Testing current access token...');
    const testResponse = await fetch('https://api.beds24.com/v2/inventory/rooms/calendar?startDate=2025-09-01&endDate=2025-09-02&propertyId=161445&includePrices=true', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'token': accessToken,
        'User-Agent': 'ApartmanyVita/1.0'
      }
    });
    
    const testData = await testResponse.json();
    console.log('Calendar API test result:', {
      status: testResponse.status,
      ok: testResponse.ok,
      data: testData
    });
    
    return NextResponse.json({
      success: true,
      tests: {
        tokenRefresh: {
          status: refreshResponse.status,
          ok: refreshResponse.ok,
          hasNewToken: !!(refreshData.accessToken || refreshData.token),
          data: refreshData
        },
        calendarApi: {
          status: testResponse.status,
          ok: testResponse.ok,
          data: testData
        }
      },
      credentials: {
        hasAccessToken: !!accessToken,
        accessTokenLength: accessToken?.length || 0,
        hasRefreshToken: !!refreshToken,
        refreshTokenLength: refreshToken?.length || 0
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ BEDS24 credentials test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        hasAccessToken: !!process.env.BEDS24_ACCESS_TOKEN,
        hasRefreshToken: !!process.env.BEDS24_REFRESH_TOKEN,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}
