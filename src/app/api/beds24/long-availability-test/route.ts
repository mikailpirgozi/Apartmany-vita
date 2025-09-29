import { NextRequest, NextResponse } from 'next/server';
import { getBeds24LongLifeService } from '@/services/beds24-longlife';

/**
 * Test endpoint pre dlhodobú dostupnosť s Long Life Token
 * Testuje dostupnosť od dnešného dátumu po 20.1.2026
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Long Life Token long-term availability...');

    const { searchParams } = new URL(request.url);
    const apartment = searchParams.get('apartment') || 'design-apartman';

    // Check if Long Life Token is configured
    const hasLongLifeToken = !!process.env.BEDS24_LONG_LIFE_TOKEN;
    
    if (!hasLongLifeToken) {
      return NextResponse.json({
        success: false,
        error: 'BEDS24_LONG_LIFE_TOKEN not configured'
      }, { status: 400 });
    }

    // Initialize Long Life Service
    const longLifeService = getBeds24LongLifeService();
    
    if (!longLifeService) {
      return NextResponse.json({
        success: false,
        error: 'Failed to initialize Long Life Token service'
      }, { status: 500 });
    }

    // Apartment mapping
    const apartmentMapping: Record<string, { propId: string; roomId: string }> = {
      'design-apartman': { propId: '227484', roomId: '483027' },
      'lite-apartman': { propId: '168900', roomId: '357932' },
      'deluxe-apartman': { propId: '161445', roomId: '357931' },
      'maly-apartman': { propId: '161445', roomId: '357931' }
    };

    const apartmentConfig = apartmentMapping[apartment];
    if (!apartmentConfig) {
      return NextResponse.json({
        success: false,
        error: `Unknown apartment: ${apartment}`
      }, { status: 400 });
    }

    // Dlhodobé testovanie: od dnešného dátumu po 20.1.2026
    const today = new Date();
    const endDate = new Date('2026-01-20');

    console.log(`📅 Testing availability from ${today.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

    const availabilityData = await longLifeService.getInventoryCalendar({
      propId: apartmentConfig.propId,
      roomId: apartmentConfig.roomId,
      startDate: today.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });

    // Spracuj dáta pre lepšiu analýzu
    const totalDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const availableDays = availabilityData.available.length;
    const bookedDays = availabilityData.booked.length;
    
    // Rozdeľ dáta po mesiacoch pre lepší prehľad
    const monthlyData: Record<string, {
      available: string[];
      booked: string[];
      prices: Record<string, number>;
    }> = {};

    // Inicializuj mesačné dáta
    const currentDate = new Date(today);
    while (currentDate <= endDate) {
      const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          available: [],
          booked: [],
          prices: {}
        };
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Rozdeľ dostupné dátumy po mesiacoch
    availabilityData.available.forEach(date => {
      const monthKey = date.substring(0, 7); // YYYY-MM
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].available.push(date);
        if (availabilityData.prices[date]) {
          monthlyData[monthKey].prices[date] = availabilityData.prices[date];
        }
      }
    });

    // Rozdeľ obsadené dátumy po mesiacoch
    availabilityData.booked.forEach(date => {
      const monthKey = date.substring(0, 7); // YYYY-MM
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].booked.push(date);
      }
    });

    // Vytvor mesačnú štatistiku
    const monthlyStats = Object.keys(monthlyData).map(month => ({
      month,
      availableDays: monthlyData[month].available.length,
      bookedDays: monthlyData[month].booked.length,
      averagePrice: monthlyData[month].available.length > 0 
        ? Math.round(Object.values(monthlyData[month].prices).reduce((a, b) => a + b, 0) / monthlyData[month].available.length)
        : 0
    }));

    return NextResponse.json({
      success: true,
      message: `Long-term availability test successful for ${apartment}! 📊`,
      data: {
        apartment,
        propId: apartmentConfig.propId,
        roomId: apartmentConfig.roomId,
        testPeriod: {
          start: today.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
          totalDays
        },
        summary: {
          totalDays,
          availableDays,
          bookedDays,
          availabilityRate: Math.round((availableDays / totalDays) * 100),
          averagePrice: availableDays > 0 
            ? Math.round(Object.values(availabilityData.prices).reduce((a, b) => a + b, 0) / availableDays)
            : 0
        },
        monthlyStats,
        detailedData: {
          available: availabilityData.available,
          booked: availabilityData.booked,
          prices: availabilityData.prices,
          monthlyBreakdown: monthlyData
        }
      },
      environment: {
        hasLongLifeToken: true,
        longLifeTokenLength: process.env.BEDS24_LONG_LIFE_TOKEN?.length || 0,
        baseUrl: process.env.BEDS24_BASE_URL || 'https://api.beds24.com/v2'
      }
    });

  } catch (error) {
    console.error('Long-term availability test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Long-term availability test failed'
    }, { status: 500 });
  }
}
