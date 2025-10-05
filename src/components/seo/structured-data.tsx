'use client'

interface StructuredDataProps {
  data: Record<string, unknown>
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
    description: 'Moderné apartmány v centre Trenčína',
    url: 'https://www.apartmanvita.sk',
    logo: 'https://www.apartmanvita.sk/logo.png',
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
      'https://www.instagram.com/apartmanvita'
    ]
  }

  return <StructuredData data={data} />
}

export function LocalBusinessStructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: 'Apartmány Vita',
    description: 'Moderné apartmány v centre Trenčína',
    image: [
      'https://www.apartmanvita.sk/og-default.jpg'
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
    url: 'https://www.apartmanvita.sk',
    priceRange: '€€',
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
        name: 'Free Parking'
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
