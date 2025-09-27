import { NextRequest, NextResponse } from 'next/server'

interface RateLimitOptions {
  interval: number // Time window in milliseconds
  uniqueTokenPerInterval: number // Max requests per interval
}

interface RateLimitRecord {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitRecord>()

export function rateLimit(options: RateLimitOptions) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    // Get identifier (IP address)
    const identifier = 
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      request.ip ||
      'anonymous'

    const key = `rate_limit:${identifier}`
    const now = Date.now()
    const resetTime = now + options.interval

    // Clean up expired entries
    cleanupExpiredEntries()

    const record = rateLimitStore.get(key)

    if (!record) {
      // First request from this identifier
      rateLimitStore.set(key, {
        count: 1,
        resetTime
      })
      return null
    }

    if (now > record.resetTime) {
      // Reset window has passed
      rateLimitStore.set(key, {
        count: 1,
        resetTime
      })
      return null
    }

    if (record.count >= options.uniqueTokenPerInterval) {
      // Rate limit exceeded
      const timeUntilReset = Math.ceil((record.resetTime - now) / 1000)
      
      return NextResponse.json(
        {
          error: 'Príliš veľa požiadaviek',
          message: `Skúste to znovu za ${timeUntilReset} sekúnd`,
          retryAfter: timeUntilReset
        },
        {
          status: 429,
          headers: {
            'Retry-After': timeUntilReset.toString(),
            'X-RateLimit-Limit': options.uniqueTokenPerInterval.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(record.resetTime / 1000).toString()
          }
        }
      )
    }

    // Increment counter
    record.count += 1
    rateLimitStore.set(key, record)

    return null
  }
}

function cleanupExpiredEntries() {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// Clean up expired entries every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000)
