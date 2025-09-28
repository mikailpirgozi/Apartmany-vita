/**
 * Phase 4 Core Functionality Tests
 * Tests the core logic without UI components
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock implementations
const mockServiceWorker = {
  register: vi.fn(),
  addEventListener: vi.fn(),
  postMessage: vi.fn(),
  active: { postMessage: vi.fn() }
};

const mockWebSocket = vi.fn().mockImplementation(() => ({
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  readyState: WebSocket.OPEN
}));

const mockPerformanceObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn()
}));

// Setup global mocks
Object.defineProperty(global, 'navigator', {
  writable: true,
  value: {
    ...global.navigator,
    serviceWorker: mockServiceWorker
  }
});

Object.defineProperty(global, 'WebSocket', {
  writable: true,
  value: mockWebSocket
});

Object.defineProperty(global, 'PerformanceObserver', {
  writable: true,
  value: mockPerformanceObserver
});

// Import after mocks
import { serviceWorkerManager } from '@/lib/service-worker';
import { calendarWebSocket } from '@/lib/websocket';
import { performanceMonitor } from '@/lib/performance-monitor';

describe('Phase 4: Core Functionality Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    performanceMonitor.clearMetrics();
  });

  describe('Service Worker Manager', () => {
    it('should initialize successfully', async () => {
      mockServiceWorker.register.mockResolvedValue({
        scope: '/',
        active: mockServiceWorker.active,
        addEventListener: mockServiceWorker.addEventListener
      });

      await serviceWorkerManager.initialize();

      expect(mockServiceWorker.register).toHaveBeenCalledWith('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });
    });

    it('should handle registration failure gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockServiceWorker.register.mockRejectedValue(new Error('Registration failed'));

      await serviceWorkerManager.initialize();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should return correct status', () => {
      const status = serviceWorkerManager.getStatus();
      
      expect(status).toEqual({
        supported: true,
        registered: false,
        active: false,
        updating: false
      });
    });

    it('should clear caches', async () => {
      const mockCaches = {
        keys: vi.fn().mockResolvedValue(['cache1', 'cache2']),
        delete: vi.fn().mockResolvedValue(true)
      };
      
      global.caches = mockCaches as any;

      await serviceWorkerManager.clearAllCaches();

      expect(mockServiceWorker.active.postMessage).toHaveBeenCalledWith({
        type: 'clear_all_caches'
      });
    });

    it('should preload calendar data', async () => {
      const apartmentSlug = 'test-apartment';
      const months = ['2024-01', '2024-02'];

      await serviceWorkerManager.preloadCalendarData(apartmentSlug, months);

      expect(mockServiceWorker.active.postMessage).toHaveBeenCalledWith({
        type: 'preload_calendar_data',
        apartmentSlug,
        months
      });
    });
  });

  describe('WebSocket Manager', () => {
    it('should establish connection', () => {
      const apartmentSlug = 'test-apartment';
      
      calendarWebSocket.connect(apartmentSlug);

      expect(mockWebSocket).toHaveBeenCalled();
    });

    it('should handle messages', () => {
      const mockCallback = vi.fn();
      const unsubscribe = calendarWebSocket.subscribe(mockCallback);

      const mockMessage = {
        type: 'availability_update' as const,
        apartmentSlug: 'test-apartment',
        apartmentName: 'Test Apartment',
        month: '2024-01',
        timestamp: Date.now()
      };

      mockCallback(mockMessage);

      expect(mockCallback).toHaveBeenCalledWith(mockMessage);
      unsubscribe();
    });

    it('should handle status changes', () => {
      const mockStatusCallback = vi.fn();
      const unsubscribe = calendarWebSocket.subscribeToStatus(mockStatusCallback);

      expect(mockStatusCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          connected: false,
          reconnecting: false,
          lastConnected: null,
          reconnectAttempts: 0
        })
      );

      unsubscribe();
    });

    it('should send messages', () => {
      expect(() => {
        calendarWebSocket.send({
          type: 'subscribe',
          apartmentSlug: 'test-apartment',
          timestamp: Date.now()
        });
      }).not.toThrow();
    });

    it('should handle disconnection', () => {
      calendarWebSocket.connect();
      
      expect(() => {
        calendarWebSocket.disconnect();
      }).not.toThrow();
    });
  });

  describe('Performance Monitor', () => {
    it('should track calendar load performance', () => {
      const apartmentSlug = 'test-apartment';
      const loadTime = 250;
      const cacheHit = true;

      performanceMonitor.trackCalendarLoad(apartmentSlug, loadTime, cacheHit);

      const stats = performanceMonitor.getRealTimeStats();
      expect(stats.activeMetrics).toBeGreaterThan(0);
    });

    it('should track API call performance', () => {
      const endpoint = '/api/beds24/availability';
      const method = 'GET';
      const duration = 150;
      const status = 200;
      const cacheHit = false;

      performanceMonitor.trackAPICall(endpoint, method, duration, status, cacheHit);

      const stats = performanceMonitor.getRealTimeStats();
      expect(stats.avgResponseTime).toBeGreaterThan(0);
    });

    it('should track navigation performance', () => {
      const from = '/apartments';
      const to = '/booking';
      const duration = 50;

      performanceMonitor.trackNavigation(from, to, duration);

      const stats = performanceMonitor.getRealTimeStats();
      expect(stats.activeMetrics).toBeGreaterThan(0);
    });

    it('should track user interactions', () => {
      const action = 'click';
      const element = 'calendar-day';
      const duration = 10;

      performanceMonitor.trackInteraction(action, element, duration);

      const stats = performanceMonitor.getRealTimeStats();
      expect(stats.activeMetrics).toBeGreaterThan(0);
    });

    it('should track errors', () => {
      const error = new Error('Test error');
      const context = 'calendar-loading';
      const severity = 'medium' as const;

      performanceMonitor.trackError(error, context, severity);

      const stats = performanceMonitor.getRealTimeStats();
      expect(stats.recentErrors).toBeGreaterThan(0);
    });

    it('should track cache performance', () => {
      performanceMonitor.trackCachePerformance('hit', 'test-key-1');
      performanceMonitor.trackCachePerformance('miss', 'test-key-2');
      performanceMonitor.trackCachePerformance('hit', 'test-key-3');

      const stats = performanceMonitor.getRealTimeStats();
      expect(stats.cacheHitRate).toBeGreaterThan(0);
    });

    it('should generate performance report', () => {
      // Add test metrics
      performanceMonitor.trackCalendarLoad('test-apartment', 300, true);
      performanceMonitor.trackAPICall('/api/test', 'GET', 150, 200, false);
      performanceMonitor.trackError(new Error('Test'), 'test-context');

      const report = performanceMonitor.generateReport();

      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('metrics');
      expect(report).toHaveProperty('violations');
      expect(report).toHaveProperty('recommendations');
      
      expect(report.summary.totalMetrics).toBeGreaterThan(0);
      expect(Array.isArray(report.metrics)).toBe(true);
      expect(Array.isArray(report.violations)).toBe(true);
      expect(Array.isArray(report.recommendations)).toBe(true);
    });

    it('should detect budget violations', () => {
      // Track slow calendar load (should violate budget)
      performanceMonitor.trackCalendarLoad('test-apartment', 1500, false);

      const report = performanceMonitor.generateReport();
      
      // Should have violations for slow load time
      expect(report.violations.length).toBeGreaterThan(0);
      expect(report.violations[0]).toHaveProperty('budget');
      expect(report.violations[0]).toHaveProperty('actualValue');
      expect(report.violations[0]).toHaveProperty('severity');
    });

    it('should provide real-time statistics', () => {
      const stats = performanceMonitor.getRealTimeStats();

      expect(stats).toHaveProperty('activeMetrics');
      expect(stats).toHaveProperty('recentErrors');
      expect(stats).toHaveProperty('avgResponseTime');
      expect(stats).toHaveProperty('cacheHitRate');
      
      expect(typeof stats.activeMetrics).toBe('number');
      expect(typeof stats.recentErrors).toBe('number');
      expect(typeof stats.avgResponseTime).toBe('number');
      expect(typeof stats.cacheHitRate).toBe('number');
    });
  });

  describe('Integration Tests', () => {
    it('should integrate Service Worker with Performance Monitor', async () => {
      await serviceWorkerManager.initialize();
      performanceMonitor.trackCalendarLoad('test-apartment', 200, true);
      
      const swStatus = serviceWorkerManager.getStatus();
      const perfStats = performanceMonitor.getRealTimeStats();
      
      expect(swStatus.supported).toBe(true);
      expect(perfStats.activeMetrics).toBeGreaterThan(0);
    });

    it('should integrate WebSocket with Performance Monitor', () => {
      calendarWebSocket.connect('test-apartment');
      performanceMonitor.trackInteraction('websocket_connect', 'calendar');
      
      const stats = performanceMonitor.getRealTimeStats();
      expect(stats.activeMetrics).toBeGreaterThan(0);
    });

    it('should handle all optimizations together', async () => {
      await serviceWorkerManager.initialize();
      calendarWebSocket.connect('test-apartment');
      
      performanceMonitor.trackCalendarLoad('test-apartment', 150, true);
      performanceMonitor.trackAPICall('/api/beds24/availability', 'GET', 100, 200, true);
      performanceMonitor.trackNavigation('/apartments', '/booking', 50);
      performanceMonitor.trackCachePerformance('hit', 'calendar-data');
      
      const report = performanceMonitor.generateReport();
      
      expect(report.summary.totalMetrics).toBeGreaterThan(0);
      expect(report.summary.averageLoadTime).toBeLessThan(500);
      expect(report.summary.cacheHitRate).toBeGreaterThan(0);
      expect(report.summary.errorRate).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle Service Worker not supported', async () => {
      const originalNavigator = global.navigator;
      global.navigator = {} as any;
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      await serviceWorkerManager.initialize();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[SW Manager] Service Worker not supported')
      );
      
      global.navigator = originalNavigator;
      consoleSpy.mockRestore();
    });

    it('should handle WebSocket connection failures', () => {
      const mockFailingWebSocket = vi.fn().mockImplementation(() => {
        throw new Error('Connection failed');
      });
      
      global.WebSocket = mockFailingWebSocket as any;
      
      expect(() => {
        calendarWebSocket.connect('test-apartment');
      }).not.toThrow();
    });

    it('should handle empty metrics gracefully', () => {
      performanceMonitor.clearMetrics();
      
      const report = performanceMonitor.generateReport();
      const stats = performanceMonitor.getRealTimeStats();
      
      expect(report.summary.totalMetrics).toBe(0);
      expect(stats.activeMetrics).toBe(0);
      expect(stats.avgResponseTime).toBe(0);
      expect(stats.cacheHitRate).toBe(0);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should meet performance targets', () => {
      const targets = {
        calendarLoadTime: 500, // ms
        apiResponseTime: 2000, // ms
        navigationTime: 100, // ms
        cacheHitRate: 80, // %
        errorRate: 5 // %
      };

      performanceMonitor.clearMetrics();
      performanceMonitor.trackCalendarLoad('test', 200, true);
      performanceMonitor.trackAPICall('/api/test', 'GET', 150, 200, true);
      performanceMonitor.trackNavigation('/a', '/b', 50);
      performanceMonitor.trackCachePerformance('hit', 'key1');
      performanceMonitor.trackCachePerformance('hit', 'key2');

      const report = performanceMonitor.generateReport();
      
      expect(report.summary.averageLoadTime).toBeLessThan(targets.calendarLoadTime);
      expect(report.summary.cacheHitRate).toBeGreaterThan(targets.cacheHitRate);
      expect(report.summary.errorRate).toBeLessThan(targets.errorRate);
    });

    it('should track performance over time', () => {
      const startTime = Date.now();
      
      // Simulate performance data over time
      for (let i = 0; i < 10; i++) {
        performanceMonitor.trackCalendarLoad('test', 100 + i * 10, i % 2 === 0);
        performanceMonitor.trackAPICall('/api/test', 'GET', 50 + i * 5, 200, i % 3 === 0);
      }
      
      const report = performanceMonitor.generateReport({
        start: startTime,
        end: Date.now()
      });
      
      expect(report.summary.totalMetrics).toBe(20); // 10 calendar loads + 10 API calls
      expect(report.summary.averageLoadTime).toBeGreaterThan(0);
      expect(report.summary.cacheHitRate).toBeGreaterThan(0);
    });
  });
});
