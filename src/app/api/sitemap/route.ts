import { NextResponse } from 'next/server'
import { getApartments } from '@/services/apartments'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://apartmanyvita.sk'
  
  // Static pages
  const staticPages = [
    '',
    '/apartments',
    '/contact',
    '/about',
    '/terms',
    '/privacy',
  ]
  
  // Dynamic apartment pages
  const apartments = await getApartments()
  const apartmentPages = apartments.map(apartment => `/apartments/${apartment.slug}`)
  
  // Combine all pages
  const allPages = [...staticPages, ...apartmentPages]
  
  // Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allPages.map(page => {
  const url = `${baseUrl}${page}`
  const lastmod = new Date().toISOString().split('T')[0]
  const priority = page === '' ? '1.0' : page.startsWith('/apartments/') ? '0.8' : '0.6'
  const changefreq = page === '' ? 'daily' : page.startsWith('/apartments/') ? 'weekly' : 'monthly'
  
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <xhtml:link rel="alternate" hreflang="sk" href="${url}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${url}"/>
    <xhtml:link rel="alternate" hreflang="de" href="${url}"/>
    <xhtml:link rel="alternate" hreflang="hu" href="${url}"/>
    <xhtml:link rel="alternate" hreflang="pl" href="${url}"/>
  </url>`
}).join('\n')}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
