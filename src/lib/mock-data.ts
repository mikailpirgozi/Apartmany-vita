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
