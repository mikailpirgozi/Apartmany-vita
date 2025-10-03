/**
 * SEO Service
 * Handles SEO metadata retrieval, generation, and fallbacks
 * Supports multi-language and dynamic apartment SEO
 */

import { prisma } from "@/lib/db";
import type { SeoMetadata, Apartment } from "@prisma/client";

// ==================== TYPES ====================

export interface SeoData {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  canonicalUrl: string;
  alternateUrls?: Record<string, string>;
  jsonLd?: Record<string, unknown>;
  h1Heading: string;
}

export interface ApartmentSeoData extends SeoData {
  apartmentName: string;
  apartmentSlug: string;
}

// ==================== CONSTANTS ====================

const DEFAULT_LOCALE = "sk";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://apartmanvita.sk";

// Default SEO fallbacks per page
const DEFAULT_SEO: Record<string, Partial<SeoData>> = {
  home: {
    metaTitle: "Apartmány Vita - Luxusné ubytovanie v Lučenci",
    metaDescription: "Moderné apartmány v centre Lučenca. WiFi, parkovanie, plne vybavené kuchyne. Rezervujte si svoj pobyt online.",
    metaKeywords: ["apartmány lučenec", "ubytovanie lučenec", "apartmány vita", "prenájom lučenec"],
    h1Heading: "Luxusné apartmány v srdci Lučenca",
    ogType: "website",
  },
  apartments: {
    metaTitle: "Naše apartmány - Apartmány Vita Lučenec",
    metaDescription: "Vyberte si z našich moderných apartmánov. Deluxe, Lite a Design varianty s plným vybavením.",
    metaKeywords: ["apartmány", "ubytovanie", "lučenec", "prenájom"],
    h1Heading: "Naše apartmány",
    ogType: "website",
  },
  contact: {
    metaTitle: "Kontakt - Apartmány Vita",
    metaDescription: "Kontaktujte nás pre rezervácie a otázky. Sme tu pre vás 24/7.",
    metaKeywords: ["kontakt", "apartmány vita", "lučenec"],
    h1Heading: "Kontaktujte nás",
    ogType: "website",
  },
  about: {
    metaTitle: "O nás - Apartmány Vita",
    metaDescription: "Spoznajte Apartmány Vita - váš domov v Lučenci. Moderné ubytovanie s osobným prístupom.",
    metaKeywords: ["o nás", "apartmány vita", "lučenec"],
    h1Heading: "O nás",
    ogType: "website",
  },
};

// ==================== CORE FUNCTIONS ====================

/**
 * Get SEO metadata for a specific page
 * @param pageSlug - Page identifier (e.g., "home", "apartments", "contact")
 * @param locale - Language code (default: "sk")
 * @returns SEO data with fallbacks
 */
export async function getSeoMetadata(
  pageSlug: string,
  locale: string = DEFAULT_LOCALE
): Promise<SeoData> {
  try {
    // Try to fetch from database
    const seoData = await prisma.seoMetadata.findUnique({
      where: {
        pageSlug_locale: {
          pageSlug,
          locale,
        },
      },
    });

    if (seoData) {
      return mapSeoMetadataToSeoData(seoData);
    }

    // Fallback to defaults
    return generateDefaultSeo(pageSlug, locale);
  } catch (error) {
    console.error(`[SEO Service] Error fetching SEO for ${pageSlug}:`, error);
    return generateDefaultSeo(pageSlug, locale);
  }
}

/**
 * Generate SEO metadata for an apartment
 * @param apartmentSlug - Apartment slug
 * @param locale - Language code
 * @returns Apartment-specific SEO data
 */
export async function getApartmentSeo(
  apartmentSlug: string,
  locale: string = DEFAULT_LOCALE
): Promise<ApartmentSeoData | null> {
  try {
    const apartment = await prisma.apartment.findUnique({
      where: { slug: apartmentSlug },
    });

    if (!apartment) {
      return null;
    }

    return generateApartmentSeo(apartment, locale);
  } catch (error) {
    console.error(`[SEO Service] Error fetching apartment SEO for ${apartmentSlug}:`, error);
    return null;
  }
}

/**
 * Generate dynamic SEO for apartment based on its data
 */
function generateApartmentSeo(
  apartment: Apartment,
  locale: string
): ApartmentSeoData {
  const title = apartment.seoTitle || `${apartment.name} - Apartmány Vita Lučenec`;
  const description = apartment.seoDescription || 
    `${apartment.name}: ${apartment.maxGuests} hostí, ${apartment.size}m², ${apartment.floor}. poschodie. ${apartment.description.slice(0, 100)}...`;
  
  const keywords = apartment.seoKeywords.length > 0 
    ? apartment.seoKeywords 
    : [apartment.name, "apartmán lučenec", "prenájom", "ubytovanie"];

  const ogImage = apartment.ogImage || apartment.images[0] || `${BASE_URL}/og-default.jpg`;
  const canonicalUrl = `${BASE_URL}/${locale}/apartments/${apartment.slug}`;

  return {
    apartmentName: apartment.name,
    apartmentSlug: apartment.slug,
    metaTitle: title,
    metaDescription: description,
    metaKeywords: keywords,
    ogTitle: title,
    ogDescription: description,
    ogImage,
    ogType: "place",
    twitterCard: "summary_large_image",
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: ogImage,
    canonicalUrl,
    h1Heading: apartment.name,
    jsonLd: generateApartmentJsonLd(apartment, canonicalUrl),
  };
}

