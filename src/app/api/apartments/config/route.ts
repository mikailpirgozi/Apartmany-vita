import { NextRequest, NextResponse } from 'next/server';
import { getBeds24Service } from '@/services/beds24';

/**
 * API endpoint pre získanie apartment konfigurácií z Beds24
 * Vracia reálne dáta o check-in/out časoch, kapacite, cenách
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apartment = searchParams.get('apartment');

    // Mapovanie apartmánov na Beds24 property IDs
    const apartmentMapping: Record<string, { propId: string; roomId: string; slug: string }> = {
      'design-apartman': { propId: '227484', roomId: '483027', slug: 'design-apartman' },
      'lite-apartman': { propId: '168900', roomId: '357932', slug: 'lite-apartman' },
      'deluxe-apartman': { propId: '161445', roomId: '357931', slug: 'deluxe-apartman' }
    };

    if (apartment && !apartmentMapping[apartment]) {
      return NextResponse.json({
        success: false,
        error: `Unknown apartment: ${apartment}`
      }, { status: 400 });
    }

    // Získaj konfigurácie z Beds24 Properties API
    const configurations = await getBeds24Service().getApartmentConfigurations();
    
    if (apartment) {
      // Vráť konfiguráciu pre konkrétny apartmán
      const apartmentConfig = configurations[apartment];
      
      if (!apartmentConfig) {
        return NextResponse.json({
          success: false,
          error: `Configuration not found for apartment: ${apartment}`
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        apartment: {
          slug: apartment,
          ...apartmentConfig,
          // Add computed fields
          checkInTime: `${(apartmentConfig as Record<string, unknown>).checkInStart}-${(apartmentConfig as Record<string, unknown>).checkInEnd}`,
          checkOutTime: (apartmentConfig as Record<string, unknown>).checkOutEnd,
          priceRange: `${(apartmentConfig as Record<string, unknown>).minPrice}€ - ${(apartmentConfig as Record<string, unknown>).rackRate}€`
        }
      });
    }

    // Vráť všetky konfigurácie
    const allConfigurations = Object.entries(configurations).map(([slug, apartmentConfig]) => ({
      slug,
      ...apartmentConfig,
      checkInTime: `${(apartmentConfig as Record<string, unknown>).checkInStart}-${(apartmentConfig as Record<string, unknown>).checkInEnd}`,
      checkOutTime: (apartmentConfig as Record<string, unknown>).checkOutEnd,
      priceRange: `${(apartmentConfig as Record<string, unknown>).minPrice}€ - ${(apartmentConfig as Record<string, unknown>).rackRate}€`
    }));

    return NextResponse.json({
      success: true,
      apartments: allConfigurations,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching apartment configurations:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
