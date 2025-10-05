import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/account/',
        '/auth/',
        '/privacy-policy',
        '/terms-of-service',
      ],
    },
    sitemap: 'https://www.apartmanvita.sk/sitemap.xml',
  };
}
