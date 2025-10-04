/**
 * Centralized Rate Limiting
 * Protects critical API endpoints from abuse
 */

import { NextRequest } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (for production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limit configurations for different endpoint types
 */
export const RATE_LIMITS = {
  // Authentication endpoints
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 min
    message: 'Príliš veľa pokusov o prihlásenie. Skúste znovu o 15 minút.'
  },
  
  // Booking endpoints
  BOOKING: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 3, // 3 bookings per minute
    message: 'Príliš veľa rezervácií. Počkajte chvíľu a skúste znovu.'
  },
  
  // Payment endpoints
  PAYMENT: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 payment attempts per minute
    message: 'Príliš veľa pokusov o platbu. Počkajte chvíľu.'
  },
  
  // Contact form
  CONTACT: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 messages per minute
    message: 'Príliš veľa správ odoslaných. Počkajte chvíľu.'
  },
  
  // Chat endpoints
  CHAT: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 messages per minute
    message: 'Príliš veľa správ. Spomaľte prosím.'
  },
  
  // General API
  GENERAL: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    message: 'Príliš veľa požiadaviek. Počkajte chvíľu.'
  }
} as const;

/**
 * Get client identifier from request
 */
function getClientId(request: NextRequest): string {
  // Try to get IP from headers (for proxied requests)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    const firstIp = forwarded.split(',')[0];
    return firstIp ? firstIp.trim() : 'unknown';
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Fallback to connection IP (Next.js 13+ doesn't have .ip property)
  return 'unknown';
}

/**
 * Check if request should be rate limited
 * @returns null if allowed, error response if rate limited
 */
export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<{ limited: boolean; remaining: number; resetTime: number; message?: string }> {
  const clientId = getClientId(request);
  const key = `${clientId}:${request.nextUrl.pathname}`;
  const now = Date.now();
  
  // Get or create rate limit entry
  let entry = rateLimitStore.get(key);
  
  // Reset if window expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs
    };
    rateLimitStore.set(key, entry);
  }
  
  // Increment counter
  entry.count++;
  
  // Check if limit exceeded
  const limited = entry.count > config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);
  
  // Cleanup old entries periodically
  if (Math.random() < 0.01) { // 1% chance
    cleanupExpiredEntries();
  }
  
  return {
    limited,
    remaining,
    resetTime: entry.resetTime,
    message: limited ? config.message : undefined
  };
}

/**
 * Create rate limit middleware for specific config
 */
export function createRateLimiter(config: RateLimitConfig) {
  return async (request: NextRequest) => {
    return await checkRateLimit(request, config);
  };
}

/**
 * Cleanup expired rate limit entries
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => rateLimitStore.delete(key));
  
  if (keysToDelete.length > 0) {
    console.log(`🧹 Cleaned up ${keysToDelete.length} expired rate limit entries`);
  }
}

/**
 * Get rate limit stats (for monitoring)
 */
export function getRateLimitStats() {
  return {
    totalEntries: rateLimitStore.size,
    entries: Array.from(rateLimitStore.entries()).map(([key, entry]) => ({
      key,
      count: entry.count,
      resetTime: new Date(entry.resetTime).toISOString()
    }))
  };
}

/**
 * Clear all rate limits (for testing)
 */
export function clearRateLimits(): void {
  rateLimitStore.clear();
}
