import { Apartment, SearchFilters } from '@/types'
import { prisma } from '@/lib/db'
import { getBeds24Service } from '@/services/beds24'

// Static apartment data (used when database is not available)
const STATIC_APARTMENTS: Apartment[] = [
  {
    id: '2',
    name: 'Design Apartmán',
    slug: 'design-apartman',
    description: 'Štýlovo zariadený apartmán s moderným dizajnom. Perfektný pre páry.',
    floor: 1,
    size: 45,
    maxGuests: 6,
    maxChildren: 4,
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop&crop=center'
    ],
    amenities: ['wifi', 'kitchen', 'tv', 'heating', 'washer', 'elevator', 'parking'],
    basePrice: 105, // NOTE: Real prices come from Beds24 API
    isActive: true,
    seoKeywords: ['design', 'apartmán', 'Trenčín', 'moderný', 'dizajn'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '3',
    name: 'Lite Apartmán',
    slug: 'lite-apartman',
    description: 'Priestranný apartmán na druhom poschodí s balkónom a krásnym výhľadom na mesto.',
    floor: 2,
    size: 55,
    maxGuests: 2,
    maxChildren: 1,
    images: [
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop&crop=center'
    ],
    amenities: ['wifi', 'kitchen', 'tv', 'heating', 'washer', 'dishwasher', 'balcony', 'elevator', 'parking'],
    basePrice: 75, // NOTE: Real prices come from Beds24 API
    isActive: true,
    seoKeywords: ['lite', 'apartmán', 'Trenčín', 'balkón', 'ubytovanie'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '4',
    name: 'Deluxe Apartmán',
    slug: 'deluxe-apartman',
    description: 'Najluxusnejší apartmán s krásnym výhľadom a kompletným vybavením pre až 6 hostí.',
    floor: 2,
    size: 70,
    maxGuests: 6,
    maxChildren: 4,
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop&crop=center'
    ],
    amenities: ['wifi', 'kitchen', 'tv', 'heating', 'washer', 'dishwasher', 'balcony', 'elevator', 'parking', 'aircon'],
    basePrice: 100, // NOTE: Real prices come from Beds24 API
    isActive: true,
    seoKeywords: ['deluxe', 'apartmán', 'Trenčín', 'luxusné', 'ubytovanie'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Real data from database with fallback to static data
export async function getApartments(): Promise<Apartment[]> {
  try {
    const apartments = await prisma.apartment.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' }
    })
    
    return apartments.map((apt) => ({
      ...apt,
      basePrice: Number(apt.basePrice)
    }))
  } catch (error) {
    console.warn('Database not available, using static apartment data:', error);
    return STATIC_APARTMENTS.filter((apt) => apt.isActive);
  }
}

export async function getApartmentBySlug(slug: string): Promise<Apartment | null> {
  try {
    const apartment = await prisma.apartment.findUnique({
      where: { slug, isActive: true }
    })

    if (!apartment) return null

    return {
      ...apartment,
      basePrice: Number(apartment.basePrice)
    }
  } catch (err) {
    console.warn('Database not available, using static data for slug:', slug, err);
    return STATIC_APARTMENTS.find(apt => apt.slug === slug && apt.isActive) || null;
  }
}

export async function getApartmentById(id: string): Promise<Apartment | null> {
  try {
    const apartment = await prisma.apartment.findUnique({
      where: { id, isActive: true }
    })

    if (!apartment) return null

    return {
      ...apartment,
      basePrice: Number(apartment.basePrice)
    }
  } catch (err) {
    console.warn('Database not available, using static data for id:', id, err);
    return STATIC_APARTMENTS.find(apt => apt.id === id && apt.isActive) || null;
  }
}

export async function searchApartments(filters: Partial<SearchFilters>): Promise<Apartment[]> {
  try {
    const whereClause: Record<string, unknown> = { isActive: true }
    
    // Price range filter
    if (filters.priceRange) {
      whereClause.basePrice = {
        gte: filters.priceRange[0],
        lte: filters.priceRange[1]
      }
    }

    // Size filter
    if (filters.size) {
      whereClause.size = {
        gte: filters.size[0],
        lte: filters.size[1]
      }
    }

    // Floor filter
    if (filters.floor && filters.floor.length > 0) {
      whereClause.floor = {
        in: filters.floor
      }
    }

    // Max guests filter
    if (filters.maxGuests) {
      whereClause.maxGuests = {
        gte: filters.maxGuests
      }
    }

    const apartments = await prisma.apartment.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' }
    })
    
    // Amenities filter (array contains check)
    let filteredApartments = apartments
    if (filters.amenities && filters.amenities.length > 0) {
      filteredApartments = apartments.filter((apt) => 
        filters.amenities!.every(amenity => apt.amenities.includes(amenity))
      )
    }

    return filteredApartments.map(apt => ({
      ...apt,
      basePrice: Number(apt.basePrice)
    }))
  } catch (error) {
    console.warn('Database not available, using static data with filters:', error);
    // Apply filters to static data
    let apartments = STATIC_APARTMENTS.filter((apt) => apt.isActive);
    
    if (filters.maxGuests) {
      apartments = apartments.filter((apt) => apt.maxGuests >= filters.maxGuests!);
    }
    
    if (filters.amenities && filters.amenities.length > 0) {
      apartments = apartments.filter((apt) => 
        filters.amenities!.every(amenity => apt.amenities.includes(amenity))
      );
    }
    
    return apartments;
  }
}

