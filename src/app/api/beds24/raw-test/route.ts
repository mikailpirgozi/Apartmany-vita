import { NextRequest, NextResponse } from 'next/server';

/**
 * Raw test endpoint pre priame volanie Beds24 API
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apartment = searchParams.get('apartment') || 'deluxe-apartman';
    
    // Mapovanie apartmánov na Beds24 IDs
    const apartmentMapping: Record<string, { propId: string; roomId: string }> = {
      'design-apartman': { propId: '227484', roomId: '483027' },
      'lite-apartman': { propId: '168900', roomId: '168900' },
      'deluxe-apartman': { propId: '161445', roomId: '161445' }
    };

    const apartmentConfig = apartmentMapping[apartment];
    if (!apartmentConfig) {
      return NextResponse.json({ error: `Unknown apartment: ${apartment}` }, { status: 400 });
    }

    const accessToken = process.env.BEDS24_ACCESS_TOKEN || 'XwJnUUA7YS9aHRIBFPhVWiIEBlb/+whEpT0SRe7m5IWp30A9+uJlz54IN+KTAYSFNkftzJQ9ODvTYrafP6c2o3sUExKkk288hi7lKcuJZ8zxfh3CxnUZckm/W3dGGs1ibWb1BIr/ch69m5RKYemFu/Rn6KfTjwgMUi+zyCgifcg=';
    const baseUrl = 'https://api.beds24.com/v2';

    console.log(`\n=== RAW BEDS24 TEST FOR ${apartment.toUpperCase()} ===`);
    console.log('PropId:', apartmentConfig.propId);
    console.log('RoomId:', apartmentConfig.roomId);

    // Test 1: Raw inventory call
    const inventoryBody = {
      authentication: {
        apiKey: accessToken,
        propKey: apartmentConfig.propId
      },
      request: {
        startDate: '2025-10-01',
        endDate: '2025-10-03',
        includeInactive: false,
        includeRates: true,
        includeAvailability: true,
        roomId: apartmentConfig.roomId
      }
    };

    console.log('Inventory request body:', JSON.stringify(inventoryBody, null, 2));

    const inventoryResponse = await fetch(`${baseUrl}/inventory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': accessToken
      },
      body: JSON.stringify(inventoryBody)
    });

    console.log('Inventory response status:', inventoryResponse.status);
    const inventoryData = await inventoryResponse.json();
    console.log('Inventory response data:', JSON.stringify(inventoryData, null, 2));

    // Test 2: Raw bookings call
    const bookingsUrl = new URL(`${baseUrl}/bookings`);
    bookingsUrl.searchParams.append('propId', apartmentConfig.propId);
    bookingsUrl.searchParams.append('roomId', apartmentConfig.roomId);
    bookingsUrl.searchParams.append('checkIn', '2025-10-01');
    bookingsUrl.searchParams.append('checkOut', '2025-10-03');

    console.log('Bookings URL:', bookingsUrl.toString());

    const bookingsResponse = await fetch(bookingsUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'token': accessToken
      }
    });

    console.log('Bookings response status:', bookingsResponse.status);
    const bookingsData = await bookingsResponse.json();
    console.log('Bookings response data:', JSON.stringify(bookingsData, null, 2));

    return NextResponse.json({
      success: true,
      apartment,
      propId: apartmentConfig.propId,
      roomId: apartmentConfig.roomId,
      inventory: {
        status: inventoryResponse.status,
        data: inventoryData
      },
      bookings: {
        status: bookingsResponse.status,
        data: bookingsData
      }
    });

  } catch (error) {
    console.error('Raw test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
