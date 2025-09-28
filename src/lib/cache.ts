import Redis from 'ioredis';
import { AvailabilityData } from '@/types';

/**
 * Redis cache configuration
 */
const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
};

/**
 * Cache TTL configurations (in seconds)
 */
export const CACHE_TTL = {
  AVAILABILITY: 300,        // 5 minutes for availability data
  APARTMENT_INFO: 1800,     // 30 minutes for apartment info
  PRICING: 600,            // 10 minutes for pricing data
  BOOKING_RULES: 3600,     // 1 hour for booking rules
  ANALYTICS: 900,          // 15 minutes for analytics
} as const;

/**
 * Cache key prefixes
 */
export const CACHE_KEYS = {
  AVAILABILITY: 'availability',
  APARTMENT: 'apartment',
  PRICING: 'pricing',
  BOOKING_RULES: 'booking_rules',
  ANALYTICS: 'analytics',
  METRICS: 'metrics',
} as const;

/**
 * Redis-based availability cache with fallback strategies
 */
class AvailabilityCache {
  private redis: Redis | null = null;
  private memoryCache = new Map<string, { data: unknown; expires: number }>();
  private connectionAttempts = 0;
  private maxConnectionAttempts = 3;
  private isConnecting = false;

  constructor() {
    // Lazy initialization - only connect when needed
    // this.initializeRedis();
  }

  /**
   * Initialize Redis connection with error handling
   */
  private async initializeRedis(): Promise<void> {
    if (this.isConnecting || this.connectionAttempts >= this.maxConnectionAttempts) {
      return;
    }

    this.isConnecting = true;

    try {
      this.redis = new Redis(REDIS_CONFIG);

      this.redis.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.connectionAttempts = 0;
      });

      this.redis.on('error', (error) => {
        console.error('❌ Redis connection error:', error.message);
        this.handleRedisError();
      });

      this.redis.on('close', () => {
        console.warn('⚠️ Redis connection closed');
        this.redis = null;
      });

