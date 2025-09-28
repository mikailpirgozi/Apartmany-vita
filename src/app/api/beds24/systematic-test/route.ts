import { NextRequest, NextResponse } from 'next/server';

/**
 * Systematické testovanie Beds24 API V2 endpoints
 * Testuje rôzne možnosti a formáty pre získanie inventory dát
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const apartment = searchParams.get('apartment') || 'deluxe-apartman';
  const testType = searchParams.get('test') || 'all';
  
  // Mapovanie apartmánov
  const apartmentMapping: Record<string, { propId: string; roomId: string; name: string }> = {
    'design-apartman': { propId: '227484', roomId: '483027', name: 'Apartmán Vita Design' },
    'lite-apartman': { propId: '168900', roomId: '168900', name: 'Apartman Vita Lite' },
    'deluxe-apartman': { propId: '161445', roomId: '161445', name: 'Apartman Vita Deluxe' }
  };

  const apartmentConfig = apartmentMapping[apartment];
  if (!apartmentConfig) {
    return NextResponse.json({ error: `Unknown apartment: ${apartment}` }, { status: 400 });
  }

  const accessToken = process.env.BEDS24_ACCESS_TOKEN || '';
  const baseUrl = 'https://api.beds24.com/v2';
  
  const testResults: Record<string, any> = {};

  console.log(`\n🧪 SYSTEMATIC BEDS24 API TESTING - ${apartmentConfig.name}`);
  console.log(`📅 Date range: 2025-10-01 to 2025-10-03`);
  console.log(`🏠 PropId: ${apartmentConfig.propId}, RoomId: ${apartmentConfig.roomId}\n`);

  // Test 1: JSON API (starší formát)
  if (testType === 'all' || testType === 'json') {
    console.log('🔍 TEST 1: JSON API (legacy format)');
    try {
      const jsonUrl = `https://api.beds24.com/json/getAvailabilities`;
      const jsonResponse = await fetch(jsonUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          authentication: {
            apiKey: accessToken,
            propKey: apartmentConfig.propId
          },
          hotelId: apartmentConfig.propId,
          roomId: apartmentConfig.roomId,
          checkIn: '2025-10-01',
          checkOut: '2025-10-03'
        })
      });

      const jsonData = jsonResponse.ok ? await jsonResponse.json() : await jsonResponse.text();
      testResults.jsonApi = {
        status: jsonResponse.status,
        success: jsonResponse.ok,
        data: jsonData
      };
      console.log(`   Status: ${jsonResponse.status}, Success: ${jsonResponse.ok}`);
    } catch (error) {
      testResults.jsonApi = { error: error instanceof Error ? error.message : 'Unknown error' };
      console.log(`   Error: ${error}`);
    }
  }

  // Test 2: Rôzne inventory endpoint variácie
  if (testType === 'all' || testType === 'inventory') {
    console.log('\n🔍 TEST 2: Inventory endpoint variations');
    
    const inventoryTests = [
      {
        name: 'availability_basic',
        url: `${baseUrl}/inventory/availability?propId=${apartmentConfig.propId}&roomId=${apartmentConfig.roomId}&startDate=2025-10-01&endDate=2025-10-03`
      },
      {
        name: 'availability_without_roomId',
        url: `${baseUrl}/inventory/availability?propId=${apartmentConfig.propId}&startDate=2025-10-01&endDate=2025-10-03`
      },
      {
        name: 'calendar_basic',
        url: `${baseUrl}/inventory/calendar?propId=${apartmentConfig.propId}&roomId=${apartmentConfig.roomId}&startDate=2025-10-01&endDate=2025-10-03`
      },
      {
        name: 'calendar_without_roomId',
        url: `${baseUrl}/inventory/calendar?propId=${apartmentConfig.propId}&startDate=2025-10-01&endDate=2025-10-03`
      }
    ];

    for (const test of inventoryTests) {
      try {
        const response = await fetch(test.url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'token': accessToken
          }
        });

        const data = response.ok ? await response.json() : await response.text();
        testResults[test.name] = {
          status: response.status,
          success: response.ok,
          data: data
        };
        console.log(`   ${test.name}: Status ${response.status}, Success: ${response.ok}`);
        if (response.ok && typeof data === 'object' && 'count' in data) {
          console.log(`     Data count: ${data.count}`);
        }
      } catch (error) {
        testResults[test.name] = { error: error instanceof Error ? error.message : 'Unknown error' };
        console.log(`   ${test.name}: Error - ${error}`);
      }
    }
  }

  // Test 3: POST requesty s rôznymi formátmi
  if (testType === 'all' || testType === 'post') {
    console.log('\n🔍 TEST 3: POST requests with different formats');
    
    const postTests = [
      {
        name: 'inventory_post_v1',
        url: `${baseUrl}/inventory`,
        body: {
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
        }
      },
      {
        name: 'inventory_post_v2',
        url: `${baseUrl}/inventory`,
        body: {
          propId: apartmentConfig.propId,
          roomId: apartmentConfig.roomId,
          startDate: '2025-10-01',
          endDate: '2025-10-03',
          includeRates: true,
          includeAvailability: true
        }
      }
    ];

    for (const test of postTests) {
      try {
        const response = await fetch(test.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'token': accessToken
          },
          body: JSON.stringify(test.body)
        });

        const data = response.ok ? await response.json() : await response.text();
        testResults[test.name] = {
          status: response.status,
          success: response.ok,
          data: data
        };
        console.log(`   ${test.name}: Status ${response.status}, Success: ${response.ok}`);
      } catch (error) {
        testResults[test.name] = { error: error instanceof Error ? error.message : 'Unknown error' };
        console.log(`   ${test.name}: Error - ${error}`);
      }
    }
  }

  // Test 4: Offers endpoint s rôznymi occupancy formátmi
  if (testType === 'all' || testType === 'offers') {
    console.log('\n🔍 TEST 4: Offers endpoint with different occupancy formats');
    
    const offersTests = [
      {
        name: 'offers_get_occupancy_number',
        method: 'GET' as const,
        url: `${baseUrl}/inventory/offers?propId=${apartmentConfig.propId}&roomId=${apartmentConfig.roomId}&arrival=2025-10-01&departure=2025-10-03&occupancy=2`
      },
      {
        name: 'offers_get_adults_children',
        method: 'GET' as const,
        url: `${baseUrl}/inventory/offers?propId=${apartmentConfig.propId}&roomId=${apartmentConfig.roomId}&arrival=2025-10-01&departure=2025-10-03&adults=2&children=0`
      },
      {
        name: 'offers_get_guests',
        method: 'GET' as const,
        url: `${baseUrl}/inventory/offers?propId=${apartmentConfig.propId}&roomId=${apartmentConfig.roomId}&arrival=2025-10-01&departure=2025-10-03&guests=2`
      },
      {
        name: 'offers_post_occupancy_object',
        method: 'POST' as const,
        url: `${baseUrl}/inventory/offers`,
        body: {
          propId: apartmentConfig.propId,
          roomId: apartmentConfig.roomId,
          arrival: '2025-10-01',
          departure: '2025-10-03',
          occupancy: { adults: 2, children: 0 }
        }
      },
      {
        name: 'offers_post_occupancy_array',
        method: 'POST' as const,
        url: `${baseUrl}/inventory/offers`,
        body: {
          propId: apartmentConfig.propId,
          roomId: apartmentConfig.roomId,
          arrival: '2025-10-01',
          departure: '2025-10-03',
          occupancy: [{ adults: 2, children: 0 }]
        }
      }
    ];

    for (const test of offersTests) {
      try {
        const fetchOptions: RequestInit = {
          method: test.method,
          headers: {
            'Content-Type': 'application/json',
            'token': accessToken
          }
        };

        if (test.method === 'POST' && test.body) {
          fetchOptions.body = JSON.stringify(test.body);
        }

        const response = await fetch(test.url, fetchOptions);
        const data = response.ok ? await response.json() : await response.text();
        
        testResults[test.name] = {
          status: response.status,
          success: response.ok,
          data: data
        };
        console.log(`   ${test.name}: Status ${response.status}, Success: ${response.ok}`);
        if (!response.ok && typeof data === 'string') {
          console.log(`     Error: ${data.substring(0, 100)}...`);
        }
      } catch (error) {
        testResults[test.name] = { error: error instanceof Error ? error.message : 'Unknown error' };
        console.log(`   ${test.name}: Error - ${error}`);
      }
    }
  }

  // Test 5: Alternatívne endpoints
  if (testType === 'all' || testType === 'alternative') {
    console.log('\n🔍 TEST 5: Alternative endpoints');
    
    const alternativeTests = [
      `${baseUrl}/inventory`,
      `${baseUrl}/availability`,
      `${baseUrl}/calendar`,
      `${baseUrl}/rates`,
      `${baseUrl}/pricing`,
      `${baseUrl}/rooms`,
      `${baseUrl}/room-types`
    ];

    for (const url of alternativeTests) {
      try {
        const testUrl = `${url}?propId=${apartmentConfig.propId}`;
        const response = await fetch(testUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'token': accessToken
          }
        });

        const data = response.ok ? await response.json() : await response.text();
        const endpointName = url.split('/').pop() || 'unknown';
        
        testResults[`alt_${endpointName}`] = {
          status: response.status,
          success: response.ok,
          data: response.ok ? data : data.substring(0, 200)
        };
        console.log(`   ${endpointName}: Status ${response.status}, Success: ${response.ok}`);
      } catch (error) {
        const endpointName = url.split('/').pop() || 'unknown';
        testResults[`alt_${endpointName}`] = { error: error instanceof Error ? error.message : 'Unknown error' };
        console.log(`   ${endpointName}: Error - ${error}`);
      }
    }
  }

  console.log('\n✅ Testing completed!\n');

  return NextResponse.json({
    success: true,
    apartment: apartmentConfig.name,
    propId: apartmentConfig.propId,
    roomId: apartmentConfig.roomId,
    testType,
    timestamp: new Date().toISOString(),
    results: testResults
  });
}
