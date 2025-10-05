import { Metadata } from 'next';

const BASE_URL = 'https://www.apartmanvita.sk';

interface SEOMetadataProps {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogImage?: string;
}

/**
 * Generate SEO metadata for pages
 * Includes: title, description, keywords, Open Graph, Twitter Cards, canonical URL
 */
export function generateSEOMetadata({
  title,
  description,
  path,
  keywords = [],
  ogImage = '/og-default.jpg',
}: SEOMetadataProps): Metadata {
  const url = `${BASE_URL}${path}`;
  const fullTitle = `${title} | Apartmány Vita`;
  
  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: 'Apartmány Vita',
      images: [
        {
          url: `${BASE_URL}${ogImage}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'sk_SK',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [`${BASE_URL}${ogImage}`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * SEO metadata for homepage
 */
export const homepageMetadata = generateSEOMetadata({
  title: 'Apartmány Vita Trenčín – moderné ubytovanie v centre mesta',
  description: 'Apartmány Vita Trenčín ponúkajú komfort, čistotu a štýl. Vyberte si Design, Lite alebo Deluxe apartmán v centre Trenčína. Rezervujte online.',
  path: '',
  keywords: [
    'apartmány Trenčín',
    'apartmán Trenčín',
    'ubytovanie Trenčín',
    'apartmány Vita',
    'apartmany Trencin',
    'ubytovanie Trencin',
  ],
});

/**
 * SEO metadata for apartments listing page
 */
export const apartmentsListingMetadata = generateSEOMetadata({
  title: 'Naše apartmány Vita Trenčín – Design, Lite a Deluxe',
  description: 'Prezrite si všetky typy apartmánov Vita Trenčín – od útulného Lite po luxusný Deluxe. Skvelé ubytovanie v srdci mesta.',
  path: '/apartments',
  keywords: [
    'apartmány Vita Trenčín',
    'apartmány v Trenčíne',
    'ubytovanie Trenčín centrum',
    'apartmany Vita Trencin',
  ],
});

/**
 * SEO metadata for booking page
 */
export const bookingMetadata = generateSEOMetadata({
  title: 'Rezervácia – Apartmány Vita Trenčín',
  description: 'Rezervujte si svoj apartmán Vita Trenčín online. Okamžité potvrdenie, najlepšia cena a bez skrytých poplatkov.',
  path: '/booking',
  keywords: [
    'rezervácia apartmán Trenčín',
    'rezervácia Vita Trenčín',
    'online rezervácia ubytovanie',
    'rezervacia apartman Trencin',
  ],
});

/**
 * SEO metadata for contact page
 */
export const contactMetadata = generateSEOMetadata({
  title: 'Kontakt – Apartmány Vita Trenčín',
  description: 'Potrebujete poradiť s rezerváciou? Kontaktujte nás – Apartmány Vita Trenčín. Radi pomôžeme.',
  path: '/contact',
  keywords: [
    'kontakt apartmány Vita',
    'telefón apartmány Trenčín',
    'email ubytovanie Trenčín',
  ],
});

/**
 * SEO metadata for about page
 */
export const aboutMetadata = generateSEOMetadata({
  title: 'O nás – Apartmány Vita Trenčín',
  description: 'Spoznajte príbeh Apartmánov Vita Trenčín. Pohodlie, štýl a domáca atmosféra v srdci mesta.',
  path: '/about',
  keywords: [
    'o nás apartmány Vita',
    'príbeh apartmány Trenčín',
    'ubytovanie Vita Trenčín',
  ],
});

/**
 * Apartment-specific SEO metadata
 */
export const apartmentMetadata = {
  'lite-apartman': generateSEOMetadata({
    title: 'Apartmán Vita Lite Trenčín – pohodlné a cenovo dostupné ubytovanie',
    description: 'Apartmán Vita Lite Trenčín je ideálny pre páry a krátkodobé pobyty. Moderné, čisté a v blízkosti centra mesta.',
    path: '/apartments/lite-apartman',
    keywords: [
      'Apartmán Vita Lite Trenčín',
      'lacné ubytovanie Trenčín',
      'apartmán pre dvoch Trenčín',
      'Apartman Vita Lite Trencin',
    ],
  }),
  'design-apartman': generateSEOMetadata({
    title: 'Apartmán Vita Design Trenčín – štýlové ubytovanie v centre mesta',
    description: 'Štýlový apartmán Vita Design Trenčín kombinuje moderný dizajn s pohodlím. Perfektný pre páry aj pracovné pobyty.',
    path: '/apartments/design-apartman',
    keywords: [
      'Apartmán Vita Design Trenčín',
      'moderné ubytovanie Trenčín',
      'štýlový apartmán Trenčín',
      'Apartman Vita Design Trencin',
    ],
  }),
  'deluxe-apartman': generateSEOMetadata({
    title: 'Apartmán Vita Deluxe Trenčín – luxusné ubytovanie v Trenčíne',
    description: 'Najkomfortnejší apartmán Vita v Trenčíne. Priestranný, elegantný a ideálny pre hostí, ktorí hľadajú špičkový zážitok.',
    path: '/apartments/deluxe-apartman',
    keywords: [
      'Apartmán Vita Deluxe Trenčín',
      'luxusné ubytovanie Trenčín',
      'priestranný apartmán Trenčín',
      'Apartman Vita Deluxe Trencin',
    ],
  }),
};
