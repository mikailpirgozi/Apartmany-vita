import { NextRequest, NextResponse } from 'next/server';
import { beds24Service } from '@/services/beds24';
import { format } from 'date-fns';

/**
 * API endpoint pre získanie cien pre booking (nie kalendár)
 * Používa sa pri rezervácii s konkrétnym počtom hostí
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const apartment = searchParams.get('apartment');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guests = searchParams.get('guests') || '2';
    const children = searchParams.get('children') || '0';

    if (!apartment || !checkIn || !checkOut) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: apartment, checkIn, checkOut'
      }, { status: 400 });
    }

    // Mapovanie apartmánov na Beds24 IDs
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

    console.log(`💰 Fetching booking pricing for ${apartment}:`, {
      propId: apartmentConfig.propId,
      roomId: apartmentConfig.roomId,
      checkIn,
      checkOut,
      guests: parseInt(guests),
      children: parseInt(children)
    });

    // Use inventory method for booking pricing (with discounts and guest adjustments)
    const availability = await beds24Service.getInventory({
      propId: apartmentConfig.propId,
      roomId: apartmentConfig.roomId,
      startDate: checkIn,
      endDate: checkOut,
      adults: parseInt(guests),
      children: parseInt(children),
      isCalendar: false // This is for booking, includes discounts
    });

    // Calculate total price with our discount logic
    const stayPricing = beds24Service.calculateStayPrice(
      apartmentConfig.roomId,
      checkIn,
      checkOut,
      parseInt(guests),
      availability.prices
    );

    // Skontroluj či sú všetky dni dostupné
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const requestedDates: string[] = [];
    
    for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
      requestedDates.push(d.toISOString().split('T')[0]);
    }

    const isAvailable = requestedDates.every(date => 
      availability.available.includes(date)
    );

    const response = {
      success: true,
      apartment,
      checkIn,
      checkOut,
      isAvailable,
      guests: parseInt(guests),
      children: parseInt(children),
      
      // Pricing with discounts
      pricing: {
        totalPrice: stayPricing.totalPrice,
        pricePerNight: Math.round(stayPricing.totalPrice / stayPricing.dailyPrices.length),
        nights: stayPricing.dailyPrices.length,
        dailyBreakdown: stayPricing.dailyPrices,
        
        // Discount information
        hasDiscounts: stayPricing.dailyPrices.some(day => day.discount > 0),
        totalDiscount: stayPricing.dailyPrices.reduce((sum, day) => sum + day.discount, 0),
        totalBasePrice: stayPricing.dailyPrices.reduce((sum, day) => sum + day.basePrice, 0)
      },
      
      // Availability info
      available: availability.available,
      booked: availability.booked,
      
      // Performance metrics
      performance: {
        responseTime: Date.now() - startTime,
        source: 'beds24-inventory-booking',
        timestamp: new Date().toISOString()
      }
    };

    console.log('Booking pricing response:', response);

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'X-Performance-Time': `${Date.now() - startTime}ms`,
        'X-Pricing-Source': 'beds24-inventory-booking'
      }
    });

  } catch (error) {
    console.error('Error fetching booking pricing:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
