import { NextRequest, NextResponse } from 'next/server';
import { getBeds24Service } from '@/services/beds24';

/**
 * Comprehensive Beds24 API Test Endpoint
 * Server-side testing to avoid CORS issues
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const propId = searchParams.get('propId') || '357931';
    const roomId = searchParams.get('roomId') || '357931';
    const startDate = searchParams.get('startDate') || '2024-11-01';
    const endDate = searchParams.get('endDate') || '2024-11-02';
    const adults = parseInt(searchParams.get('adults') || '2');
    const children = parseInt(searchParams.get('children') || '0');

    console.log('🧪 Running comprehensive Beds24 API tests:', {
      propId, roomId, startDate, endDate, adults, children
    });

    const results: Record<string, unknown> = {};

    // Test 1: Properties API
    try {
      console.log('🧪 Testing Properties API...');
      const propertiesResult = await getBeds24Service().getProperties(propId, true);
      results.properties = {
        success: true,
        data: propertiesResult,
        timestamp: new Date().toISOString()
      };
      console.log('✅ Properties API test completed');
    } catch (error) {
      results.properties = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
      console.error('❌ Properties API test failed:', error);
    }

    // Wait for rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 2: Calendar API
    try {
      console.log('🧪 Testing Calendar API...');
      const calendarResult = await getBeds24Service().getInventoryCalendar({
        propId,
        roomId,
        startDate,
        endDate
      });
      results.calendar = {
        success: true,
        data: calendarResult,
        timestamp: new Date().toISOString()
      };
      console.log('✅ Calendar API test completed');
    } catch (error) {
      results.calendar = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
      console.error('❌ Calendar API test failed:', error);
    }

    // Wait for rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 3: Offers API
    try {
      console.log('🧪 Testing Offers API...');
      const offersResult = await getBeds24Service().getInventoryOffers({
        propId,
        roomId,
        startDate,
        endDate,
        adults,
        children
      });
      results.offers = {
        success: true,
        data: offersResult,
        timestamp: new Date().toISOString()
      };
      console.log('✅ Offers API test completed');
    } catch (error) {
      results.offers = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
      console.error('❌ Offers API test failed:', error);
    }

    // Wait for rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 4: Bookings API
    try {
      console.log('🧪 Testing Bookings API...');
      const bookingsResult = await getBeds24Service().getBookings({
        propId,
        roomId,
        startDate,
        endDate
      });
      results.bookings = {
        success: true,
        data: bookingsResult,
        timestamp: new Date().toISOString()
      };
      console.log('✅ Bookings API test completed');
    } catch (error) {
      results.bookings = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
      console.error('❌ Bookings API test failed:', error);
    }

    // Wait for rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 5: Availability (with guests)
    try {
      console.log('🧪 Testing Availability (with guests)...');
      const availabilityResult = await getBeds24Service().getAvailability({
        propId,
        roomId,
        startDate,
        endDate,
        numAdults: adults,
        numChildren: children
      });
      results.availability = {
        success: true,
        data: availabilityResult,
        timestamp: new Date().toISOString()
      };
      console.log('✅ Availability (with guests) test completed');
    } catch (error) {
      results.availability = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
      console.error('❌ Availability (with guests) test failed:', error);
    }

    // Wait for rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 6: Availability (calendar mode)
    try {
      console.log('🧪 Testing Availability (calendar mode)...');
      const availabilityCalendarResult = await getBeds24Service().getAvailability({
        propId,
        roomId,
        startDate,
        endDate
      });
      results.availabilityCalendar = {
        success: true,
        data: availabilityCalendarResult,
        timestamp: new Date().toISOString()
      };
      console.log('✅ Availability (calendar mode) test completed');
    } catch (error) {
      results.availabilityCalendar = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
      console.error('❌ Availability (calendar mode) test failed:', error);
    }

    // Wait for rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 7: Room Prices
    try {
      console.log('🧪 Testing Room Prices...');
      const roomPricesResult = await getBeds24Service().getRoomPricesFromBeds24(roomId, propId);
      results.roomPrices = {
        success: true,
        data: roomPricesResult,
        timestamp: new Date().toISOString()
      };
      console.log('✅ Room Prices test completed');
    } catch (error) {
      results.roomPrices = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
      console.error('❌ Room Prices test failed:', error);
    }

    // Wait for rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 8: Minimum Price
    try {
      console.log('🧪 Testing Minimum Price...');
      const minimumPriceResult = await getBeds24Service().getRoomMinimumPrice(roomId, propId);
      results.minimumPrice = {
        success: true,
        data: minimumPriceResult,
        timestamp: new Date().toISOString()
      };
      console.log('✅ Minimum Price test completed');
    } catch (error) {
      results.minimumPrice = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
      console.error('❌ Minimum Price test failed:', error);
    }

    const totalTime = Date.now() - startTime;
    const successCount = Object.values(results).filter((r: unknown): r is Record<string, unknown> => {
      const record = r as Record<string, unknown>;
      return record.success === true;
    }).length;
    const totalTests = Object.keys(results).length;

    console.log(`🎯 Comprehensive test completed in ${totalTime}ms: ${successCount}/${totalTests} tests passed`);

    return NextResponse.json({
      success: true,
      message: `Comprehensive Beds24 API tests completed: ${successCount}/${totalTests} passed`,
      results,
      summary: {
        totalTests,
        passedTests: successCount,
        failedTests: totalTests - successCount,
        totalTime,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Comprehensive test error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Comprehensive Beds24 API test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}