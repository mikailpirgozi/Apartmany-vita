'use client'

interface StructuredDataProps {
  data: any
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 2)
      }}
    />
  )
}

export function OrganizationStructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Apartmány Vita',
    description: 'Luxusné apartmány v centre Trenčína',
    url: 'https://apartmanyvita.sk',
    logo: 'https://apartmanyvita.sk/images/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+421-900-123-456',
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
      'https://www.facebook.com/apartmanyvita',
      'https://www.instagram.com/apartmanyvita'
    ]
  }

  return <StructuredData data={data} />
}

export function LocalBusinessStructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: 'Apartmány Vita',
    description: 'Luxusné apartmány na Štúrovom námestí v Trenčíne',
    image: [
      'https://apartmanyvita.sk/images/apartments/exterior.jpg',
      'https://apartmanyvita.sk/images/apartments/interior.jpg'
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
    telephone: '+421-900-123-456',
    email: 'info@apartmanyvita.sk',
    url: 'https://apartmanyvita.sk',
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

  return <StructuredData data={data} />
}

interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbStructuredDataProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }

  return <StructuredData data={data} />
}
