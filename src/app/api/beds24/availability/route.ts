import { NextRequest, NextResponse } from 'next/server';
import { beds24Service } from '@/services/beds24';

/**
 * API endpoint pre získanie dostupnosti apartmánov
 * Používa sa v booking widget
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apartment = searchParams.get('apartment');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');

    if (!apartment || !checkIn || !checkOut) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: apartment, checkIn, checkOut'
      }, { status: 400 });
    }

    // Mapovanie apartmánov na Beds24 IDs
    const apartmentMapping: Record<string, { propId: string; roomId: string }> = {
      'design-apartman': { propId: '227484', roomId: '483027' },
      'lite-apartman': { propId: '168900', roomId: '168900' },
      'deluxe-apartman': { propId: '161445', roomId: '161445' },
      'maly-apartman': { propId: '357931', roomId: '357931' } // Fallback
    };

    const apartmentConfig = apartmentMapping[apartment];
    if (!apartmentConfig) {
      return NextResponse.json({
        success: false,
        error: `Unknown apartment: ${apartment}`
      }, { status: 400 });
    }

    console.log(`Fetching availability for ${apartment}:`, {
      propId: apartmentConfig.propId,
      roomId: apartmentConfig.roomId,
      checkIn,
      checkOut
    });

    // Získaj dostupnosť z Beds24
    const availability = await beds24Service.getAvailability({
      propId: apartmentConfig.propId,
      roomId: apartmentConfig.roomId,
      startDate: checkIn,
      endDate: checkOut
    });

    // Skontroluj či sú všetky dni dostupné
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const requestedDates = [];
    
    for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
      requestedDates.push(d.toISOString().split('T')[0]);
    }

    const isAvailable = requestedDates.every(date => 
      availability.available.includes(date)
    );

    // Vypočítaj celkovú cenu
    const totalPrice = requestedDates.reduce((sum, date) => 
      sum + (availability.prices[date] || 0), 0
    );

    const response = {
      success: true,
      apartment,
      checkIn,
      checkOut,
      isAvailable,
      totalPrice,
      pricePerNight: requestedDates.length > 0 ? totalPrice / requestedDates.length : 0,
      nights: requestedDates.length,
      bookedDates: availability.booked.filter(date => 
        requestedDates.includes(date)
      ),
      dailyPrices: requestedDates.reduce((acc, date) => {
        acc[date] = availability.prices[date] || 0;
        return acc;
      }, {} as Record<string, number>)
    };

    console.log('Availability response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}