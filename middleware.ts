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
  
  // Add additional headers for specific routes
  if (pathname.startsWith('/api/')) {
    secureResponse.headers.set('Cache-Control', 'no-store, must-revalidate')
  }
  
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
