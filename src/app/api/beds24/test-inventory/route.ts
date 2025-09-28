import { NextRequest, NextResponse } from 'next/server';
import { getBeds24Service } from '@/services/beds24';

/**
 * Test Raw Inventory API endpoint - direct Beds24 API call
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propId = searchParams.get('propId') || '161445';
    const roomId = searchParams.get('roomId') || '357931';
    const startDate = searchParams.get('startDate') || '2026-01-02';
    const endDate = searchParams.get('endDate') || '2026-01-15';

    console.log('🧪 Testing Raw Inventory API:', { propId, roomId, startDate, endDate });

    // Get raw Inventory API response
    const accessToken = await getBeds24Service().ensureValidToken();
    
    const url = new URL(`${process.env.BEDS24_BASE_URL || 'https://api.beds24.com/v2'}/inventory`);
    url.searchParams.append('startDate', startDate);
    url.searchParams.append('endDate', endDate);
    url.searchParams.append('propertyId', propId);
    url.searchParams.append('roomId', roomId);

    console.log('Raw Inventory URL:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'token': accessToken,
        'User-Agent': 'ApartmanyVita/1.0'
      }
    });

    console.log('Raw Inventory response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Raw Inventory API error:', errorText);
      
      return NextResponse.json({
        success: false,
        status: response.status,
        error: errorText,
        timestamp: new Date().toISOString()
      }, { status: response.status });
    }

    const rawData = await response.json();
    console.log('Raw Inventory data received:', JSON.stringify(rawData, null, 2));

    return NextResponse.json({
      success: true,
      data: {
        rawInventory: {
          success: true,
          status: response.status,
          data: rawData
        },
        parameters: { propId, roomId, startDate, endDate }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Raw Inventory API test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