      // Test connection
      await this.redis.ping();
      
    } catch (error) {
      console.error('❌ Failed to initialize Redis:', error);
      this.handleRedisError();
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Handle Redis connection errors with exponential backoff
   */
  private handleRedisError(): void {
    this.redis = null;
    this.connectionAttempts++;

    if (this.connectionAttempts < this.maxConnectionAttempts) {
      const delay = Math.min(1000 * Math.pow(2, this.connectionAttempts), 30000);
      console.log(`🔄 Retrying Redis connection in ${delay}ms (attempt ${this.connectionAttempts})`);
      
      setTimeout(() => {
        this.initializeRedis();
      }, delay);
    } else {
      console.warn('⚠️ Max Redis connection attempts reached. Using memory cache fallback.');
    }
  }

  /**
   * Get availability data from cache (Redis first, memory fallback)
   */
  async getAvailability(key: string): Promise<AvailabilityData | null> {
    const fullKey = `${CACHE_KEYS.AVAILABILITY}:${key}`;

    try {
      // Initialize Redis if not connected and not in build mode
      if (!this.redis && !process.env.NEXT_PHASE && process.env.NODE_ENV !== 'production') {
        await this.initializeRedis();
      }

      // Try Redis first
      if (this.redis) {
        const cached = await this.redis.get(fullKey);
        if (cached) {
          const data = JSON.parse(cached);
          console.log(`📦 Redis cache HIT for key: ${key}`);
          return data;
        }
      }

      // Fallback to memory cache
      const memoryEntry = this.memoryCache.get(fullKey);
      if (memoryEntry && memoryEntry.expires > Date.now()) {
        console.log(`🧠 Memory cache HIT for key: ${key}`);
        return memoryEntry.data;
      }

      console.log(`❌ Cache MISS for key: ${key}`);
      return null;

    } catch (error) {
      console.error('❌ Cache get error:', error);
      return null;
    }
  }

  /**
   * Set availability data in cache (Redis + memory backup)
   */
  async setAvailability(key: string, data: AvailabilityData, ttl = CACHE_TTL.AVAILABILITY): Promise<void> {
    const fullKey = `${CACHE_KEYS.AVAILABILITY}:${key}`;

    try {
      // Initialize Redis if not connected and not in build mode
      if (!this.redis && !process.env.NEXT_PHASE && process.env.NODE_ENV !== 'production') {
        await this.initializeRedis();
      }

      // Store in Redis if available
      if (this.redis) {
        await this.redis.setex(fullKey, ttl, JSON.stringify(data));
        console.log(`✅ Redis cache SET for key: ${key} (TTL: ${ttl}s)`);
      }

      // Always store in memory as backup
      this.memoryCache.set(fullKey, {
        data,
        expires: Date.now() + (ttl * 1000)
      });

      // Cleanup old memory cache entries
      this.cleanupMemoryCache();

    } catch (error) {
      console.error('❌ Cache set error:', error);
      
      // Ensure memory cache is set even if Redis fails
      this.memoryCache.set(fullKey, {
        data,
        expires: Date.now() + (ttl * 1000)
      });
    }
  }

  /**
   * Invalidate cache entries matching pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    const fullPattern = `${CACHE_KEYS.AVAILABILITY}:${pattern}`;

    try {
      // Initialize Redis if not connected and not in build mode
      if (!this.redis && !process.env.NEXT_PHASE && process.env.NODE_ENV !== 'production') {
        await this.initializeRedis();
      }

      // Invalidate Redis cache
      if (this.redis) {
        const keys = await this.redis.keys(fullPattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
          console.log(`🗑️ Invalidated ${keys.length} Redis cache entries matching: ${pattern}`);
        }
      }

      // Invalidate memory cache
      const memoryKeys = Array.from(this.memoryCache.keys())
        .filter(key => key.includes(pattern));
      
      memoryKeys.forEach(key => this.memoryCache.delete(key));
      
      if (memoryKeys.length > 0) {
        console.log(`🗑️ Invalidated ${memoryKeys.length} memory cache entries matching: ${pattern}`);
      }

    } catch (error) {
      console.error('❌ Cache invalidation error:', error);
    }
  }

  /**
   * Invalidate specific cache key
   */
  async invalidateKey(key: string): Promise<void> {
    const fullKey = `${CACHE_KEYS.AVAILABILITY}:${key}`;

    try {
      // Remove from Redis
      if (this.redis) {
        await this.redis.del(fullKey);
        console.log(`🗑️ Invalidated Redis cache key: ${key}`);
      }

      // Remove from memory cache
      this.memoryCache.delete(fullKey);

    } catch (error) {
      console.error('❌ Cache key invalidation error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    redis: { connected: boolean; keys?: number };
    memory: { keys: number; size: string };
  }> {
    const stats = {
      redis: { connected: false as boolean, keys: undefined as number | undefined },
      memory: { 
        keys: this.memoryCache.size,
        size: `${Math.round(JSON.stringify(Array.from(this.memoryCache.entries())).length / 1024)}KB`
      }
    };

    try {
      if (this.redis) {
        await this.redis.ping();
        stats.redis.connected = true;
        
        const keys = await this.redis.keys(`${CACHE_KEYS.AVAILABILITY}:*`);
        stats.redis.keys = keys.length;
      }
    } catch (error) {
      console.error('❌ Error getting Redis stats:', error);
    }

    return stats;
  }

  /**
   * Cleanup expired memory cache entries
   */
  private cleanupMemoryCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.expires <= now) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.memoryCache.delete(key));

    if (expiredKeys.length > 0) {
      console.log(`🧹 Cleaned up ${expiredKeys.length} expired memory cache entries`);
    }
  }

  /**
   * Clear all cache (Redis + memory)
   */
  async clearAll(): Promise<void> {
    try {
      // Initialize Redis if not connected and not in build mode
      if (!this.redis && !process.env.NEXT_PHASE && process.env.NODE_ENV !== 'production') {
        await this.initializeRedis();
      }

      // Clear Redis
      if (this.redis) {
        const keys = await this.redis.keys(`${CACHE_KEYS.AVAILABILITY}:*`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
          console.log(`🗑️ Cleared ${keys.length} Redis cache entries`);
        }
      }

      // Clear memory cache
      const memorySize = this.memoryCache.size;
      this.memoryCache.clear();
      console.log(`🗑️ Cleared ${memorySize} memory cache entries`);

    } catch (error) {
      console.error('❌ Error clearing cache:', error);
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
      console.log('👋 Redis connection closed');
    }
  }
}

// Export singleton instance
export const availabilityCache = new AvailabilityCache();

// Export cache utilities
export const cacheUtils = {
  /**
   * Generate cache key for availability data
   */
  getAvailabilityKey: (apartmentSlug: string, month: string, guests: number): string => {
    return `${apartmentSlug}:${month}:${guests}`;
  },

  /**
   * Generate cache key for apartment pricing
   */
  getPricingKey: (apartmentSlug: string, checkIn: string, checkOut: string, guests: number): string => {
    return `${CACHE_KEYS.PRICING}:${apartmentSlug}:${checkIn}:${checkOut}:${guests}`;
  },

  /**
   * Generate cache key for apartment info
   */
  getApartmentKey: (apartmentSlug: string): string => {
    return `${CACHE_KEYS.APARTMENT}:${apartmentSlug}`;
  },

  /**
   * Generate invalidation pattern for apartment
   */
  getInvalidationPattern: (apartmentSlug: string): string => {
    return `${apartmentSlug}:*`;
  }
};
