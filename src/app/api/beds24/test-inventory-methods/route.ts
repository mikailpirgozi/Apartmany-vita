import { NextRequest, NextResponse } from 'next/server';

/**
 * Test different Beds24 API V2 inventory methods to find blocked dates
 * Based on official API documentation: https://beds24.com/api/v2/apiV2.yaml
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propId = searchParams.get('propId') || '161445'; // Deluxe property
    const roomId = searchParams.get('roomId') || '357931'; // Deluxe room
    const startDate = searchParams.get('startDate') || '2025-01-01';
    const endDate = searchParams.get('endDate') || '2025-01-31';

    console.log('🧪 Testing different Beds24 API V2 inventory methods:', { 
      propId, roomId, startDate, endDate 
    });

    const accessToken = process.env.BEDS24_ACCESS_TOKEN;
    const baseUrl = process.env.BEDS24_BASE_URL || 'https://api.beds24.com/v2';

    if (!accessToken) {
      throw new Error('BEDS24_ACCESS_TOKEN not configured');
    }

    const results: {
      timestamp: string;
      parameters: { propId: string; roomId: string; startDate: string; endDate: string };
      methods: Record<string, {
        success: boolean;
        status?: number;
        data?: unknown;
        analysis?: {
          hasData?: boolean;
          dataCount?: number;
          blockedDates?: number;
          occupiedDates?: string[];
          unavailableDates?: number;
        };
        error?: string;
      }>;
      summary?: unknown;
    } = {
      timestamp: new Date().toISOString(),
      parameters: { propId, roomId, startDate, endDate },
      methods: {}
    };

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'token': accessToken,
      'User-Agent': 'ApartmanyVita/1.0'
    };

    // Method 1: /inventory endpoint (general inventory)
    try {
      console.log('📦 Testing /inventory endpoint...');
      const inventoryUrl = new URL(`${baseUrl}/inventory`);
      inventoryUrl.searchParams.set('startDate', startDate);
      inventoryUrl.searchParams.set('endDate', endDate);
      inventoryUrl.searchParams.set('propertyId', propId);
      inventoryUrl.searchParams.set('roomId', roomId);

      const inventoryResponse = await fetch(inventoryUrl.toString(), {
        method: 'GET',
        headers
      });

      if (inventoryResponse.ok) {
        const inventoryData = await inventoryResponse.json();
        results.methods.inventory = {
          success: true,
          status: inventoryResponse.status,
          data: inventoryData,
          analysis: analyzeInventoryData(inventoryData, startDate, endDate)
        };
      } else {
        const errorText = await inventoryResponse.text();
        results.methods.inventory = {
          success: false,
          status: inventoryResponse.status,
          error: errorText
        };
      }
    } catch (error) {
      results.methods.inventory = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }

    // Method 2: /inventory/rooms endpoint (room-specific inventory)
    try {
      console.log('🏠 Testing /inventory/rooms endpoint...');
      const roomsUrl = new URL(`${baseUrl}/inventory/rooms`);
      roomsUrl.searchParams.set('startDate', startDate);
      roomsUrl.searchParams.set('endDate', endDate);
      roomsUrl.searchParams.set('propertyId', propId);
      roomsUrl.searchParams.set('roomId', roomId);

      const roomsResponse = await fetch(roomsUrl.toString(), {
        method: 'GET',
        headers
      });

      if (roomsResponse.ok) {
        const roomsData = await roomsResponse.json();
        results.methods.rooms = {
          success: true,
          status: roomsResponse.status,
          data: roomsData,
          analysis: analyzeInventoryData(roomsData, startDate, endDate)
        };
      } else {
        const errorText = await roomsResponse.text();
        results.methods.rooms = {
          success: false,
          status: roomsResponse.status,
          error: errorText
        };
      }
    } catch (error) {
      results.methods.rooms = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }

    // Method 3: /inventory/rooms/calendar endpoint (calendar-specific)
    try {
      console.log('📅 Testing /inventory/rooms/calendar endpoint...');
      const calendarUrl = new URL(`${baseUrl}/inventory/rooms/calendar`);
      calendarUrl.searchParams.set('startDate', startDate);
      calendarUrl.searchParams.set('endDate', endDate);
      calendarUrl.searchParams.set('propertyId', propId);
      calendarUrl.searchParams.set('roomId', roomId);
      
      // Add all possible include parameters from API docs
      calendarUrl.searchParams.set('includePrices', 'true');
      calendarUrl.searchParams.set('includeNumAvail', 'true');
      calendarUrl.searchParams.set('includeMinStay', 'true');
      calendarUrl.searchParams.set('includeMaxStay', 'true');
      calendarUrl.searchParams.set('includeMultiplier', 'true');
      calendarUrl.searchParams.set('includeOverride', 'true');
      calendarUrl.searchParams.set('includeChannels', 'true');

      const calendarResponse = await fetch(calendarUrl.toString(), {
        method: 'GET',
        headers
      });

      if (calendarResponse.ok) {
        const calendarData = await calendarResponse.json();
        results.methods.calendar = {
          success: true,
          status: calendarResponse.status,
          data: calendarData,
          analysis: analyzeInventoryData(calendarData, startDate, endDate)
        };
      } else {
        const errorText = await calendarResponse.text();
        results.methods.calendar = {
          success: false,
          status: calendarResponse.status,
          error: errorText
        };
      }
    } catch (error) {
      results.methods.calendar = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }

    // Method 4: /inventory/offers endpoint (offers with availability) - OPTIONAL
    try {
      console.log('💰 Testing /inventory/offers endpoint (OPTIONAL - for dynamic pricing)...');
      const offersUrl = new URL(`${baseUrl}/inventory/offers`);
      offersUrl.searchParams.set('arrival', startDate);
      offersUrl.searchParams.set('departure', endDate);
      offersUrl.searchParams.set('propertyId', propId);
      offersUrl.searchParams.set('roomId', roomId);
      offersUrl.searchParams.set('occupancy', '2');
      offersUrl.searchParams.set('adults', '2');
      offersUrl.searchParams.set('children', '0');

      const offersResponse = await fetch(offersUrl.toString(), {
        method: 'GET',
        headers
      });

      if (offersResponse.ok) {
        const offersData = await offersResponse.json();
        results.methods.offers = {
          success: true,
          status: offersResponse.status,
          data: offersData,
          analysis: analyzeOffersData(offersData)
        };
      } else {
        const errorText = await offersResponse.text();
        results.methods.offers = {
          success: false,
          status: offersResponse.status,
          error: errorText
        };
      }
    } catch (error) {
      results.methods.offers = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }

    // Method 5: /bookings endpoint (existing bookings)
    try {
      console.log('📋 Testing /bookings endpoint...');
      const bookingsUrl = new URL(`${baseUrl}/bookings`);
      bookingsUrl.searchParams.set('arrivalFrom', startDate);
      bookingsUrl.searchParams.set('arrivalTo', endDate);
      bookingsUrl.searchParams.set('propertyId', propId);
      bookingsUrl.searchParams.set('roomId', roomId);

      const bookingsResponse = await fetch(bookingsUrl.toString(), {
        method: 'GET',
        headers
      });

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        results.methods.bookings = {
          success: true,
          status: bookingsResponse.status,
          data: bookingsData,
          analysis: analyzeBookingsData(bookingsData)
        };
      } else {
        const errorText = await bookingsResponse.text();
        results.methods.bookings = {
          success: false,
          status: bookingsResponse.status,
          error: errorText
        };
      }
    } catch (error) {
      results.methods.bookings = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }

    // Generate summary
    results.summary = generateSummary(results.methods);

    return NextResponse.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Inventory methods test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Analyze inventory data for blocked dates
 */
