import { NextRequest, NextResponse } from 'next/server';
import { getBeds24Service } from '@/services/beds24';

/**
 * Test Raw Offers API endpoint - direct Beds24 API call
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propId = searchParams.get('propId') || '357931';
    const roomId = searchParams.get('roomId') || '357931';
    const startDate = searchParams.get('startDate') || '2026-01-02';
    const endDate = searchParams.get('endDate') || '2026-01-15';
    const adults = parseInt(searchParams.get('adults') || '2');
    const children = parseInt(searchParams.get('children') || '0');

    console.log('🧪 Testing Raw Offers API:', { propId, roomId, startDate, endDate, adults, children });

    // Get raw Offers API response
    const accessToken = await getBeds24Service().ensureValidToken();
    
    const url = new URL(`${process.env.BEDS24_BASE_URL || 'https://api.beds24.com/v2'}/inventory/rooms/offers`);
    url.searchParams.append('arrival', startDate);
    url.searchParams.append('departure', endDate);
    url.searchParams.append('numAdults', adults.toString());
    url.searchParams.append('numChildren', children.toString());
    url.searchParams.append('propertyId', propId);
    url.searchParams.append('roomId', roomId);

    console.log('Raw Offers URL:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'token': accessToken,
        'User-Agent': 'ApartmanyVita/1.0'
      }
    });

    console.log('Raw Offers response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Raw Offers API error:', errorText);
      
      return NextResponse.json({
        success: false,
        status: response.status,
        error: errorText,
        timestamp: new Date().toISOString()
      }, { status: response.status });
    }

    const rawData = await response.json();
    console.log('Raw Offers data received:', JSON.stringify(rawData, null, 2));

    return NextResponse.json({
      success: true,
      data: {
        rawOffers: {
          success: true,
          status: response.status,
          data: rawData
        },
        parameters: { propId, roomId, startDate, endDate, adults, children }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Raw Offers API test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
