import { NextRequest, NextResponse } from 'next/server';
import { getBeds24Service } from '@/services/beds24';
import { availabilityCache, CACHE_TTL } from '@/lib/cache';
import { analytics } from '@/lib/analytics';

/**
 * API endpoint pre získanie dostupnosti apartmánov
 * Používa sa v booking widget
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  console.log('🔥 API ENDPOINT CALLED - /api/beds24/availability');
  
  try {
    const { searchParams } = new URL(request.url);
    const apartment = searchParams.get('apartment');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guests = searchParams.get('guests') || '2';
    const children = searchParams.get('children') || '0';
    
    console.log('🔥 API PARAMS:', { apartment, checkIn, checkOut, guests, children });

    if (!apartment || !checkIn || !checkOut) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: apartment, checkIn, checkOut'
      }, { status: 400 });
    }

    // Mapovanie apartmánov na Beds24 IDs (CORRECTED based on API testing)
    const apartmentMapping: Record<string, { propId: string; roomId: string }> = {
      'design-apartman': { propId: '227484', roomId: '483027' }, // ✅ Correct
      'lite-apartman': { propId: '168900', roomId: '357932' },   // ✅ Correct  
      'deluxe-apartman': { propId: '161445', roomId: '357931' }, // 🔧 FIXED: Correct property ID
      'maly-apartman': { propId: '161445', roomId: '357931' }    // ✅ Same as deluxe for now
    };

    const apartmentConfig = apartmentMapping[apartment];
    if (!apartmentConfig) {
      return NextResponse.json({
        success: false,
        error: `Unknown apartment: ${apartment}`
      }, { status: 400 });
    }

    // 🚀 PHASE 3: Redis cache integration - use exact date range for cache key
    const cacheKey = `${apartment}:${checkIn}:${checkOut}:${guests}`;

    console.log(`Fetching availability for ${apartment}:`, {
      propId: apartmentConfig.propId,
      roomId: apartmentConfig.roomId,
      checkIn,
      checkOut,
      guests: parseInt(guests),
      children: parseInt(children),
      cacheKey
    });

    let availability: {
      available: string[];
      booked: string[];
      prices: Record<string, number>;
      minStay?: number;
      maxStay?: number;
    } | null = null;
    let cacheHit = false;
    let source: 'redis' | 'memory' | 'api' = 'api';

    // Try cache first
    try {
      availability = await availabilityCache.getAvailability(cacheKey);
      if (availability) {
        cacheHit = true;
        source = 'redis'; // Cache layer determines actual source
        console.log(`✅ Cache HIT for ${apartment} ${checkIn}-${checkOut}`);
        
        // Track cache hit
        analytics.trackApiRequest(
          '/api/beds24/availability',
          'GET',
          Date.now() - startTime,
          true,
          true,
          { apartment, cacheKey }
        );
      }
    } catch (cacheError) {
      console.warn('Cache error, falling back to API:', cacheError);
      analytics.trackError(
        cacheError instanceof Error ? cacheError : new Error('Cache error'),
        'cache-get',
        apartment
      );
    }

    // Cache miss - fetch from API
    if (!availability) {
      console.log(`❌ Cache MISS for ${apartment} - fetching from API`);
      
      try {
        // FIXED: Support both Long Life Token and legacy refresh tokens for consistency with pricing service
        console.log('🎯 Using BEDS24 service with Long Life Token or legacy tokens');
        
        const hasBeds24Config = process.env.BEDS24_LONG_LIFE_TOKEN || (process.env.BEDS24_ACCESS_TOKEN && process.env.BEDS24_REFRESH_TOKEN);
        if (!hasBeds24Config) {
          console.error('❌ No BEDS24 authentication available');
          return NextResponse.json({
            success: false,
            error: 'BEDS24 service not configured - need BEDS24_LONG_LIFE_TOKEN or both BEDS24_ACCESS_TOKEN+BEDS24_REFRESH_TOKEN'
          }, { status: 503 });
        }
        
        const beds24Service = getBeds24Service();
        if (!beds24Service) {
          console.error('❌ Beds24Service not available - cannot get real availability data');
          return NextResponse.json({
            success: false,
            error: 'BEDS24 service not available - real availability data required'
          }, { status: 503 });
        }

        // Get real availability data from Beds24 API (same as pricing service)
        availability = await beds24Service.getInventoryCalendar({
          propId: apartmentConfig.propId,
          roomId: apartmentConfig.roomId,
          startDate: checkIn,
          endDate: checkOut
        });
        
        source = 'api';

        // Store in cache for future requests
        if (availability) {
          try {
            await availabilityCache.setAvailability(cacheKey, availability, CACHE_TTL.AVAILABILITY);
            console.log(`✅ Cached availability for ${apartment}`);
          } catch (cacheError) {
            console.warn('Failed to cache availability:', cacheError);
          }
        }

        // Track API request
        analytics.trackApiRequest(
          '/api/beds24/availability',
          'GET',
          Date.now() - startTime,
          true,
          false,
          { apartment, cacheKey }
        );

      } catch (apiError) {
        console.error(`❌ API error for ${apartment}:`, apiError);
        
        // Track error
        analytics.trackError(
          apiError instanceof Error ? apiError : new Error('API error'),
          'beds24-api',
          apartment
        );

        // Try to serve stale cache data if available
        try {
          const staleData = await availabilityCache.getAvailability(cacheKey);
          if (staleData) {
            console.log(`⚠️ Serving stale cache data for ${apartment}`);
            availability = staleData;
            cacheHit = true;
            source = 'redis';
          }
        } catch (staleError) {
          console.warn('No stale cache data available:', staleError);
        }

        if (!availability) {
          // No fallback - API must work for real availability data
          const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown error';
          console.error('❌ Beds24 API failed and no fallback allowed:', errorMessage);
          
          return NextResponse.json({
            success: false,
            error: `Failed to fetch real availability data: ${errorMessage}`,
            details: {
              apartment,
              checkIn,
              checkOut,
              timestamp: new Date().toISOString(),
              hasBeds24Config: !!(process.env.BEDS24_ACCESS_TOKEN && process.env.BEDS24_REFRESH_TOKEN)
            }
          }, { status: 503 });
        }
      }
    }

    // Ensure we have availability data
    if (!availability) {
      return NextResponse.json({
        success: false,
        error: 'No availability data received'
      }, { status: 503 });
    }

    // Skontroluj či sú všetky dni dostupné - SIMPLIFIED
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const requestedDates: string[] = [];
    
    // FIXED: Don't include checkout day in pricing calculation (checkout day is not charged)
    // For 1 night stay (13.10 -> 14.10), only charge 13.10, not 14.10
    for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
      requestedDates.push(d.toISOString().split('T')[0]);
    }

    const isAvailable = requestedDates.every(date => 
      availability!.available.includes(date)
    );

    // ✅ REÁLNE CENOVÉ DÁTA Z BEDS24 API (FIXED)
    // Používame skutočné ceny z Beds24 Calendar API s našimi zľavami a pravidlami
    const guestCount = parseInt(guests);
    const childrenCount = parseInt(children);
    
    // Vypočítaj celkovú cenu len z dostupných dátumov (nie z obsadených)
    const availableDates = requestedDates.filter(date => 
      availability!.available.includes(date)
    );
    
    // FIXED: Použiť reálne ceny z Beds24 Calendar API
    let basePrice = 0;
    const dailyPricesFromBeds24: Record<string, number> = {};
    
    // NO FALLBACK PRICING - Only real Beds24 data allowed
    
    // FIXED: Copy ALL prices from Beds24 service response - no filtering
    Object.assign(dailyPricesFromBeds24, availability!.prices || {});
    
    // Calculate basePrice only from available dates
    availableDates.forEach(date => {
      const datePrice = dailyPricesFromBeds24[date];
      if (datePrice && datePrice > 0) {
        basePrice += datePrice;
        console.log(`✅ Price for ${date}: €${datePrice}`);
      } else {
        console.warn(`⚠️ Available date ${date} has no price in Beds24 data`);
      }
    });

    // DEBUG: Log final prices object
    console.log(`📊 Final prices for ${apartment}:`, {
      totalDates: availableDates.length,
      pricesCount: Object.keys(dailyPricesFromBeds24).length,
      missingPrices: availableDates.filter(date => !dailyPricesFromBeds24[date]),
      lastDate: availableDates[availableDates.length - 1],
      lastDatePrice: dailyPricesFromBeds24[availableDates[availableDates.length - 1]]
    });
    
    // Dodatočné poplatky za hostí nad základ 2 ľudí (ZA KAŽDÚ NOC!)
    const additionalAdults = Math.max(0, guestCount - 2);
    const additionalChildren = Math.max(0, childrenCount);
    const additionalGuestFeePerNight = (additionalAdults * 20) + (additionalChildren * 10);
    const additionalGuestFee = additionalGuestFeePerNight * availableDates.length;
    
    // Celková cena = Beds24 ceny + poplatky za ďalších hostí
    const totalPrice = basePrice + additionalGuestFee;
    
    console.log(`💰 Pricing calculation for ${apartment}:`, {
      beds24Prices: availability!.prices,
      dailyPricesUsed: dailyPricesFromBeds24,
      basePrice,
      additionalGuestFee,
      totalPrice,
      usingBeds24Prices: Object.keys(availability!.prices || {}).length > 0
    });

    const response = {
      success: true,
      apartment,
      checkIn,
      checkOut,
      isAvailable,
      totalPrice,
      pricePerNight: availableDates.length > 0 ? totalPrice / availableDates.length : 0,
      nights: availableDates.length,
      // Calendar format - required by OptimizedAvailabilityCalendar
      available: availability!.available || [],
      booked: availability!.booked || [],
      prices: dailyPricesFromBeds24, // FIXED: Use real Beds24 prices
      minStay: availability!.minStay || 1,
      maxStay: availability!.maxStay || 30,
      // Legacy format for backward compatibility
      bookedDates: availability!.booked.filter((date: string) => 
        requestedDates.includes(date)
      ),
      dailyPrices: dailyPricesFromBeds24, // FIXED: Use real Beds24 prices
      // Debug info pre Beds24 cenové dáta
      pricingInfo: {
        guestCount,
        childrenCount,
        source: Object.keys(availability!.prices || {}).length > 0 ? 'beds24-calendar-api' : 'fallback-pricing',
        totalDays: availableDates.length,
        averagePricePerNight: Math.round(totalPrice / (availableDates.length || 1)),
        basePrice,
        additionalGuestFee,
        additionalGuestFeePerNight,
        additionalAdults,
        additionalChildren,
        beds24PricesCount: Object.keys(availability!.prices || {}).length,
        dailyPricesFromBeds24
      },
      // 🚀 PHASE 3: Enhanced performance metrics with cache info
      performance: {
        responseTime: Date.now() - startTime,
        cacheHit,
        source,
        cacheKey,
        cacheStats: { hits: 0, misses: 1, activeRequests: 0, hitRate: 0 },
        timestamp: new Date().toISOString()
      }
    };

    console.log('Availability response:', response);
    // Track calendar load performance
    analytics.trackCalendarLoad(
      apartment,
      Date.now() - startTime,
      cacheHit,
      source,
      { checkIn, checkOut, guests: parseInt(guests) }
    );

    return NextResponse.json(response, {
      headers: {
        // Enhanced caching headers based on cache status
        'Cache-Control': cacheHit 
          ? 'public, s-maxage=60, stale-while-revalidate=300'
          : 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Performance-Time': `${Date.now() - startTime}ms`,
        'X-Cache-Status': cacheHit ? 'HIT' : 'MISS',
        'X-Cache-Source': source,
        'X-Cache-Key': cacheKey
      }
    });

  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}