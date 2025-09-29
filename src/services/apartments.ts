import { Apartment, SearchFilters } from '@/types'
import { prisma } from '@/lib/db'
import { getBeds24Service } from '@/services/beds24'

// Real data from database - NO MOCK DATA
export async function getApartments(): Promise<Apartment[]> {
  const apartments = await prisma.apartment.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' }
  })
  
  return apartments.map(apt => ({
    ...apt,
    basePrice: Number(apt.basePrice)
  }))
}

export async function getApartmentBySlug(slug: string): Promise<Apartment | null> {
  const apartment = await prisma.apartment.findUnique({
    where: { slug, isActive: true }
  })

  if (!apartment) return null

  return {
    ...apartment,
    basePrice: Number(apartment.basePrice)
  }
}

export async function getApartmentById(id: string): Promise<Apartment | null> {
  const apartment = await prisma.apartment.findUnique({
    where: { id, isActive: true }
  })

  if (!apartment) return null

  return {
    ...apartment,
    basePrice: Number(apartment.basePrice)
  }
}

export async function searchApartments(filters: Partial<SearchFilters>): Promise<Apartment[]> {
  const whereClause: any = { isActive: true }
  
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
    filteredApartments = apartments.filter(apt => 
      filters.amenities!.every(amenity => apt.amenities.includes(amenity))
    )
  }

  return filteredApartments.map(apt => ({
    ...apt,
    basePrice: Number(apt.basePrice)
  }))
}

export async function getAvailableApartments(
  checkIn: Date, 
  checkOut: Date, 
  guests: number = 1
): Promise<Apartment[]> {
  console.log('🔍 Checking availability for:', { checkIn, checkOut, guests });
  
  // Get suitable apartments from database
  const apartments = await prisma.apartment.findMany({
    where: { 
      isActive: true,
      maxGuests: { gte: guests }
    },
    orderBy: { createdAt: 'asc' }
  })
  
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
    return apartments.map(apt => ({
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
        startDate: checkInStr,
        endDate: checkOutStr
      });
      
      // Check if all requested dates are available (exclude checkout day)
      const requestedDates: string[] = [];
      for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
        requestedDates.push(d.toISOString().split('T')[0]);
      }
      
      const isAvailable = requestedDates.every(date => 
        availabilityData.available.includes(date)
      );
      
      if (isAvailable) {
        availableApartments.push({
          ...apartment,
          basePrice: Number(apartment.basePrice)
        })
      }
      
    } catch (error) {
      console.error(`Error checking availability for ${apartment.name}:`, error)
    }
  }
  
  return availableApartments
}