import { NextRequest, NextResponse } from 'next/server';
import { beds24Service } from '@/services/beds24';

/**
 * Komplexný test cenových scenárov pre Beds24 API
 * Testuje rôzne kombinácie: počet osôb, dĺžka pobytu, sezóna, zľavy
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testType = searchParams.get('test') || 'all';
  
  const results: unknown[] = [];
  const errors: unknown[] = [];

  try {
    console.log('🧪 STARTING COMPREHENSIVE PRICING TESTS');

    // Test scenáre
    const testScenarios = [
      // Základné testy pre rôzne apartmány
      {
        name: 'Deluxe - 2 osoby, 2 noci (október)',
        apartment: 'deluxe-apartman',
        propId: '161445',
        roomId: '357931',
        startDate: '2025-10-01',
        endDate: '2025-10-03',
        adults: 2,
        children: 0,
        expectedBehavior: 'Základná cena bez príplatkov'
      },
      {
        name: 'Deluxe - 5 osôb, 2 noci (október)',
        apartment: 'deluxe-apartman',
        propId: '161445',
        roomId: '357931',
        startDate: '2025-10-01',
        endDate: '2025-10-03',
        adults: 5,
        children: 0,
        expectedBehavior: 'Príplatok za extra osoby (+48% podľa dokumentácie)'
      },
      {
        name: 'Lite - 2 osoby, 2 noci (október)',
        apartment: 'lite-apartman',
        propId: '168900',
        roomId: '357932',
        startDate: '2025-10-01',
        endDate: '2025-10-03',
        adults: 2,
        children: 0,
        expectedBehavior: 'Najnižšia cena, max 2 osoby'
      },
      {
        name: 'Design - 2 osoby, 2 noci (október)',
        apartment: 'design-apartman',
        propId: '227484',
        roomId: '483027',
        startDate: '2025-10-01',
        endDate: '2025-10-03',
        adults: 2,
        children: 0,
        expectedBehavior: 'Stredná cenová kategória'
      },
      // Testy pre dlhé pobyty (zľavy)
      {
        name: 'Deluxe - 2 osoby, 7 nocí (týždenná zľava)',
        apartment: 'deluxe-apartman',
        propId: '161445',
        roomId: '357931',
        startDate: '2025-10-01',
        endDate: '2025-10-08',
        adults: 2,
        children: 0,
        expectedBehavior: '10% zľava za týždenný pobyt'
      },
      {
        name: 'Deluxe - 2 osoby, 14 nocí (extended stay)',
        apartment: 'deluxe-apartman',
        propId: '161445',
        roomId: '357931',
        startDate: '2025-10-01',
        endDate: '2025-10-15',
        adults: 2,
        children: 0,
        expectedBehavior: '15% zľava za extended stay'
      },
      {
        name: 'Deluxe - 2 osoby, 30 nocí (mesačná zľava)',
        apartment: 'deluxe-apartman',
        propId: '161445',
        roomId: '357931',
        startDate: '2025-10-01',
        endDate: '2025-10-31',
        adults: 2,
        children: 0,
        expectedBehavior: '30% mesačná zľava'
      },
      // Sezónne testy
      {
        name: 'Deluxe - 2 osoby, 2 noci (december - off-season)',
        apartment: 'deluxe-apartman',
        propId: '161445',
        roomId: '357931',
        startDate: '2025-12-01',
        endDate: '2025-12-03',
        adults: 2,
        children: 0,
        expectedBehavior: '20% off-season zľava (december)'
      },
      {
        name: 'Deluxe - 2 osoby, 2 noci (marec - off-season)',
        apartment: 'deluxe-apartman',
        propId: '161445',
        roomId: '357931',
        startDate: '2025-03-01',
        endDate: '2025-03-03',
        adults: 2,
        children: 0,
        expectedBehavior: '20% off-season zľava (marec)'
      },
      {
        name: 'Deluxe - 2 osoby, 2 noci (júl - high season)',
        apartment: 'deluxe-apartman',
        propId: '161445',
        roomId: '357931',
        startDate: '2025-07-01',
        endDate: '2025-07-03',
        adults: 2,
        children: 0,
        expectedBehavior: 'Plná cena bez sezónnej zľavy'
      },
      // Kombinované scenáre
      {
        name: 'Deluxe - 4 osoby, 14 nocí (december - kombinácia)',
        apartment: 'deluxe-apartman',
        propId: '161445',
        roomId: '357931',
        startDate: '2025-12-01',
        endDate: '2025-12-15',
        adults: 4,
        children: 0,
        expectedBehavior: 'Príplatok za osoby + extended stay zľava + off-season zľava'
      }
    ];

    // Spusť testy podľa typu
    const scenariosToRun = testType === 'all' 
      ? testScenarios 
      : testScenarios.filter(s => s.name.toLowerCase().includes(testType.toLowerCase()));

    console.log(`Running ${scenariosToRun.length} test scenarios...`);

    for (const scenario of scenariosToRun) {
      try {
        console.log(`\n🧪 Testing: ${scenario.name}`);
        
        const startTime = Date.now();

        // Test Offers API
        const offersResult = await beds24Service.getInventoryOffers({
          propId: scenario.propId,
          roomId: scenario.roomId,
          startDate: scenario.startDate,
          endDate: scenario.endDate,
          adults: scenario.adults,
          children: scenario.children
        });

        // Test Availability API (náš endpoint)
        const availabilityUrl = `http://localhost:3000/api/beds24/availability?apartment=${scenario.apartment}&checkIn=${scenario.startDate}&checkOut=${scenario.endDate}&guests=${scenario.adults}&children=${scenario.children}`;
        const availabilityResponse = await fetch(availabilityUrl);
        const availabilityResult = await availabilityResponse.json();

        const responseTime = Date.now() - startTime;

        // Vypočítaj očakávané vs skutočné ceny
        const nights = Math.ceil((new Date(scenario.endDate).getTime() - new Date(scenario.startDate).getTime()) / (1000 * 60 * 60 * 24));
        const offersTotal = Object.values(offersResult.prices).reduce((sum: number, price) => sum + (price as number), 0);
        const availabilityTotal = availabilityResult.totalPrice || 0;

        const result = {
          scenario: scenario.name,
          expectedBehavior: scenario.expectedBehavior,
          parameters: {
            apartment: scenario.apartment,
            dates: `${scenario.startDate} to ${scenario.endDate}`,
            nights,
            adults: scenario.adults,
            children: scenario.children
          },
          results: {
            offers: {
              available: offersResult.available.length,
              booked: offersResult.booked.length,
              totalPrice: offersTotal,
              pricePerNight: nights > 0 ? Math.round(offersTotal / nights) : 0,
              prices: offersResult.prices
            },
            availability: {
              success: availabilityResult.success,
              isAvailable: availabilityResult.isAvailable,
              totalPrice: availabilityTotal,
              pricePerNight: availabilityResult.pricePerNight,
              pricingInfo: availabilityResult.pricingInfo
            },
            comparison: {
              priceMatch: Math.abs(offersTotal - availabilityTotal) < 5, // 5€ tolerance
              priceDifference: Math.abs(offersTotal - availabilityTotal),
              responseTime
            }
          },
          analysis: {
            hasDiscount: false,
            guestSurcharge: scenario.adults > 2 ? ((scenario.adults - 2) * 15) : 0,
            seasonalDiscount: [10, 11, 12, 1, 2, 3].includes(new Date(scenario.startDate).getMonth() + 1) ? 20 : 0,
            stayLengthDiscount: nights >= 30 ? 30 : nights >= 14 ? 15 : nights >= 7 ? 10 : 0
          }
        };

        results.push(result);
        console.log(`✅ ${scenario.name}: Offers=${offersTotal}€, Availability=${availabilityTotal}€, Match=${result.results.comparison.priceMatch}`);

      } catch (error) {
        const errorResult = {
          scenario: scenario.name,
          error: error instanceof Error ? error.message : 'Unknown error',
          parameters: scenario
        };
        errors.push(errorResult);
        console.error(`❌ ${scenario.name}: ${errorResult.error}`);
      }
    }

    // Analýza výsledkov
    const summary = {
      totalTests: results.length + errors.length,
      successfulTests: results.length,
      failedTests: errors.length,
      priceMatches: results.filter(r => r.results.comparison.priceMatch).length,
      averageResponseTime: results.length > 0 
        ? Math.round(results.reduce((sum, r) => sum + r.results.comparison.responseTime, 0) / results.length)
        : 0,
      timestamp: new Date().toISOString()
    };

    console.log('\n📊 SUMMARY:', summary);

    return NextResponse.json({
      success: true,
      summary,
      results,
      errors,
      recommendations: [
        'Skontroluj cenové rozdiely medzi offers a availability API',
        'Overiť správnosť zliav pre dlhé pobyty',
        'Validovať sezónne zľavy pre zimné mesiace',
        'Testovať príplatky za extra osoby'
      ]
    });

  } catch (error) {
    console.error('❌ Comprehensive test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      results,
      errors
    }, { status: 500 });
  }
}
