import { NextRequest, NextResponse } from 'next/server';

const BEDS24_API_BASE = 'https://api.beds24.com/v2';
const API_TOKEN = process.env.BEDS24_ACCESS_TOKEN || 'XwJnUUA7YS9aHRIBFPhVWiIEBlb/+whEpT0SRe7m5IWp30A9+uJlz54IN+KTAYSFNkftzJQ9ODvTYrafP6c2o3sUExKkk288hi7lKcuJZ8zxfh3CxnUZckm/W3dGGs1ibWb1BIr/ch69m5RKYemFu/Rn6KfTjwgMUi+zyCgifcg=';

interface TestResult {
  endpoint: string;
  success: boolean;
  data?: any;
  error?: string;
  count?: number;
}

export async function GET(request: NextRequest) {
  if (!API_TOKEN) {
    return NextResponse.json({ error: 'BEDS24_ACCESS_TOKEN not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const testType = searchParams.get('test') || 'all';

  const results: TestResult[] = [];

  try {
    // Test 1: Properties endpoint s include parametrami
    if (testType === 'all' || testType === 'properties') {
      console.log('🧪 Testing Properties API with include parameters...');
      
      const propertiesUrl = new URL(`${BEDS24_API_BASE}/properties`);
      propertiesUrl.searchParams.set('id', '161445');
      propertiesUrl.searchParams.set('includeAllRooms', 'true');
      propertiesUrl.searchParams.set('includeTexts', 'true');
      propertiesUrl.searchParams.set('includePriceRules', 'true');
      propertiesUrl.searchParams.set('includeOffers', 'true');
      propertiesUrl.searchParams.set('includeUpsellItems', 'true');
      
      const propertiesResponse = await fetch(propertiesUrl.toString(), {
        method: 'GET',
        headers: {
          'token': API_TOKEN,
          'Content-Type': 'application/json',
        },
      });

      const propertiesData = await propertiesResponse.json();
      results.push({
        endpoint: 'Properties (with includes)',
        success: propertiesData.success || false,
        data: propertiesData,
        count: propertiesData.count || 0
      });
    }

    // Test 2: Calendar endpoint s include parametrami
    if (testType === 'all' || testType === 'calendar') {
      console.log('🧪 Testing Calendar API with include parameters...');
      
      const calendarUrl = new URL(`${BEDS24_API_BASE}/inventory/rooms/calendar`);
      calendarUrl.searchParams.set('startDate', '2025-10-01');
      calendarUrl.searchParams.set('endDate', '2025-10-03');
      calendarUrl.searchParams.set('roomId', '357931');
      calendarUrl.searchParams.set('propertyId', '161445');
      calendarUrl.searchParams.set('includePrices', 'true');
      calendarUrl.searchParams.set('includeNumAvail', 'true');
      calendarUrl.searchParams.set('includeMinStay', 'true');
      calendarUrl.searchParams.set('includeMaxStay', 'true');
      calendarUrl.searchParams.set('includeMultiplier', 'true');
      calendarUrl.searchParams.set('includeOverride', 'true');
      calendarUrl.searchParams.set('includeChannels', 'true');
      
      const calendarResponse = await fetch(calendarUrl.toString(), {
        method: 'GET',
        headers: {
          'token': API_TOKEN,
          'Content-Type': 'application/json',
        },
      });

      const calendarData = await calendarResponse.json();
      results.push({
        endpoint: 'Calendar (with includes)',
        success: calendarData.success || false,
        data: calendarData,
        count: calendarData.count || 0
      });
    }

    // Test 3: Offers endpoint s všetkými parametrami
    if (testType === 'all' || testType === 'offers') {
      console.log('🧪 Testing Offers API with all parameters...');
      
      const offersUrl = new URL(`${BEDS24_API_BASE}/inventory/rooms/offers`);
      offersUrl.searchParams.set('arrival', '2025-10-01');
      offersUrl.searchParams.set('departure', '2025-10-03');
      offersUrl.searchParams.set('numAdults', '2');
      offersUrl.searchParams.set('numChildren', '0');
      offersUrl.searchParams.set('propertyId', '161445');
      offersUrl.searchParams.set('roomId', '357931');
      offersUrl.searchParams.set('includeTexts', 'en');
      
      const offersResponse = await fetch(offersUrl.toString(), {
        method: 'GET',
        headers: {
          'token': API_TOKEN,
          'Content-Type': 'application/json',
        },
      });

      const offersData = await offersResponse.json();
      results.push({
        endpoint: 'Offers (with all params)',
        success: offersData.success || false,
        data: offersData,
        count: offersData.count || 0
      });
    }

    // Test 4: Availability endpoint (legacy)
    if (testType === 'all' || testType === 'availability') {
      console.log('🧪 Testing Availability API...');
      
      const availabilityUrl = new URL(`${BEDS24_API_BASE}/inventory/availability`);
      availabilityUrl.searchParams.set('propId', '161445');
      availabilityUrl.searchParams.set('startDate', '2025-10-01');
      availabilityUrl.searchParams.set('endDate', '2025-10-03');
      
      const availabilityResponse = await fetch(availabilityUrl.toString(), {
        method: 'GET',
        headers: {
          'token': API_TOKEN,
          'Content-Type': 'application/json',
        },
      });

      const availabilityData = await availabilityResponse.json();
      results.push({
        endpoint: 'Availability (legacy)',
        success: availabilityData.success || false,
        data: availabilityData,
        count: availabilityData.count || 0
      });
    }

    // Súhrn výsledkov
    const summary = {
      totalTests: results.length,
      successfulTests: results.filter(r => r.success).length,
      testsWithData: results.filter(r => r.count && r.count > 0).length,
      timestamp: new Date().toISOString(),
      results: results
    };

    console.log('🎯 Schema Test Summary:', {
      total: summary.totalTests,
      successful: summary.successfulTests,
      withData: summary.testsWithData
    });

    return NextResponse.json(summary);

  } catch (error) {
    console.error('❌ Schema test error:', error);
    return NextResponse.json({
      error: 'Schema test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      results: results
    }, { status: 500 });
  }
}
