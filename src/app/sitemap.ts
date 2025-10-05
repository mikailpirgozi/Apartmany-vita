import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.apartmanvita.sk';
  
  // Static pages
  const staticPages = [
    '',
    '/apartments',
    '/booking',
    '/contact',
    '/about',
    '/auth/signin',
    '/auth/signup',
    '/terms-of-service',
    '/privacy-policy',
  ];

  // Apartment slugs
  const apartmentSlugs = [
    'design-apartman',
    'lite-apartman',
    'deluxe-apartman',
  ];

  // Generate sitemap entries
  const staticEntries = staticPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: page === '' ? 1.0 : 0.8,
  }));

  const apartmentEntries = apartmentSlugs.map((slug) => ({
    url: `${baseUrl}/apartments/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...staticEntries, ...apartmentEntries];
}
