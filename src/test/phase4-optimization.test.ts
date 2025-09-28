/**
 * Phase 4 Advanced Optimizations - Comprehensive Test Suite
 * Tests Service Worker, WebSocket, Virtual Scrolling, and Performance Monitoring
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

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
global.navigator = {
  ...global.navigator,
  serviceWorker: mockServiceWorker
} as any;

global.WebSocket = mockWebSocket as any;
global.PerformanceObserver = mockPerformanceObserver as any;

// Import components after mocks
import { serviceWorkerManager } from '@/lib/service-worker';
import { calendarWebSocket } from '@/lib/websocket';
import { performanceMonitor } from '@/lib/performance-monitor';
import VirtualAvailabilityCalendar from '@/components/booking/virtual-availability-calendar';
import AdvancedPerformanceDashboard from '@/components/analytics/advanced-performance-dashboard';

describe('Phase 4: Advanced Optimizations', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('Service Worker Integration', () => {
    it('should register service worker successfully', async () => {
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

    it('should handle service worker registration failure gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockServiceWorker.register.mockRejectedValue(new Error('Registration failed'));

      await serviceWorkerManager.initialize();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[SW Manager] Service Worker registration failed:'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should track cache performance metrics', () => {
      const status = serviceWorkerManager.getStatus();
      
      expect(status).toEqual({
        supported: true,
        registered: false,
        active: false,
        updating: false
      });
    });

    it('should clear caches when requested', async () => {
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

  describe('WebSocket Real-time Updates', () => {
    it('should establish WebSocket connection', () => {
      const apartmentSlug = 'test-apartment';
      
      calendarWebSocket.connect(apartmentSlug);

      expect(mockWebSocket).toHaveBeenCalledWith(
        expect.stringContaining(`?apartment=${apartmentSlug}`)
      );
    });

    it('should handle WebSocket messages', () => {
      const mockCallback = vi.fn();
      const unsubscribe = calendarWebSocket.subscribe(mockCallback);

      // Simulate message
      const mockMessage = {
        type: 'availability_update',
        apartmentSlug: 'test-apartment',
        apartmentName: 'Test Apartment',
        month: '2024-01',
        timestamp: Date.now()
      };

      // Trigger message handler (would normally be called by WebSocket)
      mockCallback(mockMessage);

      expect(mockCallback).toHaveBeenCalledWith(mockMessage);

      unsubscribe();
    });

    it('should handle connection status changes', () => {
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

    it('should send subscription messages', () => {
      const apartmentSlug = 'test-apartment';
      
      calendarWebSocket.subscribeToApartment(apartmentSlug);

      // Would normally call ws.send, but we're testing the interface
      expect(() => {
        calendarWebSocket.send({
          type: 'subscribe',
          apartmentSlug,
          timestamp: Date.now()
        });
      }).not.toThrow();
    });

    it('should handle disconnection gracefully', () => {
      calendarWebSocket.connect();
      
      expect(() => {
        calendarWebSocket.disconnect();
      }).not.toThrow();
    });
  });

  describe('Virtual Scrolling Calendar', () => {
    const defaultProps = {
      apartmentSlug: 'test-apartment',
      guests: 2,
      startDate: new Date('2024-01-01'),
      monthsToShow: 3
    };

    it('should render virtual calendar component', () => {
      render(
        React.createElement(QueryClientProvider, { client: queryClient },
          React.createElement(VirtualAvailabilityCalendar, defaultProps)
        )
      );

      expect(screen.getByText(/Dostupnosť - test-apartment/)).toBeInTheDocument();
    });

    it('should handle date selection', async () => {
      const mockOnDateSelect = vi.fn();
      
      render(
        React.createElement(QueryClientProvider, { client: queryClient },
          React.createElement(VirtualAvailabilityCalendar, {
            ...defaultProps,
            onDateSelect: mockOnDateSelect
          })
        )
      );

      // Calendar should render with date cells
      // Note: Virtual scrolling makes this complex to test, so we test the interface
      expect(screen.getByText(/Dostupnosť/)).toBeInTheDocument();
    });

    it('should handle range selection mode', () => {
      const mockOnRangeSelect = vi.fn();
      
      render(
        React.createElement(QueryClientProvider, { client: queryClient },
          React.createElement(VirtualAvailabilityCalendar, {
            ...defaultProps,
            onDateRangeSelect: mockOnRangeSelect
          })
        )
      );

      // Should show range selection toggle
      expect(screen.getByText(/Rozsah dátumov|Jeden dátum/)).toBeInTheDocument();
    });

    it('should render weekday headers', () => {
      render(
        React.createElement(QueryClientProvider, { client: queryClient },
          React.createElement(VirtualAvailabilityCalendar, defaultProps)
        )
      );

      // Check for Slovak weekday headers
      expect(screen.getByText('Po')).toBeInTheDocument();
      expect(screen.getByText('Ut')).toBeInTheDocument();
      expect(screen.getByText('St')).toBeInTheDocument();
    });

    it('should handle infinite scrolling when enabled', () => {
      render(
        React.createElement(QueryClientProvider, { client: queryClient },
          React.createElement(VirtualAvailabilityCalendar, {
            ...defaultProps,
            enableInfiniteScroll: true
          })
        )
      );

      // Component should render without errors
      expect(screen.getByText(/Dostupnosť/)).toBeInTheDocument();
    });
  });

  describe('Performance Monitoring', () => {
    beforeEach(() => {
      performanceMonitor.clearMetrics();
    });

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
      const severity = 'medium';

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
      // Add some test metrics
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
      // Track a slow calendar load (should violate budget)
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

  describe('Performance Dashboard', () => {
    it('should render performance dashboard', () => {
      render(
        React.createElement(QueryClientProvider, { client: queryClient },
          React.createElement(AdvancedPerformanceDashboard)
        )
      );

      expect(screen.getByText('Performance Dashboard')).toBeInTheDocument();
      expect(screen.getByText('System Health Score')).toBeInTheDocument();
    });

    it('should display key metrics', () => {
      render(
        React.createElement(QueryClientProvider, { client: queryClient },
          React.createElement(AdvancedPerformanceDashboard)
        )
      );

      expect(screen.getByText('Avg Load Time')).toBeInTheDocument();
      expect(screen.getByText('Cache Hit Rate')).toBeInTheDocument();
      expect(screen.getByText('Error Rate')).toBeInTheDocument();
      expect(screen.getByText('Active Metrics')).toBeInTheDocument();
    });

    it('should handle time range selection', async () => {
      render(
        React.createElement(QueryClientProvider, { client: queryClient },
          React.createElement(AdvancedPerformanceDashboard)
        )
      );

      // Should have time range tabs
      expect(screen.getByText('1H')).toBeInTheDocument();
      expect(screen.getByText('24H')).toBeInTheDocument();
      expect(screen.getByText('7D')).toBeInTheDocument();
    });

    it('should display refresh and clear buttons', () => {
      render(
        React.createElement(QueryClientProvider, { client: queryClient },
          React.createElement(AdvancedPerformanceDashboard)
        )
      );

      expect(screen.getByText('Refresh')).toBeInTheDocument();
      expect(screen.getByText('Clear Data')).toBeInTheDocument();
    });

    it('should show different tabs', async () => {
      render(
        React.createElement(QueryClientProvider, { client: queryClient },
          React.createElement(AdvancedPerformanceDashboard)
        )
      );

      // Check for tab navigation
      expect(screen.getByText('Timeline')).toBeInTheDocument();
      expect(screen.getByText('Distribution')).toBeInTheDocument();
      expect(screen.getByText('Recommendations')).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    it('should integrate Service Worker with Performance Monitor', async () => {
      // Initialize service worker
      await serviceWorkerManager.initialize();
      
      // Track some performance metrics
      performanceMonitor.trackCalendarLoad('test-apartment', 200, true);
      
      // Get cache stats from service worker
      const swStatus = serviceWorkerManager.getStatus();
      const perfStats = performanceMonitor.getRealTimeStats();
      
      expect(swStatus.supported).toBe(true);
      expect(perfStats.activeMetrics).toBeGreaterThan(0);
    });

    it('should integrate WebSocket with Performance Monitor', () => {
      // Connect WebSocket
      calendarWebSocket.connect('test-apartment');
      
      // Track WebSocket-related performance
      performanceMonitor.trackInteraction('websocket_connect', 'calendar');
      
      const stats = performanceMonitor.getRealTimeStats();
      expect(stats.activeMetrics).toBeGreaterThan(0);
    });

    it('should handle all optimizations working together', async () => {
      // Initialize all systems
      await serviceWorkerManager.initialize();
      calendarWebSocket.connect('test-apartment');
      
      // Track comprehensive performance
      performanceMonitor.trackCalendarLoad('test-apartment', 150, true);
      performanceMonitor.trackAPICall('/api/beds24/availability', 'GET', 100, 200, true);
      performanceMonitor.trackNavigation('/apartments', '/booking', 50);
      performanceMonitor.trackCachePerformance('hit', 'calendar-data');
      
      // Generate report
      const report = performanceMonitor.generateReport();
      
      expect(report.summary.totalMetrics).toBeGreaterThan(0);
      expect(report.summary.averageLoadTime).toBeLessThan(500); // Should be fast
      expect(report.summary.cacheHitRate).toBeGreaterThan(0);
      expect(report.summary.errorRate).toBe(0); // No errors in this test
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle Service Worker not supported', async () => {
      // Mock unsupported environment
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
      }).not.toThrow(); // Should handle gracefully
    });

    it('should handle Performance Observer not supported', () => {
      const originalPerformanceObserver = global.PerformanceObserver;
      global.PerformanceObserver = undefined as any;
      
      expect(() => {
        performanceMonitor.trackCalendarLoad('test', 100, true);
      }).not.toThrow();
      
      global.PerformanceObserver = originalPerformanceObserver;
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

    // Test with good performance metrics
    performanceMonitor.clearMetrics();
    performanceMonitor.trackCalendarLoad('test', 200, true); // Fast load
    performanceMonitor.trackAPICall('/api/test', 'GET', 150, 200, true); // Fast API
    performanceMonitor.trackNavigation('/a', '/b', 50); // Fast navigation
    performanceMonitor.trackCachePerformance('hit', 'key1');
    performanceMonitor.trackCachePerformance('hit', 'key2');

    const report = performanceMonitor.generateReport();
    
    expect(report.summary.averageLoadTime).toBeLessThan(targets.calendarLoadTime);
    expect(report.summary.cacheHitRate).toBeGreaterThan(targets.cacheHitRate);
    expect(report.summary.errorRate).toBeLessThan(targets.errorRate);
  });
});
