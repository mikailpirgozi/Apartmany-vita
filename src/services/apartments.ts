import { Apartment, SearchFilters } from '@/types'
import { mockApartments, getApartmentBySlug as getMockApartmentBySlug, getActiveApartments } from '@/lib/mock-data'
import { getBeds24Service } from '@/services/beds24'

// For now, we'll use mock data. Later this will be replaced with actual API calls.

export async function getApartments(): Promise<Apartment[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100))
  return getActiveApartments()
}

export async function getApartmentBySlug(slug: string): Promise<Apartment | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100))
  const apartment = getMockApartmentBySlug(slug)
  return apartment || null
}

export async function getApartmentById(id: string): Promise<Apartment | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100))
  const apartment = mockApartments.find(apt => apt.id === id)
  return apartment || null
}

export async function searchApartments(filters: Partial<SearchFilters>): Promise<Apartment[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200))
  
  let apartments = getActiveApartments()

  // Apply filters
  if (filters.priceRange) {
    apartments = apartments.filter(apt => {
      const price = typeof apt.basePrice === 'number' ? apt.basePrice : apt.basePrice.toNumber()
      return price >= filters.priceRange![0] && price <= filters.priceRange![1]
    })
  }

  if (filters.size) {
    apartments = apartments.filter(apt => 
      apt.size >= filters.size![0] && 
      apt.size <= filters.size![1]
    )
  }

  if (filters.floor && filters.floor.length > 0) {
    apartments = apartments.filter(apt => 
      filters.floor!.includes(apt.floor)
    )
  }

  if (filters.maxGuests) {
    apartments = apartments.filter(apt => 
      apt.maxGuests >= filters.maxGuests!
    )
  }

  if (filters.amenities && filters.amenities.length > 0) {
    apartments = apartments.filter(apt => 
      filters.amenities!.every(amenity => apt.amenities.includes(amenity))
    )
  }

  return apartments
}

export async function getAvailableApartments(
  checkIn: Date, 
  checkOut: Date, 
  guests: number = 1
): Promise<Apartment[]> {
  console.log('🔍 Checking availability for:', { checkIn, checkOut, guests });
  
  const apartments = getActiveApartments()
  const availableApartments: Apartment[] = []
  
  // Filter apartments that can accommodate the guests first
  const suitableApartments = apartments.filter(apt => apt.maxGuests >= guests)
  
  // Mapovanie apartmánov na Beds24 IDs (same as in API route)
  const apartmentMapping: Record<string, { propId: string; roomId: string }> = {
    'design-apartman': { propId: '227484', roomId: '483027' },
    'lite-apartman': { propId: '168900', roomId: '357932' },   
    'deluxe-apartman': { propId: '161445', roomId: '357931' },
    'maly-apartman': { propId: '161445', roomId: '357931' }
  };
  
  // Check if BEDS24 environment variables are available
  const hasBeds24Config = process.env.BEDS24_ACCESS_TOKEN && process.env.BEDS24_REFRESH_TOKEN;
  
  if (!hasBeds24Config) {
    console.warn('⚠️ BEDS24 environment variables not available, returning all suitable apartments as available');
    return suitableApartments;
  }

  // Check availability for each suitable apartment via Beds24 service
  for (const apartment of suitableApartments) {
    try {
      const apartmentConfig = apartmentMapping[apartment.slug];
      if (!apartmentConfig) {
        console.warn(`⚠️ No Beds24 mapping for apartment: ${apartment.slug}`);
        continue;
      }
      
      // Format dates for API call
      const checkInStr = checkIn.toISOString().split('T')[0]
      const checkOutStr = checkOut.toISOString().split('T')[0]
      
      console.log(`🏠 Checking ${apartment.name} availability via Beds24 service`);
      
      // Use Beds24 service directly
      const beds24Service = getBeds24Service();
      const availabilityData = await beds24Service.getInventoryCalendar({
        propId: apartmentConfig.propId,
        roomId: apartmentConfig.roomId,
        startDate: checkInStr,
        endDate: checkOutStr
      });
      
      // Check if all requested dates are available
      const startDate = new Date(checkIn);
      const endDate = new Date(checkOut);
      const requestedDates: string[] = [];
      
      for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
        requestedDates.push(d.toISOString().split('T')[0]);
      }
      
      const isAvailable = requestedDates.every(date => 
        availabilityData.available.includes(date)
      );
      
      console.log(`📊 ${apartment.name} availability:`, {
        isAvailable,
        requestedDates: requestedDates.length,
        availableDates: availabilityData.available.length
      });
      
      // Only include apartment if it's available for the entire period
      if (isAvailable) {
        availableApartments.push(apartment)
        console.log(`✅ ${apartment.name} is available`)
      } else {
        console.log(`❌ ${apartment.name} is NOT available`)
      }
      
    } catch (error) {
      console.error(`💥 Error checking availability for ${apartment.name}:`, error)
      // In case of error, we don't include the apartment (fail-safe approach)
    }
  }
  
  console.log(`🎯 Found ${availableApartments.length} available apartments out of ${suitableApartments.length} suitable ones`);
  return availableApartments
}
