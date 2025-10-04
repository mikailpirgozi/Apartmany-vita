import { NextRequest, NextResponse } from 'next/server'

// Rate limiting store (in production use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string
  skipSuccessfulRequests?: boolean
}

export function createRateLimit(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const ip = getClientIP(request)
    const key = `rate_limit:${ip}`
    const now = Date.now()
    
    // Clean up expired entries
    cleanupExpiredEntries(now)
    
    const record = rateLimitStore.get(key)
    
    if (!record || now > record.resetTime) {
      // First request or window expired
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return null
    }
    
    if (record.count >= config.maxRequests) {
      // Rate limit exceeded
      return NextResponse.json(
        { error: config.message || 'Too many requests' },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': record.resetTime.toString()
          }
        }
      )
    }
    
    // Increment counter
    record.count++
    rateLimitStore.set(key, record)
    
    return null
  }
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    const firstIp = forwarded.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

function cleanupExpiredEntries(now: number) {
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// Security headers
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent XSS attacks
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Referrer policy
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  
  // Remove powered by header
  response.headers.delete('X-Powered-By')
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.stripe.com *.google.com *.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
    "img-src 'self' data: https: *.cloudinary.com *.unsplash.com *.google.com",
    "font-src 'self' fonts.gstatic.com",
    "connect-src 'self' *.stripe.com api.openai.com *.google.com",
    "frame-src 'self' *.stripe.com *.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)
  
  // Strict Transport Security (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }
  
  return response
}

// Input validation and sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{8,15}$/
  return phoneRegex.test(phone)
}

export function validateDate(dateString: string): boolean {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

// CSRF protection
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken && token.length === 26
}

// SQL injection prevention helpers
export function escapeSQL(input: string): string {
  return input.replace(/'/g, "''").replace(/;/g, '\\;')
}

// XSS prevention
export function escapeHTML(input: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }
  
  return input.replace(/[&<>"'/]/g, (s) => map[s] || s)
}

// Password strength validation
export function validatePasswordStrength(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Heslo musí mať aspoň 8 znakov')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Heslo musí obsahovať malé písmeno')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Heslo musí obsahovať veľké písmeno')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Heslo musí obsahovať číslo')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Heslo musí obsahovať špeciálny znak')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// API key validation
export function validateAPIKey(key: string, expectedKey: string): boolean {
  if (!key || !expectedKey) return false
  
  // Constant-time comparison to prevent timing attacks
  let result = 0
  const keyLength = key.length
  const expectedLength = expectedKey.length
  
  // XOR the lengths to ensure they're the same
  result |= keyLength ^ expectedLength
  
  // Compare each character
  for (let i = 0; i < Math.max(keyLength, expectedLength); i++) {
    result |= (key.charCodeAt(i) || 0) ^ (expectedKey.charCodeAt(i) || 0)
  }
  
  return result === 0
}