/**
 * Generate Schema.org JSON-LD for apartment
 */
function generateApartmentJsonLd(
  apartment: Apartment,
  url: string
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Accommodation",
    name: apartment.name,
    description: apartment.description,
    url,
    image: apartment.images,
    numberOfRooms: apartment.floor,
    floorSize: {
      "@type": "QuantitativeValue",
      value: apartment.size,
      unitCode: "MTK", // Square meters
    },
    occupancy: {
      "@type": "QuantitativeValue",
      maxValue: apartment.maxGuests,
    },
    amenityFeature: apartment.amenities.map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      name: amenity,
    })),
    offers: {
      "@type": "Offer",
      price: apartment.basePrice.toString(),
      priceCurrency: "EUR",
      availability: apartment.isActive ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };
}

/**
 * Map database SeoMetadata to SeoData
 */
function mapSeoMetadataToSeoData(seo: SeoMetadata): SeoData {
  const canonicalUrl = seo.canonicalUrl || `${BASE_URL}/${seo.locale}/${seo.pageSlug}`;
  
  return {
    metaTitle: seo.metaTitle,
    metaDescription: seo.metaDescription,
    metaKeywords: seo.metaKeywords,
    ogTitle: seo.ogTitle || seo.metaTitle,
    ogDescription: seo.ogDescription || seo.metaDescription,
    ogImage: seo.ogImage || `${BASE_URL}/og-default.jpg`,
    ogType: seo.ogType,
    twitterCard: seo.twitterCard,
    twitterTitle: seo.twitterTitle || seo.metaTitle,
    twitterDescription: seo.twitterDescription || seo.metaDescription,
    twitterImage: seo.twitterImage || seo.ogImage || `${BASE_URL}/og-default.jpg`,
    canonicalUrl,
    alternateUrls: (seo.alternateUrls as Record<string, string>) || undefined,
    jsonLd: (seo.jsonLd as Record<string, unknown>) || undefined,
    h1Heading: seo.h1Heading || seo.metaTitle,
  };
}

/**
 * Generate default SEO when no DB entry exists
 */
function generateDefaultSeo(pageSlug: string, locale: string): SeoData {
  const defaults = DEFAULT_SEO[pageSlug] || DEFAULT_SEO.home;
  const canonicalUrl = `${BASE_URL}/${locale}/${pageSlug}`;

  return {
    metaTitle: defaults.metaTitle || "Apartmány Vita Lučenec",
    metaDescription: defaults.metaDescription || "Moderné apartmány v Lučenci",
    metaKeywords: defaults.metaKeywords || [],
    ogTitle: defaults.metaTitle || "Apartmány Vita Lučenec",
    ogDescription: defaults.metaDescription || "Moderné apartmány v Lučenci",
    ogImage: `${BASE_URL}/og-default.jpg`,
    ogType: defaults.ogType || "website",
    twitterCard: "summary_large_image",
    twitterTitle: defaults.metaTitle || "Apartmány Vita Lučenec",
    twitterDescription: defaults.metaDescription || "Moderné apartmány v Lučenci",
    twitterImage: `${BASE_URL}/og-default.jpg`,
    canonicalUrl,
    h1Heading: defaults.h1Heading || "Apartmány Vita",
  };
}

// ==================== ADMIN FUNCTIONS ====================

/**
 * Create or update SEO metadata for a page
 */
export async function upsertSeoMetadata(
  pageSlug: string,
  locale: string,
  data: Partial<SeoMetadata>
): Promise<SeoMetadata> {
  return await prisma.seoMetadata.upsert({
    where: {
      pageSlug_locale: {
        pageSlug,
        locale,
      },
    },
    update: data,
    create: {
      pageSlug,
      locale,
      ...data,
    } as SeoMetadata,
  });
}

/**
 * Update apartment SEO fields
 */
export async function updateApartmentSeo(
  apartmentId: string,
  data: {
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
    ogImage?: string;
  }
): Promise<Apartment> {
  return await prisma.apartment.update({
    where: { id: apartmentId },
    data,
  });
}

/**
 * Get all SEO metadata entries
 */
export async function getAllSeoMetadata(): Promise<SeoMetadata[]> {
  return await prisma.seoMetadata.findMany({
    orderBy: [{ pageSlug: "asc" }, { locale: "asc" }],
  });
}

/**
 * Delete SEO metadata
 */
export async function deleteSeoMetadata(id: string): Promise<void> {
  await prisma.seoMetadata.delete({
    where: { id },
  });
}

