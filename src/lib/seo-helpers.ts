/**
 * SEO Helpers
 * Utilities for generating Next.js Metadata objects from SEO service
 */

import type { Metadata } from "next";
import type { SeoData, ApartmentSeoData } from "@/services/seo";

/**
 * Convert SeoData to Next.js Metadata object
 */
export function seoDataToMetadata(seo: SeoData): Metadata {
  // Generate hreflang alternates for multi-language support
  const languages = seo.alternateUrls || {
    sk: seo.canonicalUrl,
    en: seo.canonicalUrl.replace('/sk/', '/en/'),
    de: seo.canonicalUrl.replace('/sk/', '/de/'),
    hu: seo.canonicalUrl.replace('/sk/', '/hu/'),
    pl: seo.canonicalUrl.replace('/sk/', '/pl/'),
  };

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    keywords: seo.metaKeywords,
    authors: [{ name: 'Apartmány Vita' }],
    creator: 'Apartmány Vita',
    publisher: 'Apartmány Vita',
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
    },
    openGraph: {
      title: seo.ogTitle,
      description: seo.ogDescription,
      images: [
        {
          url: seo.ogImage,
          width: 1200,
          height: 630,
          alt: seo.ogTitle,
        },
      ],
      type: seo.ogType as "website" | "article",
      url: seo.canonicalUrl,
    },
    twitter: {
      card: seo.twitterCard as "summary" | "summary_large_image",
      title: seo.twitterTitle,
      description: seo.twitterDescription,
      images: [seo.twitterImage],
    },
    alternates: {
      canonical: seo.canonicalUrl,
      languages,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

/**
 * Convert ApartmentSeoData to Next.js Metadata with JSON-LD
 */
export function apartmentSeoToMetadata(seo: ApartmentSeoData): Metadata {
  const baseMetadata = seoDataToMetadata(seo);

  // Add JSON-LD structured data
  const jsonLd = seo.jsonLd
    ? {
        other: {
          "application/ld+json": JSON.stringify(seo.jsonLd),
        },
      }
    : {};

  return {
    ...baseMetadata,
    ...jsonLd,
  };
}

/**
 * Generate breadcrumb JSON-LD
 */
export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate organization JSON-LD
 */
export function generateOrganizationJsonLd(
  baseUrl: string
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: "Apartmány Vita",
    description: "Moderné apartmány v centre Lučenca",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Štúrova 1",
      addressLocality: "Trenčín",
      postalCode: "984 01",
      addressCountry: "SK",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "48.3314",
      longitude: "19.6649",
    },
    telephone: "+421940728676",
    priceRange: "€€",
    amenityFeature: [
      {
        "@type": "LocationFeatureSpecification",
        name: "Free WiFi",
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "Free Parking",
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "Kitchen",
      },
    ],
  };
}

/**
 * Validate and truncate meta title
 */
export function validateMetaTitle(title: string, maxLength: number = 60): string {
  if (title.length <= maxLength) return title;
  return title.slice(0, maxLength - 3) + "...";
}

/**
 * Validate and truncate meta description
 */
export function validateMetaDescription(
  description: string,
  maxLength: number = 160
): string {
  if (description.length <= maxLength) return description;
  return description.slice(0, maxLength - 3) + "...";
}

