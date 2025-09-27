import { NextRequest, NextResponse } from 'next/server';

/**
 * Direct Beds24 API V1 test endpoint
 * GET /api/beds24/direct-test
 */
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.BEDS24_API_KEY || 'AbDalfEtyekmentOsVeb';
    const propId = process.env.BEDS24_PROP_ID || '357931';
    
    console.log('Testing Beds24 API V1 with:', { apiKey, propId });

    // Test 1: Basic API connection - Beds24 API V1 format
    const testUrl = `https://beds24.com/api/getBookings.php?propKey=${apiKey}&startDate=2024-12-01&endDate=2024-12-07`;
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ApartmanyVita/1.0'
      }
    });

    const responseText = await response.text();
    
    return NextResponse.json({
      success: true,
      message: 'Beds24 API V1 direct test completed',
      test: {
        url: testUrl,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        response: responseText
      },
      config: {
        apiKey,
        propId,
        baseUrl: 'https://beds24.com/api'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Beds24 direct test error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Beds24 API V1 direct test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}