import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://apartmanyvita.sk'
  
  const robots = `User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /auth/

# Allow specific API routes that should be indexed
Allow: /api/sitemap
Allow: /api/robots

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay (optional)
Crawl-delay: 1

# Specific rules for search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

# Block bad bots
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /`

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