function analyzeInventoryData(data: Record<string, unknown>, startDate: string, endDate: string) {
  const analysis = {
    hasData: false,
    dataCount: 0,
    availableDates: 0,
    blockedDates: 0,
    datesWithData: [] as string[],
    blockedDatesList: [] as string[],
    dataStructure: {},
    sampleData: null as Record<string, unknown> | null
  };

  if (!data) return analysis;

  analysis.hasData = true;
  analysis.dataStructure = {
    type: Array.isArray(data) ? 'array' : typeof data,
    keys: typeof data === 'object' ? Object.keys(data) : []
  };

  // Extract data array
  let dataArray: Record<string, unknown>[] = [];
  if (Array.isArray(data)) {
    dataArray = data;
  } else if (data.data && Array.isArray(data.data)) {
    dataArray = data.data;
  }

  analysis.dataCount = dataArray.length;
  if (dataArray.length > 0) {
    analysis.sampleData = dataArray[0];
  }

  // Generate date range
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    
    // Find data for this date
    const dateData = dataArray.find((item: Record<string, unknown>) => 
      item.date === dateStr || item.day === dateStr
    );
    
    if (dateData) {
      analysis.datesWithData.push(dateStr);
      
      // Check if blocked
      const isBlocked = 
        dateData.available === 0 ||
        dateData.available === false ||
        dateData.status === 'blocked' ||
        dateData.status === 'unavailable' ||
        (dateData.numAvail !== undefined && dateData.numAvail === 0);
      
      if (isBlocked) {
        analysis.blockedDates++;
        analysis.blockedDatesList.push(dateStr);
      } else {
        analysis.availableDates++;
      }
    } else {
      // No data = assume available
      analysis.availableDates++;
    }
  }

  return analysis;
}

/**
 * Analyze offers data for availability
 */