export async function getAvailableApartments(
  checkIn: Date, 
  checkOut: Date, 
  guests: number = 1
): Promise<Apartment[]> {
  console.log('🔍 Checking availability for:', { checkIn, checkOut, guests });
  
  // Get suitable apartments (database with fallback to static)
  let apartments: Apartment[];
  try {
    const dbApartments = await prisma.apartment.findMany({
      where: { 
        isActive: true,
        maxGuests: { gte: guests }
      },
      orderBy: { createdAt: 'asc' }
    })
    apartments = dbApartments.map(apt => ({
      ...apt,
      basePrice: Number(apt.basePrice)
    }));
  } catch (err) {
    console.warn('Database not available, using static apartments for availability check', err);
    apartments = STATIC_APARTMENTS.filter((apt) => apt.isActive && apt.maxGuests >= guests);
  }
  
  const availableApartments: Apartment[] = []
  
  // Apartment to Beds24 mapping
  const apartmentMapping: Record<string, { propId: string; roomId: string }> = {
    'design-apartman': { propId: '227484', roomId: '483027' },
    'lite-apartman': { propId: '168900', roomId: '357932' },   
    'deluxe-apartman': { propId: '161445', roomId: '357931' }
  };
  
  // Check if BEDS24 is available
  const hasBeds24Config = process.env.BEDS24_LONG_LIFE_TOKEN || (process.env.BEDS24_ACCESS_TOKEN && process.env.BEDS24_REFRESH_TOKEN);
  
  if (!hasBeds24Config) {
    console.warn('⚠️ BEDS24 not configured, returning database apartments without availability check');
    return apartments.map((apt) => ({
      ...apt,
      basePrice: Number(apt.basePrice)
    }))
  }

  // Check real availability via Beds24
  for (const apartment of apartments) {
    try {
      const apartmentConfig = apartmentMapping[apartment.slug];
      if (!apartmentConfig) {
        console.warn(`⚠️ No Beds24 mapping for apartment: ${apartment.slug}`);
        continue;
      }
      
      const checkInStr = checkIn.toISOString().split('T')[0]
      const checkOutStr = checkOut.toISOString().split('T')[0]
      
      const beds24Service = getBeds24Service();
      if (!beds24Service) continue;
      
      const availabilityData = await beds24Service.getInventoryCalendar({
        propId: apartmentConfig.propId,
        roomId: apartmentConfig.roomId,
        startDate: checkInStr ?? '',
        endDate: checkOutStr ?? ''
      });
      
      // Check if all requested dates are available (exclude checkout day)
      const requestedDates: string[] = [];
      for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (dateStr) {
          requestedDates.push(dateStr);
        }
      }
      
      const isAvailable = requestedDates.every(date => 
        availabilityData.available.includes(date)
      );
      
      if (isAvailable) {
        availableApartments.push(apartment)
      }
      
    } catch (error) {
      console.error(`Error checking availability for ${apartment.name}:`, error)
    }
  }
  
  return availableApartments
}