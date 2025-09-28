// import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createRateLimit, addSecurityHeaders } from '@/lib/security'

// Temporarily disabled next-intl middleware to fix notFound() error
// const intlMiddleware = createMiddleware({
//   // A list of all locales that are supported
//   locales: ['sk', 'en', 'de', 'hu', 'pl'],
//   
//   // Used when no locale matches
//   defaultLocale: 'sk',
//   
//   // Enable automatic locale detection based on the Accept-Language header
//   localeDetection: true,
//   
//   // Prefix the default locale in the URL
//   localePrefix: 'as-needed'
// })

// Rate limiting configurations
const apiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  message: 'Príliš veľa požiadaviek z tejto IP adresy'
})

const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
  message: 'Príliš veľa pokusov o prihlásenie'
})

const contactRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 contact form submissions per hour
  message: 'Príliš veľa správ odoslaných'
})

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Apply rate limiting
  if (pathname.startsWith('/api/')) {
    if (pathname.includes('/auth/') || pathname.includes('/register')) {
      const rateLimitResponse = await authRateLimit(request)
      if (rateLimitResponse) return rateLimitResponse
    } else if (pathname.includes('/contact') || pathname.includes('/newsletter')) {
      const rateLimitResponse = await contactRateLimit(request)
      if (rateLimitResponse) return rateLimitResponse
    } else {
      const rateLimitResponse = await apiRateLimit(request)
      if (rateLimitResponse) return rateLimitResponse
    }
  }
  
  // Temporarily disabled next-intl middleware
  // const response = intlMiddleware(request)
  const response = NextResponse.next()
  
  // Add security headers
  const secureResponse = addSecurityHeaders(response)
  
  // 🚀 PHASE 2: Edge caching strategy for Beds24 API
  if (pathname.startsWith('/api/beds24/')) {
    // Availability and batch endpoints - cache for 5 minutes
    if (pathname.includes('/availability') || pathname.includes('/batch-availability')) {
      secureResponse.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
      secureResponse.headers.set('CDN-Cache-Control', 'public, s-maxage=300')
      secureResponse.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=300')
      secureResponse.headers.set('X-Cache-Strategy', 'beds24-availability')
    }
    // Property/room info - cache for 1 hour (changes rarely)
    else if (pathname.includes('/properties') || pathname.includes('/rooms')) {
      secureResponse.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200')
      secureResponse.headers.set('CDN-Cache-Control', 'public, s-maxage=3600')
      secureResponse.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=3600')
      secureResponse.headers.set('X-Cache-Strategy', 'beds24-static')
    }
    // Booking endpoints - no cache (dynamic)
    else if (pathname.includes('/booking') || pathname.includes('/webhooks')) {
      secureResponse.headers.set('Cache-Control', 'no-store, must-revalidate')
      secureResponse.headers.set('X-Cache-Strategy', 'beds24-dynamic')
    }
    // Default Beds24 API cache - 2 minutes
    else {
      secureResponse.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=240')
      secureResponse.headers.set('CDN-Cache-Control', 'public, s-maxage=120')
      secureResponse.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=120')
      secureResponse.headers.set('X-Cache-Strategy', 'beds24-default')
    }
  }
  // Other API routes - no cache by default
  else if (pathname.startsWith('/api/')) {
    secureResponse.headers.set('Cache-Control', 'no-store, must-revalidate')
  }
  
  // Static assets - long cache
  if (pathname.startsWith('/_next/static/')) {
    secureResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }
  
  // Add HSTS header in production
  if (process.env.NODE_ENV === 'production') {
    secureResponse.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }
  
  return secureResponse
}

export const config = {
  // Match all paths except static files and API routes
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
