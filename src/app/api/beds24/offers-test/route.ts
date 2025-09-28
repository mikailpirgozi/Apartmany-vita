import { NextRequest, NextResponse } from 'next/server';

/**
 * Test endpoint pre Beds24 offers API
 * Testuje nový /inventory/rooms/offers endpoint s správnymi parametrami
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apartment = searchParams.get('apartment') || 'deluxe-apartman';
    const arrival = searchParams.get('arrival') || '2025-10-01';
    const departure = searchParams.get('departure') || '2025-10-03';
    const numAdults = parseInt(searchParams.get('numAdults') || '2');
    const numChildren = parseInt(searchParams.get('numChildren') || '0');

    const accessToken = process.env.BEDS24_ACCESS_TOKEN || 'XwJnUUA7YS9aHRIBFPhVWiIEBlb/+whEpT0SRe7m5IWp30A9+uJlz54IN+KTAYSFNkftzJQ9ODvTYrafP6c2o3sUExKkk288hi7lKcuJZ8zxfh3CxnUZckm/W3dGGs1ibWb1BIr/ch69m5RKYemFu/Rn6KfTjwgMUi+zyCgifcg=';

    // Apartmány konfigurácia
    const apartmentMapping: Record<string, { propId: string; roomId: string; name: string }> = {
      'design-apartman': { propId: '227484', roomId: '483027', name: 'Design Apartmán' },
      'lite-apartman': { propId: '168900', roomId: '357932', name: 'Lite Apartmán' },
      'deluxe-apartman': { propId: '161445', roomId: '357931', name: 'Deluxe Apartmán' }
    };

    const apartmentConfig = apartmentMapping[apartment];
    if (!apartmentConfig) {
      return NextResponse.json({
        success: false,
        error: `Unknown apartment: ${apartment}. Available: ${Object.keys(apartmentMapping).join(', ')}`
      }, { status: 400 });
    }

    console.log(`\n🧪 TESTING OFFERS API FOR ${apartmentConfig.name.toUpperCase()}`);
    console.log('Parameters:', {
      apartment,
      arrival,
      departure,
      numAdults,
      numChildren,
      propId: apartmentConfig.propId,
      roomId: apartmentConfig.roomId
    });

    // Build URL with proper parameters according to Beds24 docs
    const url = new URL('https://api.beds24.com/v2/inventory/rooms/offers');
    
    // Required parameters
    url.searchParams.append('arrival', arrival);
    url.searchParams.append('departure', departure);
    url.searchParams.append('numAdults', numAdults.toString());
    url.searchParams.append('numChildren', numChildren.toString());
    
    // Optional parameters
    url.searchParams.append('propertyId', apartmentConfig.propId);
    url.searchParams.append('roomId', apartmentConfig.roomId);

    console.log('🌐 Request URL:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'token': accessToken
      }
    });

    console.log('📊 Response Status:', response.status, response.statusText);

    const responseText = await response.text();
    console.log('📄 Raw Response:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON response',
        rawResponse: responseText,
        status: response.status
      }, { status: 500 });
    }

    // Analyze response structure
    const analysis = {
      success: response.ok,
      status: response.status,
      hasData: responseData?.data ? true : false,
      dataCount: Array.isArray(responseData?.data) ? responseData.data.length : 0,
      responseType: responseData?.type || 'unknown',
      responseSuccess: responseData?.success || false
    };

    console.log('🔍 Response Analysis:', analysis);

    if (responseData?.data && Array.isArray(responseData.data)) {
      responseData.data.forEach((item: Record<string, unknown>, index: number) => {
        console.log(`📋 Item ${index + 1}:`, {
          roomId: item.roomId,
          propertyId: item.propertyId,
          offersCount: item.offers?.length || 0,
          offers: (item.offers as Record<string, unknown>[])?.map((offer: Record<string, unknown>) => ({
            offerId: offer.offerId,
            offerName: offer.offerName,
            price: offer.price,
            unitsAvailable: offer.unitsAvailable
          })) || []
        });
      });
    }

    return NextResponse.json({
      success: true,
      testInfo: {
        apartment: apartmentConfig.name,
        parameters: {
          arrival,
          departure,
          numAdults,
          numChildren,
          propertyId: apartmentConfig.propId,
          roomId: apartmentConfig.roomId
        },
        url: url.toString()
      },
      analysis,
      response: responseData,
      rawResponse: responseText
    });

  } catch (error) {
    console.error('❌ Offers API Test Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
