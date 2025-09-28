import { NextRequest, NextResponse } from 'next/server';
import { beds24Service } from '@/services/beds24';

/**
 * Jednoduchý API endpoint pre mesačnú dostupnosť apartmánov
 * Používa sa v novom SimpleAvailabilityCalendar komponente
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apartment = searchParams.get('apartment');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const guests = parseInt(searchParams.get('guests') || '2');
    const children = parseInt(searchParams.get('children') || '0');

    if (!apartment || !startDate || !endDate) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: apartment, startDate, endDate'
      }, { status: 400 });
    }

    console.log(`📅 Monthly availability request for ${apartment}:`, {
      startDate,
      endDate,
      guests,
      children
    });

    // Mapovanie apartmánov na Beds24 IDs (aktuálne správne IDs)
    const apartmentMapping: Record<string, { propId: string; roomId: string }> = {
      'design-apartman': { propId: '227484', roomId: '483027' },
      'lite-apartman': { propId: '168900', roomId: '357932' },
      'deluxe-apartman': { propId: '161445', roomId: '357931' }
    };

    const apartmentConfig = apartmentMapping[apartment];
    if (!apartmentConfig) {
      return NextResponse.json({
        success: false,
        error: `Unknown apartment: ${apartment}`
      }, { status: 400 });
    }

    // Získaj dostupnosť z Beds24 pomocí offers API (najlepšie pre ceny + availability)
    const availability = await beds24Service.getInventoryOffers({
      propId: apartmentConfig.propId,
      roomId: apartmentConfig.roomId,
      startDate,
      endDate,
      adults: guests,
      children,
      isCalendar: true // Použije základné ceny namiesto dynamických
    });

    console.log(`📅 Monthly availability response for ${apartment}:`, {
      available: availability.available.length,
      booked: availability.booked.length,
      pricesCount: Object.keys(availability.prices).length,
      samplePrices: Object.entries(availability.prices).slice(0, 3)
    });

    return NextResponse.json({
      success: true,
      apartment,
      startDate,
      endDate,
      guests,
      children,
      available: availability.available,
      booked: availability.booked,
      prices: availability.prices,
      minStay: availability.minStay,
      maxStay: availability.maxStay,
      // Debug info
      dataSource: 'beds24-offers-calendar',
      totalDays: availability.available.length + availability.booked.length
    });

  } catch (error) {
    console.error('Error fetching monthly availability:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}