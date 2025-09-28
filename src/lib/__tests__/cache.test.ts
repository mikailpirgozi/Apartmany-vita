/**
 * Cache Module Tests
 * Tests for Redis caching and cache management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Redis
const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  exists: vi.fn(),
  expire: vi.fn(),
  flushall: vi.fn(),
  ping: vi.fn(),
  quit: vi.fn(),
};

vi.mock('ioredis', () => ({
  default: vi.fn(() => mockRedis),
}));

// Mock cache module
vi.mock('@/lib/cache', () => ({
  cache: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    exists: vi.fn(),
    expire: vi.fn(),
    flush: vi.fn(),
    ping: vi.fn(),
    disconnect: vi.fn(),
  },
  getCachedData: vi.fn(),
  setCachedData: vi.fn(),
  invalidateCache: vi.fn(),
  generateCacheKey: vi.fn(),
}));

import { cache, getCachedData, setCachedData, invalidateCache, generateCacheKey } from '@/lib/cache';

describe('Cache Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Cache Operations', () => {
    it('should get cached data', async () => {
      const mockData = { test: 'data' };
      vi.mocked(cache.get).mockResolvedValue(JSON.stringify(mockData));

      const result = await getCachedData('test-key');
      expect(result).toEqual(mockData);
      expect(cache.get).toHaveBeenCalledWith('test-key');
    });

    it('should return null for non-existent key', async () => {
      vi.mocked(cache.get).mockResolvedValue(null);

      const result = await getCachedData('non-existent-key');
      expect(result).toBeNull();
    });

    it('should set cached data', async () => {
      const testData = { test: 'data' };
      vi.mocked(cache.set).mockResolvedValue('OK');

      await setCachedData('test-key', testData, 3600);
      expect(cache.set).toHaveBeenCalledWith('test-key', JSON.stringify(testData), 'EX', 3600);
    });

    it('should set cached data with default TTL', async () => {
      const testData = { test: 'data' };
      vi.mocked(cache.set).mockResolvedValue('OK');

      await setCachedData('test-key', testData);
      expect(cache.set).toHaveBeenCalledWith('test-key', JSON.stringify(testData), 'EX', 1800);
    });

    it('should delete cached data', async () => {
      vi.mocked(cache.del).mockResolvedValue(1);

      await invalidateCache('test-key');
      expect(cache.del).toHaveBeenCalledWith('test-key');
    });

    it('should check if key exists', async () => {
      vi.mocked(cache.exists).mockResolvedValue(1);

      const result = await cache.exists('test-key');
      expect(result).toBe(1);
      expect(cache.exists).toHaveBeenCalledWith('test-key');
    });

    it('should set expiration', async () => {
      vi.mocked(cache.expire).mockResolvedValue(1);

      await cache.expire('test-key', 3600);
      expect(cache.expire).toHaveBeenCalledWith('test-key', 3600);
    });
  });

  describe('Cache Key Generation', () => {
    it('should generate cache key for apartment data', () => {
      const key = generateCacheKey('apartment', 'test-apartment');
      expect(key).toBe('apartment:test-apartment');
    });

    it('should generate cache key for availability data', () => {
      const key = generateCacheKey('availability', 'test-apartment', '2024-01');
      expect(key).toBe('availability:test-apartment:2024-01');
    });

    it('should generate cache key for booking data', () => {
      const key = generateCacheKey('booking', 'test-apartment', '2024-01-15', '2024-01-20');
      expect(key).toBe('booking:test-apartment:2024-01-15:2024-01-20');
    });

    it('should handle multiple parameters', () => {
      const key = generateCacheKey('search', 'bratislava', '2', '2024-01-15', '2024-01-20');
      expect(key).toBe('search:bratislava:2:2024-01-15:2024-01-20');
    });
  });

  describe('Cache Management', () => {
    it('should flush all cache', async () => {
      vi.mocked(cache.flush).mockResolvedValue('OK');

      await cache.flush();
      expect(cache.flush).toHaveBeenCalled();
    });

    it('should ping cache server', async () => {
      vi.mocked(cache.ping).mockResolvedValue('PONG');

      const result = await cache.ping();
      expect(result).toBe('PONG');
      expect(cache.ping).toHaveBeenCalled();
    });

    it('should disconnect from cache', async () => {
      vi.mocked(cache.disconnect).mockResolvedValue(undefined);

      await cache.disconnect();
      expect(cache.disconnect).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle cache get errors', async () => {
      vi.mocked(cache.get).mockRejectedValue(new Error('Cache error'));

      await expect(getCachedData('test-key')).rejects.toThrow('Cache error');
    });

    it('should handle cache set errors', async () => {
      vi.mocked(cache.set).mockRejectedValue(new Error('Cache error'));

      await expect(setCachedData('test-key', { test: 'data' })).rejects.toThrow('Cache error');
    });

    it('should handle cache delete errors', async () => {
      vi.mocked(cache.del).mockRejectedValue(new Error('Cache error'));

      await expect(invalidateCache('test-key')).rejects.toThrow('Cache error');
    });

    it('should handle invalid JSON in cache', async () => {
      vi.mocked(cache.get).mockResolvedValue('invalid-json');

      const result = await getCachedData('test-key');
      expect(result).toBeNull();
    });

    it('should handle connection errors', async () => {
      vi.mocked(cache.ping).mockRejectedValue(new Error('Connection failed'));

      await expect(cache.ping()).rejects.toThrow('Connection failed');
    });
  });

  describe('Cache Performance', () => {
    it('should handle concurrent cache operations', async () => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(setCachedData(`key-${i}`, { data: i }));
      }

      await Promise.all(promises);
      expect(cache.set).toHaveBeenCalledTimes(10);
    });

    it('should handle large data caching', async () => {
      const largeData = {
        apartments: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `Apartment ${i}`,
          description: 'A'.repeat(1000),
        })),
      };

      vi.mocked(cache.set).mockResolvedValue('OK');

      await setCachedData('large-data', largeData);
      expect(cache.set).toHaveBeenCalledWith('large-data', JSON.stringify(largeData), 'EX', 1800);
    });

    it('should handle cache key generation performance', () => {
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        generateCacheKey('test', `key-${i}`);
      }
      const end = performance.now();

      expect(end - start).toBeLessThan(10); // Should complete in less than 10ms
    });
  });

  describe('Cache Invalidation Patterns', () => {
    it('should invalidate apartment cache when apartment is updated', async () => {
      vi.mocked(cache.del).mockResolvedValue(1);

      await invalidateCache('apartment:test-apartment');
      expect(cache.del).toHaveBeenCalledWith('apartment:test-apartment');
    });

    it('should invalidate related caches', async () => {
      const keys = [
        'apartment:test-apartment',
        'availability:test-apartment:2024-01',
        'availability:test-apartment:2024-02',
      ];

      vi.mocked(cache.del).mockResolvedValue(1);

      for (const key of keys) {
        await invalidateCache(key);
      }

      expect(cache.del).toHaveBeenCalledTimes(3);
    });

    it('should handle pattern-based invalidation', async () => {
      // Mock keys that match pattern
      const mockKeys = [
        'apartment:test-apartment',
        'apartment:test-apartment:details',
        'availability:test-apartment:2024-01',
      ];

      vi.mocked(cache.del).mockResolvedValue(1);

      // Invalidate all keys matching pattern
      for (const key of mockKeys) {
        if (key.startsWith('apartment:test-apartment')) {
          await invalidateCache(key);
        }
      }

      expect(cache.del).toHaveBeenCalledTimes(2); // Only apartment keys
    });
  });

  describe('Cache Statistics', () => {
    it('should track cache hit rate', async () => {
      // Mock cache hits and misses
      vi.mocked(cache.get).mockResolvedValueOnce('{"data":"hit"}');
      vi.mocked(cache.get).mockResolvedValueOnce(null);

      await getCachedData('hit-key');
      await getCachedData('miss-key');

      expect(cache.get).toHaveBeenCalledTimes(2);
    });

    it('should track cache operations', async () => {
      vi.mocked(cache.set).mockResolvedValue('OK');
      vi.mocked(cache.del).mockResolvedValue(1);

      await setCachedData('test-key', { data: 'test' });
      await invalidateCache('test-key');

      expect(cache.set).toHaveBeenCalledTimes(1);
      expect(cache.del).toHaveBeenCalledTimes(1);
    });
  });
});
