import { Apartment, SearchFilters } from '@/types'
import { mockApartments, getApartmentBySlug as getMockApartmentBySlug, getActiveApartments } from '@/lib/mock-data'

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
    apartments = apartments.filter(apt => 
      apt.basePrice >= filters.priceRange![0] && 
      apt.basePrice <= filters.priceRange![1]
    )
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
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // For now, return all apartments that can accommodate the guests
  // Later this will check actual availability from Beds24
  const apartments = getActiveApartments()
  return apartments.filter(apt => apt.maxGuests >= guests)
}
