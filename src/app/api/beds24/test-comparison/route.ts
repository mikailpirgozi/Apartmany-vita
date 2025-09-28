import { NextRequest, NextResponse } from 'next/server';
import { getBeds24Service } from '@/services/beds24';

/**
 * Test Comparison API endpoint - shows both raw and processed data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propId = searchParams.get('propId') || '357931';
    const roomId = searchParams.get('roomId') || '357931';
    const startDate = searchParams.get('startDate') || '2024-11-01';
    const endDate = searchParams.get('endDate') || '2024-11-02';
    const adults = searchParams.get('adults');
    const children = searchParams.get('children');

    console.log('🧪 Testing Comparison API:', { 
      propId, roomId, startDate, endDate, adults, children 
    });

    const results: any = {
      timestamp: new Date().toISOString(),
      parameters: { propId, roomId, startDate, endDate, adults, children }
    };

    // Test 1: Raw Calendar API
    try {
      console.log('📅 Testing Raw Calendar API...');
      const accessToken = await getBeds24Service().ensureValidToken();
      
      const calendarUrl = new URL(`${process.env.BEDS24_BASE_URL || 'https://api.beds24.com/v2'}/inventory/rooms/calendar`);
      calendarUrl.searchParams.set('startDate', startDate);
      calendarUrl.searchParams.set('endDate', endDate);
      calendarUrl.searchParams.set('propertyId', propId);
      calendarUrl.searchParams.set('roomId', roomId);
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
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'token': accessToken,
          'User-Agent': 'ApartmanyVita/1.0'
        }
      });

      if (calendarResponse.ok) {
        const rawCalendarData = await calendarResponse.json();
        results.rawCalendar = {
          success: true,
          status: calendarResponse.status,
          data: rawCalendarData
        };
      } else {
        const errorText = await calendarResponse.text();
        results.rawCalendar = {
          success: false,
          status: calendarResponse.status,
          error: errorText
        };
      }
    } catch (error) {
      results.rawCalendar = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }

    // Test 2: Processed Calendar API (our service)
    try {
      console.log('📅 Testing Processed Calendar API...');
      const processedCalendar = await getBeds24Service().getInventoryCalendar({
        propId,
        roomId,
        startDate,
        endDate
      });
      
      results.processedCalendar = {
        success: true,
        data: processedCalendar
      };
    } catch (error) {
      results.processedCalendar = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }

    // Test 3: Raw Bookings API
    try {
      console.log('📋 Testing Raw Bookings API...');
      const accessToken = await getBeds24Service().ensureValidToken();
      
      const bookingsUrl = new URL(`${process.env.BEDS24_BASE_URL || 'https://api.beds24.com/v2'}/bookings`);
      bookingsUrl.searchParams.set('propId', propId);
      bookingsUrl.searchParams.set('roomId', roomId);
      bookingsUrl.searchParams.set('checkIn', startDate);
      bookingsUrl.searchParams.set('checkOut', endDate);

      const bookingsResponse = await fetch(bookingsUrl.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'token': accessToken,
          'User-Agent': 'ApartmanyVita/1.0'
        }
      });

      if (bookingsResponse.ok) {
        const rawBookingsData = await bookingsResponse.json();
        results.rawBookings = {
          success: true,
          status: bookingsResponse.status,
          data: rawBookingsData
        };
      } else {
        const errorText = await bookingsResponse.text();
        results.rawBookings = {
          success: false,
          status: bookingsResponse.status,
          error: errorText
        };
      }
    } catch (error) {
      results.rawBookings = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }

    // Test 4: Processed Bookings API (our service)
    try {
      console.log('📋 Testing Processed Bookings API...');
      const processedBookings = await getBeds24Service().getBookings({
        propId,
        roomId,
        startDate,
        endDate
      });
      
      results.processedBookings = {
        success: true,
        data: processedBookings
      };
    } catch (error) {
      results.processedBookings = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }

    // Test 5: Raw Offers API (if guests specified)
    if (adults) {
      try {
        console.log('💰 Testing Raw Offers API...');
        const accessToken = await getBeds24Service().ensureValidToken();
        
        const offersUrl = new URL(`${process.env.BEDS24_BASE_URL || 'https://api.beds24.com/v2'}/inventory/rooms/offers`);
        offersUrl.searchParams.set('startDate', startDate);
        offersUrl.searchParams.set('endDate', endDate);
        offersUrl.searchParams.set('propertyId', propId);
        offersUrl.searchParams.set('roomId', roomId);
        offersUrl.searchParams.set('numAdults', adults);
        if (children) {
          offersUrl.searchParams.set('numChildren', children);
        }

        const offersResponse = await fetch(offersUrl.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'token': accessToken,
            'User-Agent': 'ApartmanyVita/1.0'
          }
        });

        if (offersResponse.ok) {
          const rawOffersData = await offersResponse.json();
          results.rawOffers = {
            success: true,
            status: offersResponse.status,
            data: rawOffersData
          };
        } else {
          const errorText = await offersResponse.text();
          results.rawOffers = {
            success: false,
            status: offersResponse.status,
            error: errorText
          };
        }
      } catch (error) {
        results.rawOffers = {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }

      // Test 6: Processed Offers API (our service)
      try {
        console.log('💰 Testing Processed Offers API...');
        const processedOffers = await getBeds24Service().getInventoryOffers({
          propId,
          roomId,
          startDate,
          endDate,
          adults: parseInt(adults),
          children: children ? parseInt(children) : 0
        });
        
        results.processedOffers = {
          success: true,
          data: processedOffers
        };
      } catch (error) {
        results.processedOffers = {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Comparison API test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
