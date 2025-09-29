import { Apartment } from '@/types'

// Mock apartments data
export const mockApartments: Apartment[] = [
  // Malý Apartmán - dočasne vypnutý
  // {
  //   id: '1',
  //   name: 'Malý Apartmán',
  //   slug: 'maly-apartman',
  //   description: 'Útulný apartmán ideálny pre páry alebo jednotlivcov. Nachádza sa na prvom poschodí s výhľadom na Štúrovo námestie.',
  //   floor: 1,
  //   size: 30,
  //   maxGuests: 2,
  //   maxChildren: 1,
  //   images: [
  //     'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&crop=center',
  //     'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&crop=center',
  //     'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center'
  //   ],
  //   amenities: ['wifi', 'kitchen', 'tv', 'heating', 'elevator'],
  //   basePrice: 45,
  //   isActive: false, // Dočasne vypnutý
  //   createdAt: new Date('2024-01-01'),
  //   updatedAt: new Date('2024-01-01')
  // },
  {
    id: '2',
    name: 'Design Apartmán',
    slug: 'design-apartman',
    description: 'Štýlovo zariadený apartmán s moderným dizajnom. Perfektný pre páry.',
    floor: 1,
    size: 45,
    maxGuests: 6, // ✅ Updated: Design apartmán má 6 hostí
    maxChildren: 4,
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop&crop=center'
    ],
    amenities: ['wifi', 'kitchen', 'tv', 'heating', 'washer', 'elevator', 'parking'],
    basePrice: 105,
    isActive: true,
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
    maxGuests: 2, // ✅ Updated: Lite apartmán má 2 hostí
    maxChildren: 1,
    images: [
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop&crop=center'
    ],
    amenities: ['wifi', 'kitchen', 'tv', 'heating', 'washer', 'dishwasher', 'balcony', 'elevator', 'parking'],
    basePrice: 75,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '4',
    name: 'Deluxe Apartmán',
    slug: 'deluxe-apartman',
    description: 'Náš najväčší a najluxusnejší apartmán s klimatizáciou a kompletným vybavením pre pohodlný pobyt.',
    floor: 2,
    size: 70,
    maxGuests: 6,
    maxChildren: 4,
    images: [
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&crop=center'
    ],
    amenities: ['wifi', 'kitchen', 'tv', 'ac', 'heating', 'washer', 'dishwasher', 'balcony', 'elevator', 'parking'],
    basePrice: 100,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
]

// Helper function to get apartment by slug
export function getApartmentBySlug(slug: string): Apartment | undefined {
  return mockApartments.find(apartment => apartment.slug === slug)
}

// Helper function to get apartment by id
export function getApartmentById(id: string): Apartment | undefined {
  return mockApartments.find(apartment => apartment.id === id)
}

// Helper function to get all active apartments
export function getActiveApartments(): Apartment[] {
  return mockApartments.filter(apartment => apartment.isActive)
}

// Mock availability data for when Beds24 API is not available
export function getMockAvailability(
  apartment: string,
  checkIn: string,
  checkOut: string,
  guests: number = 2
): {
  available: string[];
  booked: string[];
  prices: Record<string, number>;
  minStay: number;
  maxStay: number;
} {
  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  const available: string[] = [];
  const booked: string[] = [];
  const prices: Record<string, number> = {};
  
  // Generate dates between checkIn and checkOut
  for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    
    // Mock some booked dates (weekends and some random dates)
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
    const isRandomBooked = Math.random() < 0.1; // 10% chance of being booked
    
    if (isWeekend || isRandomBooked) {
      booked.push(dateStr);
    } else {
      available.push(dateStr);
      
      // Set mock prices based on apartment
      let basePrice = 75; // Default
      switch (apartment) {
        case 'design-apartman':
          basePrice = 105;
          break;
        case 'lite-apartman':
          basePrice = 75;
          break;
        case 'deluxe-apartman':
          basePrice = 100;
          break;
      }
      
      // Add some price variation
      const variation = Math.random() * 20 - 10; // -10 to +10
      prices[dateStr] = Math.round(basePrice + variation);
    }
  }
  
  return {
    available,
    booked,
    prices,
    minStay: 1,
    maxStay: 30
  };
}
