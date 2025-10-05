import { Apartment } from '@/types'

export interface StructuredDataConfig {
  type: 'Organization' | 'LocalBusiness' | 'Accommodation' | 'WebSite' | 'BreadcrumbList'
  data: Record<string, unknown>
}

export function generateOrganizationData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Apartmány Vita',
    description: 'Luxusné apartmány v centre Trenčína',
    url: 'https://apartmanvita.sk',
    logo: 'https://apartmanvita.sk/images/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+421-940-728-676',
      contactType: 'customer service',
      availableLanguage: ['Slovak', 'English', 'German', 'Hungarian', 'Polish']
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Štúrovo námestie 132/16',
      addressLocality: 'Trenčín',
      postalCode: '911 01',
      addressCountry: 'SK'
    },
    sameAs: [
      'https://www.facebook.com/apartmanvita',
      'https://www.instagram.com/apartmanvita',
      'https://www.booking.com/apartmanvita'
    ]
  }
}

export function generateLocalBusinessData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: 'Apartmány Vita',
    description: 'Luxusné apartmány na Štúrovom námestí v Trenčíne',
    image: [
      'https://apartmanvita.sk/images/apartments/exterior.jpg',
      'https://apartmanvita.sk/images/apartments/interior.jpg'
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Štúrovo námestie 132/16',
      addressLocality: 'Trenčín',
      addressRegion: 'Trenčiansky kraj',
      postalCode: '911 01',
      addressCountry: 'SK'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 48.8951,
      longitude: 18.0447
    },
    telephone: '+421-940-728-676',
    email: 'info@apartmanvita.sk',
    url: 'https://apartmanvita.sk',
    priceRange: '€45-€95',
    starRating: {
      '@type': 'Rating',
      ratingValue: '4.8',
      bestRating: '5'
    },
    amenityFeature: [
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Free WiFi'
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Air Conditioning'
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Kitchen'
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: '24/7 Check-in'
      }
    ],
    openingHours: '24/7',
    paymentAccepted: ['Cash', 'Credit Card', 'Debit Card'],
    currenciesAccepted: 'EUR'
  }
}

export function generateApartmentStructuredData(apartment: Apartment) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Accommodation',
    name: apartment.name,
    description: apartment.description,
    image: apartment.images,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Štúrovo námestie 132/16',
      addressLocality: 'Trenčín',
      postalCode: '911 01',
      addressCountry: 'SK'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 48.8951,
      longitude: 18.0447
    },
    floorSize: {
      '@type': 'QuantitativeValue',
      value: apartment.size,
      unitCode: 'MTK'
    },
    occupancy: {
      '@type': 'QuantitativeValue',
      maxValue: apartment.maxGuests
    },
    amenityFeature: apartment.amenities.map(amenity => ({
      '@type': 'LocationFeatureSpecification',
      name: amenity
    })),
    offers: {
      '@type': 'Offer',
      price: apartment.basePrice,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      validFrom: new Date().toISOString(),
      priceSpecification: {
        '@type': 'PriceSpecification',
        price: apartment.basePrice,
        priceCurrency: 'EUR',
        eligibleQuantity: {
          '@type': 'QuantitativeValue',
          unitText: 'night'
        }
      }
    },
    provider: {
      '@type': 'Organization',
      name: 'Apartmány Vita',
      telephone: '+421-940-728-676',
      email: 'info@apartmanvita.sk'
    }
  }
}

export function generateWebSiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Apartmány Vita',
    description: 'Luxusné apartmány v centre Trenčína',
    url: 'https://apartmanvita.sk',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://apartmanvita.sk/apartments?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Apartmány Vita',
      logo: {
        '@type': 'ImageObject',
        url: 'https://apartmanvita.sk/images/logo.png'
      }
    },
    inLanguage: ['sk', 'en', 'de', 'hu', 'pl']
  }
}

export function generateBreadcrumbData(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }
}

export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}

export function generateStructuredDataScript(data: Record<string, unknown>): string {
  return `<script type="application/ld+json">${JSON.stringify(data, null, 2)}</script>`
}
