import { Metadata } from 'next'
import { Apartment } from '@/types'

export interface SEOConfig {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article'
  locale?: string
}

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = '/images/og-default.jpg',
    url,
    type = 'website',
    locale = 'sk'
  } = config

  return {
    title,
    description,
    keywords: keywords.join(', '),
    
    openGraph: {
      title,
      description,
      type,
      locale,
      url,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title
        }
      ],
      siteName: 'Apartmány Vita'
    },
    
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image]
    },
    
    alternates: {
      canonical: url,
      languages: {
        'sk': url,
        'en': url?.replace('/sk/', '/en/') || url,
        'de': url?.replace('/sk/', '/de/') || url,
        'hu': url?.replace('/sk/', '/hu/') || url,
        'pl': url?.replace('/sk/', '/pl/') || url
      }
    },
    
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    }
  }
}

export function generateApartmentMetadata(apartment: Apartment, locale: string = 'sk'): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.apartmanvita.sk'
  
  const titles = {
    sk: `${apartment.name} - Apartmány Vita Trenčín`,
    en: `${apartment.name} - Vita Apartments Trenčín`,
    de: `${apartment.name} - Vita Apartments Trenčín`,
    hu: `${apartment.name} - Vita Apartmanok Trenčín`,
    pl: `${apartment.name} - Apartamenty Vita Trenčín`
  }
  
  const descriptions = {
    sk: `${apartment.description}. ${apartment.size}m², max ${apartment.maxGuests} osôb. Rezervujte si luxusný apartmán v centre Trenčína na Štúrovom námestí.`,
    en: `${apartment.description}. ${apartment.size}m², max ${apartment.maxGuests} guests. Book a luxury apartment in the center of Trenčín at Štúr Square.`,
    de: `${apartment.description}. ${apartment.size}m², max ${apartment.maxGuests} Gäste. Buchen Sie ein Luxus-Apartment im Zentrum von Trenčín am Štúr-Platz.`,
    hu: `${apartment.description}. ${apartment.size}m², max ${apartment.maxGuests} vendég. Foglaljon luxus apartmant Trenčín központjában a Štúr téren.`,
    pl: `${apartment.description}. ${apartment.size}m², max ${apartment.maxGuests} gości. Zarezerwuj luksusowy apartament w centrum Trenčína na Placu Štúra.`
  }
  
  const keywords = [
    'apartmán Trenčín',
    'ubytovanie Trenčín centrum',
    apartment.name,
    `apartmán ${apartment.size}m²`,
    'Štúrovo námestie',
    'luxury apartment',
    'booking',
    'accommodation'
  ]

  return generateMetadata({
    title: titles[locale as keyof typeof titles] || titles.sk,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.sk,
    keywords,
    image: apartment.images[0],
    url: `${baseUrl}/${locale}/apartments/${apartment.slug}`,
    locale
  })
}

export function generateHomepageMetadata(locale: string = 'sk'): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.apartmanvita.sk'
  
  const titles = {
    sk: 'Apartmány Vita - Luxusné ubytovanie v centre Trenčína',
    en: 'Vita Apartments - Luxury accommodation in the center of Trenčín',
    de: 'Vita Apartments - Luxusunterkunft im Zentrum von Trenčín',
    hu: 'Vita Apartmanok - Luxus szállás Trenčín központjában',
    pl: 'Apartamenty Vita - Luksusowe zakwaterowanie w centrum Trenčína'
  }
  
  const descriptions = {
    sk: 'Luxusné apartmány na Štúrovom námestí v Trenčíne. Moderné vybavenie, ideálna poloha, 24/7 prístup. Rezervujte si nezabudnuteľný pobyt v srdci mesta.',
    en: 'Luxury apartments at Štúr Square in Trenčín. Modern amenities, ideal location, 24/7 access. Book an unforgettable stay in the heart of the city.',
    de: 'Luxus-Apartments am Štúr-Platz in Trenčín. Moderne Ausstattung, ideale Lage, 24/7 Zugang. Buchen Sie einen unvergesslichen Aufenthalt im Herzen der Stadt.',
    hu: 'Luxus apartmanok a Štúr téren Trenčínben. Modern felszereltség, ideális helyszín, 24/7 hozzáférés. Foglaljon felejthetetlen tartózkodást a város szívében.',
    pl: 'Luksusowe apartamenty na Placu Štúra w Trenčínie. Nowoczesne udogodnienia, idealna lokalizacja, dostęp 24/7. Zarezerwuj niezapomniany pobyt w sercu miasta.'
  }
  
  const keywords = [
    'apartmány Trenčín',
    'ubytovanie Trenčín',
    'Štúrovo námestie',
    'luxury apartments',
    'accommodation Trenčín',
    'hotel alternative',
    'city center',
    'booking'
  ]

  return generateMetadata({
    title: titles[locale as keyof typeof titles] || titles.sk,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.sk,
    keywords,
    url: `${baseUrl}/${locale === 'sk' ? '' : locale}`,
    locale
  })
}
