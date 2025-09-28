import { NextRequest, NextResponse } from 'next/server';
import { beds24Service } from '@/services/beds24';

/**
 * Enhanced test endpoint for new Beds24 API endpoints per documentation
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get('test') || 'all';
    const propId = searchParams.get('propId') || '161445';
    const roomId = searchParams.get('roomId') || '357931';
    const startDate = searchParams.get('startDate') || '2025-10-01';
    const endDate = searchParams.get('endDate') || '2025-10-03';
    const adults = parseInt(searchParams.get('adults') || '2');
    const children = parseInt(searchParams.get('children') || '0');

    console.log('Enhanced Beds24 API Test:', {
      testType,
      propId,
      roomId,
      startDate,
      endDate,
      adults,
      children
    });

    const results: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      testParams: { testType, propId, roomId, startDate, endDate, adults, children }
    };

    // Test 1: Properties with includeAllRooms
    if (testType === 'all' || testType === 'properties') {
      try {
        console.log('Testing properties with includeAllRooms...');
        const properties = await beds24Service.getProperties(true);
        results.properties = {
          success: true,
          data: properties,
          note: 'Properties API with includeAllRooms=true per Beds24 docs'
        };
      } catch (error) {
        results.properties = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          note: 'Properties API failed'
        };
      }
    }

    // Test 2: Inventory Offers (dynamic pricing)
    if (testType === 'all' || testType === 'offers') {
      try {
        console.log('Testing inventory offers...');
        const offers = await beds24Service.getInventoryOffers({
          propId,
          roomId,
          startDate,
          endDate,
          adults,
          children
        });
        results.offers = {
          success: true,
          data: offers,
          note: 'Inventory offers API with guest count per Beds24 docs'
        };
      } catch (error) {
        results.offers = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          note: 'Inventory offers API failed'
        };
      }
    }

    // Test 3: Inventory Calendar
    if (testType === 'all' || testType === 'calendar') {
      try {
        console.log('Testing inventory calendar...');
        const calendar = await beds24Service.getInventoryCalendar({
          propId,
          roomId,
          startDate,
          endDate
        });
        results.calendar = {
          success: true,
          data: calendar,
          note: 'Inventory calendar API with corrected endpoint per Beds24 docs'
        };
      } catch (error) {
        results.calendar = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          note: 'Inventory calendar API failed'
        };
      }
    }

    // Test 4: Enhanced Inventory (cascade)
    if (testType === 'all' || testType === 'inventory') {
      try {
        console.log('Testing enhanced inventory cascade...');
        const inventory = await beds24Service.getInventory({
          propId,
          roomId,
          startDate,
          endDate,
          adults,
          children
        });
        results.inventory = {
          success: true,
          data: inventory,
          note: 'Enhanced inventory with cascade: offers -> calendar -> legacy -> bookings'
        };
      } catch (error) {
        results.inventory = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          note: 'Enhanced inventory cascade failed'
        };
      }
    }

    // Test 5: Apartment Configurations (NEW)
    if (testType === 'all' || testType === 'configurations') {
      try {
        console.log('Testing apartment configurations parser...');
        const configurations = await beds24Service.getApartmentConfigurations();
        results.configurations = {
          success: true,
          data: configurations,
          note: 'Parsed apartment configurations from properties API with room limits, amenities, and booking rules'
        };
      } catch (error) {
        results.configurations = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          note: 'Apartment configurations parser failed'
        };
      }
    }

    // Summary
    const successCount = Object.values(results).filter(
      (result: unknown) => result && typeof result === 'object' && 'success' in result && result.success
    ).length - 1; // -1 for timestamp/testParams

    const totalTests = Object.keys(results).length - 2; // -2 for timestamp/testParams

    results.summary = {
      totalTests,
      successCount,
      failureCount: totalTests - successCount,
      successRate: totalTests > 0 ? Math.round((successCount / totalTests) * 100) : 0
    };

    return NextResponse.json({
      success: true,
      message: 'Enhanced Beds24 API test completed',
      results
    });

  } catch (error) {
    console.error('Enhanced test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Enhanced Beds24 API test failed'
    }, { status: 500 });
  }
}