function analyzeOffersData(data: Record<string, unknown>) {
  const analysis = {
    hasData: false,
    offersCount: 0,
    availableDates: 0,
    unavailableDates: 0,
    offersWithPrices: 0,
    dataStructure: {},
    sampleOffer: null as Record<string, unknown> | null
  };

  if (!data) return analysis;

  analysis.hasData = true;
  analysis.dataStructure = {
    type: Array.isArray(data) ? 'array' : typeof data,
    keys: typeof data === 'object' ? Object.keys(data) : []
  };

  // Extract offers array
  let offersArray: Record<string, unknown>[] = [];
  if (Array.isArray(data)) {
    offersArray = data;
  } else if (data.data && Array.isArray(data.data)) {
    offersArray = data.data;
  }

  analysis.offersCount = offersArray.length;
  if (offersArray.length > 0) {
    analysis.sampleOffer = offersArray[0];
  }

  // Count offers with prices (available) vs without (unavailable)
  offersArray.forEach((offer: Record<string, unknown>) => {
    const price = offer.price;
    if (price !== undefined && price !== null && typeof price === 'number' && price > 0) {
      analysis.availableDates++;
      analysis.offersWithPrices++;
    } else {
      analysis.unavailableDates++;
    }
  });

  return analysis;
}

/**
 * Analyze bookings data for occupied dates
 */
function analyzeBookingsData(data: Record<string, unknown>) {
  const analysis = {
    hasData: false,
    bookingsCount: 0,
    occupiedDates: [] as string[],
    bookingDateRanges: [] as Record<string, unknown>[],
    dataStructure: {},
    sampleBooking: null as Record<string, unknown> | null
  };

  if (!data) return analysis;

  analysis.hasData = true;
  analysis.dataStructure = {
    type: Array.isArray(data) ? 'array' : typeof data,
    keys: typeof data === 'object' ? Object.keys(data) : []
  };

  // Extract bookings array
  let bookingsArray: Record<string, unknown>[] = [];
  if (Array.isArray(data)) {
    bookingsArray = data;
  } else if (data.data && Array.isArray(data.data)) {
    bookingsArray = data.data;
  }

  analysis.bookingsCount = bookingsArray.length;
  if (bookingsArray.length > 0) {
    analysis.sampleBooking = bookingsArray[0];
  }

  // Extract occupied dates from bookings
  bookingsArray.forEach((booking: Record<string, unknown>) => {
    const arrival = booking.arrival;
    const departure = booking.departure;
    if (arrival && departure && typeof arrival === 'string' && typeof departure === 'string') {
      const checkIn = new Date(arrival as string);
      const checkOut = new Date(departure as string);
      
      analysis.bookingDateRanges.push({
        checkIn: arrival,
        checkOut: departure,
        status: booking.status
      });
      
      // Add all dates in booking range to occupied dates
      for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (!analysis.occupiedDates.includes(dateStr)) {
          analysis.occupiedDates.push(dateStr);
        }
      }
    }
  });

  return analysis;
}

/**
 * Generate summary of all methods
 */
function generateSummary(methods: Record<string, {
  success: boolean;
  status?: number;
  data?: unknown;
  analysis?: {
    hasData?: boolean;
    dataCount?: number;
    blockedDates?: number;
    occupiedDates?: string[];
    unavailableDates?: number;
  };
  error?: string;
}>) {
  const summary = {
    workingMethods: [] as string[],
    failedMethods: [] as string[],
    methodsWithData: [] as string[],
    methodsWithBlockedDates: [] as string[],
    recommendations: [] as string[]
  };

  Object.entries(methods).forEach(([method, result]: [string, {
    success: boolean;
    status?: number;
    data?: unknown;
    analysis?: {
      hasData?: boolean;
      dataCount?: number;
      blockedDates?: number;
      occupiedDates?: string[];
      unavailableDates?: number;
    };
    error?: string;
  }]) => {
    if (result.success) {
      summary.workingMethods.push(method);
      
      if (result.analysis && (result.analysis.hasData || (result.analysis.dataCount && result.analysis.dataCount > 0))) {
        summary.methodsWithData.push(method);
      }
      
      if (result.analysis && (
        (result.analysis.blockedDates && result.analysis.blockedDates > 0) || 
        (result.analysis.occupiedDates && result.analysis.occupiedDates.length > 0) ||
        (result.analysis.unavailableDates && result.analysis.unavailableDates > 0)
      )) {
        summary.methodsWithBlockedDates.push(method);
      }
    } else {
      summary.failedMethods.push(method);
    }
  });

  // Generate recommendations
  if (summary.methodsWithBlockedDates.length > 0) {
    summary.recommendations.push(`Use ${summary.methodsWithBlockedDates.join(' or ')} for getting blocked dates`);
  } else if (summary.methodsWithData.length > 0) {
    summary.recommendations.push(`${summary.methodsWithData.join(' and ')} return data but no blocked dates found`);
  } else {
    summary.recommendations.push('No blocked dates found in any method - check Beds24 admin panel for manual blocks');
  }

  if (summary.failedMethods.length > 0) {
    summary.recommendations.push(`Fix API access for: ${summary.failedMethods.join(', ')}`);
  }

  return summary;
}
