import { NextRequest, NextResponse } from 'next/server';
import { getBeds24Service } from '@/services/beds24';

/**
 * Debug endpoint pre testovanie Beds24 inventory API
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apartment = searchParams.get('apartment') || 'deluxe-apartman';
    const startDate = searchParams.get('startDate') || '2025-10-01';
    const endDate = searchParams.get('endDate') || '2025-10-03';

    // Mapovanie apartmánov na Beds24 IDs
    const apartmentMapping: Record<string, { propId: string; roomId: string }> = {
      'design-apartman': { propId: '227484', roomId: '483027' },
      'lite-apartman': { propId: '168900', roomId: '168900' },
      'deluxe-apartman': { propId: '161445', roomId: '161445' }
    };

    const apartmentConfig = apartmentMapping[apartment];
    if (!apartmentConfig) {
      return NextResponse.json({
        success: false,
        error: `Unknown apartment: ${apartment}`
      }, { status: 400 });
    }

    console.log(`\n=== BEDS24 DEBUG FOR ${apartment.toUpperCase()} ===`);
    console.log('PropId:', apartmentConfig.propId);
    console.log('RoomId:', apartmentConfig.roomId);
    console.log('Date range:', startDate, 'to', endDate);

    // Test 1: Direct inventory call
    let inventoryResult = null;
    let inventoryError = null;
    try {
      console.log('\n--- Testing inventory endpoint ---');
      inventoryResult = await getBeds24Service().getInventory({
        propId: apartmentConfig.propId,
        roomId: apartmentConfig.roomId,
        startDate,
        endDate
      });
      console.log('Inventory result:', JSON.stringify(inventoryResult, null, 2));
    } catch (error) {
      inventoryError = error instanceof Error ? error.message : String(error);
      console.log('Inventory error:', inventoryError);
    }

    // Test 2: Direct availability call (fallback)
    let availabilityResult = null;
    let availabilityError = null;
    try {
      console.log('\n--- Testing availability endpoint ---');
      availabilityResult = await getBeds24Service().getAvailability({
        propId: apartmentConfig.propId,
        roomId: apartmentConfig.roomId,
        startDate,
        endDate
      });
      console.log('Availability result:', JSON.stringify(availabilityResult, null, 2));
    } catch (error) {
      availabilityError = error instanceof Error ? error.message : String(error);
      console.log('Availability error:', availabilityError);
    }

    // Test 3: Direct rates call
    let ratesResult = null;
    let ratesError = null;
    try {
      console.log('\n--- Testing rates endpoint ---');
      ratesResult = await getBeds24Service().getRoomRates(
        apartmentConfig.propId,
        apartmentConfig.roomId,
        startDate,
        endDate
      );
      console.log('Rates result:', JSON.stringify(ratesResult, null, 2));
    } catch (error) {
      ratesError = error instanceof Error ? error.message : String(error);
      console.log('Rates error:', ratesError);
    }

    return NextResponse.json({
      success: true,
      apartment,
      propId: apartmentConfig.propId,
      roomId: apartmentConfig.roomId,
      dateRange: { startDate, endDate },
      tests: {
        inventory: {
          success: !inventoryError,
          error: inventoryError,
          result: inventoryResult
        },
        availability: {
          success: !availabilityError,
          error: availabilityError,
          result: availabilityResult
        },
        rates: {
          success: !ratesError,
          error: ratesError,
          result: ratesResult
        }
      }
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
