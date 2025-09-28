import { NextRequest, NextResponse } from 'next/server';
import { beds24Service } from '@/services/beds24';

/**
 * Test Raw Inventory POST API endpoint - direct Beds24 API call
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propId = searchParams.get('propId') || '161445';
    const roomId = searchParams.get('roomId') || '357931';
    const startDate = searchParams.get('startDate') || '2026-01-02';
    const endDate = searchParams.get('endDate') || '2026-01-15';

    console.log('🧪 Testing Raw Inventory POST API:', { propId, roomId, startDate, endDate });

    // Get raw Inventory API response using POST
    const accessToken = await beds24Service['ensureValidToken']();
    
    const requestBody = {
      authentication: {
        apiKey: process.env.BEDS24_ACCESS_TOKEN,
        propKey: propId
      },
      request: {
        startDate,
        endDate,
        includeInactive: false,
        includeRates: true,
        roomId: roomId
      }
    };

    console.log('Raw Inventory POST request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${process.env.BEDS24_BASE_URL || 'https://api.beds24.com/v2'}/inventory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'token': accessToken,
        'User-Agent': 'ApartmanyVita/1.0'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Raw Inventory POST response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Raw Inventory POST API error:', errorText);
      
      return NextResponse.json({
        success: false,
        status: response.status,
        error: errorText,
        timestamp: new Date().toISOString()
      }, { status: response.status });
    }

    const rawData = await response.json();
    console.log('Raw Inventory POST data received:', JSON.stringify(rawData, null, 2));

    return NextResponse.json({
      success: true,
      data: {
        rawInventoryPost: {
          success: true,
          status: response.status,
          data: rawData
        },
        parameters: { propId, roomId, startDate, endDate }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Raw Inventory POST API test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
