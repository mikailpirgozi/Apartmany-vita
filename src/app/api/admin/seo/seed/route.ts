/**
 * SEO Seed API Endpoint
 * Seeds initial SEO metadata for main pages
 * POST /api/admin/seo/seed
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/admin';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.apartmanvita.sk';

const seoData = [
  // Homepage - Slovak
  {
    pageSlug: 'home',
    locale: 'sk',
    metaTitle: 'Apartmány Vita - Luxusné ubytovanie v Lučenci',
    metaDescription: 'Moderné apartmány v centre Lučenca. WiFi, parkovanie, plne vybavené kuchyne. Rezervujte si svoj pobyt online.',
    metaKeywords: ['apartmány lučenec', 'ubytovanie lučenec', 'apartmány vita', 'prenájom lučenec', 'centrum lučenec'],
    ogType: 'website',
    ogTitle: 'Apartmány Vita - Luxusné ubytovanie v Lučenci',
    ogDescription: 'Moderné apartmány v centre Lučenca. WiFi, parkovanie, plne vybavené kuchyne. Rezervujte si svoj pobyt online.',
    ogImage: `${BASE_URL}/og-default.jpg`,
    twitterCard: 'summary_large_image',
    twitterTitle: 'Apartmány Vita - Luxusné ubytovanie v Lučenci',
    twitterDescription: 'Moderné apartmány v centre Lučenca. WiFi, parkovanie, plne vybavené kuchyne.',
    twitterImage: `${BASE_URL}/og-default.jpg`,
    canonicalUrl: `${BASE_URL}/sk`,
    h1Heading: 'Luxusné apartmány v srdci Lučenca',
    alternateUrls: {
      sk: `${BASE_URL}/sk`,
      en: `${BASE_URL}/en`,
      de: `${BASE_URL}/de`,
      hu: `${BASE_URL}/hu`,
      pl: `${BASE_URL}/pl`,
    },
  },

  // Apartments List - Slovak
  {
    pageSlug: 'apartments',
    locale: 'sk',
    metaTitle: 'Naše apartmány - Apartmány Vita Lučenec',
    metaDescription: 'Vyberte si z našich moderných apartmánov. Deluxe, Lite a Design varianty s plným vybavením. Od 75€ za noc.',
    metaKeywords: ['apartmány', 'ubytovanie', 'lučenec', 'prenájom', 'deluxe', 'design', 'lite'],
    ogType: 'website',
    ogTitle: 'Naše apartmány - Apartmány Vita Lučenec',
    ogDescription: 'Vyberte si z našich moderných apartmánov. Deluxe, Lite a Design varianty s plným vybavením.',
    ogImage: `${BASE_URL}/og-default.jpg`,
    twitterCard: 'summary_large_image',
    twitterTitle: 'Naše apartmány - Apartmány Vita',
    twitterDescription: 'Moderné apartmány s plným vybavením v centre Lučenca.',
    twitterImage: `${BASE_URL}/og-default.jpg`,
    canonicalUrl: `${BASE_URL}/sk/apartments`,
    h1Heading: 'Naše apartmány',
    alternateUrls: {
      sk: `${BASE_URL}/sk/apartments`,
      en: `${BASE_URL}/en/apartments`,
      de: `${BASE_URL}/de/apartments`,
      hu: `${BASE_URL}/hu/apartments`,
      pl: `${BASE_URL}/pl/apartments`,
    },
  },

  // Contact - Slovak
  {
    pageSlug: 'contact',
    locale: 'sk',
    metaTitle: 'Kontakt - Apartmány Vita',
    metaDescription: 'Kontaktujte nás pre rezervácie a otázky. Sme tu pre vás 24/7. Telefón: +421-948-123-456, Email: info@apartmanyvita.sk',
    metaKeywords: ['kontakt', 'apartmány vita', 'lučenec', 'rezervácia', 'telefón', 'email'],
    ogType: 'website',
    ogTitle: 'Kontakt - Apartmány Vita',
    ogDescription: 'Kontaktujte nás pre rezervácie a otázky. Sme tu pre vás 24/7.',
    ogImage: `${BASE_URL}/og-default.jpg`,
    twitterCard: 'summary_large_image',
    twitterTitle: 'Kontakt - Apartmány Vita',
    twitterDescription: 'Kontaktujte nás pre rezervácie a otázky.',
    twitterImage: `${BASE_URL}/og-default.jpg`,
    canonicalUrl: `${BASE_URL}/sk/contact`,
    h1Heading: 'Kontaktujte nás',
    alternateUrls: {
      sk: `${BASE_URL}/sk/contact`,
      en: `${BASE_URL}/en/contact`,
      de: `${BASE_URL}/de/contact`,
      hu: `${BASE_URL}/hu/contact`,
      pl: `${BASE_URL}/pl/contact`,
    },
  },

  // About - Slovak
  {
    pageSlug: 'about',
    locale: 'sk',
    metaTitle: 'O nás - Apartmány Vita',
    metaDescription: 'Spoznajte Apartmány Vita - váš domov v Lučenci. Moderné ubytovanie s osobným prístupom a výnimočnými službami.',
    metaKeywords: ['o nás', 'apartmány vita', 'lučenec', 'história', 'služby'],
    ogType: 'website',
    ogTitle: 'O nás - Apartmány Vita',
    ogDescription: 'Spoznajte Apartmány Vita - váš domov v Lučenci. Moderné ubytovanie s osobným prístupom.',
    ogImage: `${BASE_URL}/og-default.jpg`,
    twitterCard: 'summary_large_image',
    twitterTitle: 'O nás - Apartmány Vita',
    twitterDescription: 'Spoznajte Apartmány Vita - váš domov v Lučenci.',
    twitterImage: `${BASE_URL}/og-default.jpg`,
    canonicalUrl: `${BASE_URL}/sk/about`,
    h1Heading: 'O nás',
    alternateUrls: {
      sk: `${BASE_URL}/sk/about`,
      en: `${BASE_URL}/en/about`,
      de: `${BASE_URL}/de/about`,
      hu: `${BASE_URL}/hu/about`,
      pl: `${BASE_URL}/pl/about`,
    },
  },

  // Booking - Slovak
  {
    pageSlug: 'booking',
    locale: 'sk',
    metaTitle: 'Rezervácia - Apartmány Vita',
    metaDescription: 'Rezervujte si svoj apartmán online. Jednoduché a rýchle. Registrovaní zákazníci získajú 5% zľavu.',
    metaKeywords: ['rezervácia', 'booking', 'apartmány vita', 'online rezervácia', 'zľava'],
    ogType: 'website',
    ogTitle: 'Rezervácia - Apartmány Vita',
    ogDescription: 'Rezervujte si svoj apartmán online. Jednoduché a rýchle.',
    ogImage: `${BASE_URL}/og-default.jpg`,
    twitterCard: 'summary_large_image',
    twitterTitle: 'Rezervácia - Apartmány Vita',
    twitterDescription: 'Rezervujte si svoj apartmán online.',
    twitterImage: `${BASE_URL}/og-default.jpg`,
    canonicalUrl: `${BASE_URL}/sk/booking`,
    h1Heading: 'Rezervácia apartmánu',
    alternateUrls: {
      sk: `${BASE_URL}/sk/booking`,
      en: `${BASE_URL}/en/booking`,
      de: `${BASE_URL}/de/booking`,
      hu: `${BASE_URL}/hu/booking`,
      pl: `${BASE_URL}/pl/booking`,
    },
  },
];

export async function POST(request: Request) {
  try {
    // Check admin authentication
    const adminCheck = await isAdmin(request);
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const results = [];
    
    for (const seo of seoData) {
      const result = await prisma.seoMetadata.upsert({
        where: {
          pageSlug_locale: {
            pageSlug: seo.pageSlug,
            locale: seo.locale,
          },
        },
        update: seo,
        create: seo,
      });
      
      results.push({
        pageSlug: result.pageSlug,
        locale: result.locale,
        status: 'created/updated',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'SEO metadata seeded successfully',
      count: results.length,
      results,
    });
  } catch (error) {
    console.error('[SEO Seed] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to seed SEO metadata',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
