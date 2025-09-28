/**
 * Service Worker Registration and Management
 * Handles offline-first calendar caching and performance monitoring
 */

import React, { useState, useEffect } from 'react';

interface CachePerformanceData {
  type: 'api' | 'static' | 'image';
  event: 'cache_hit' | 'cache_miss' | 'network_success' | 'network_failed';
  timestamp: number;
}

interface CalendarUpdateData {
  apartmentSlug: string;
  apartmentName: string;
  month: string;
  type: 'calendar_update';
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private performanceMetrics: CachePerformanceData[] = [];
  private updateCallbacks: Set<(data: CalendarUpdateData) => void> = new Set();

  /**
   * Initialize Service Worker
   */
  async initialize(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('[SW Manager] Service Worker not supported');
      return;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      console.log('[SW Manager] Service Worker registered:', this.registration.scope);

      // Listen for updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[SW Manager] New Service Worker available');
              this.notifyUpdate();
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event.data);
      });

      // Check for updates periodically
      setInterval(() => {
        this.checkForUpdates();
      }, 60000); // Check every minute

      // Setup background sync
      await this.setupBackgroundSync();

    } catch (error) {
      console.error('[SW Manager] Service Worker registration failed:', error);
    }
  }

  /**
   * Handle messages from Service Worker
   */
  private handleServiceWorkerMessage(data: { type: string; data?: unknown }): void {
    switch (data.type) {
      case 'cache_performance':
        if (data.data && typeof data.data === 'object') {
          this.trackPerformanceMetric(data.data as CachePerformanceData);
        }
        break;
      
      case 'calendar_update':
        if (data.data && typeof data.data === 'object') {
          this.notifyCalendarUpdate(data.data as CalendarUpdateData);
        }
        break;
      
      default:
        console.log('[SW Manager] Unknown message:', data);
    }
  }

  /**
   * Track cache performance metrics
   */
  private trackPerformanceMetric(data: CachePerformanceData): void {
    this.performanceMetrics.push(data);
    
    // Keep only last 1000 metrics
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics = this.performanceMetrics.slice(-1000);
    }

    // Send to analytics if available
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as { gtag: (event: string, action: string, params: Record<string, unknown>) => void }).gtag('event', 'cache_performance', {
        cache_type: data.type,
        cache_event: data.event,
        value: 1
      });
    }
  }

  /**
   * Get cache performance statistics
   */
  getCacheStats(): {
    hitRate: number;
    totalRequests: number;
    avgResponseTime: number;
    errorRate: number;
  } {
    const total = this.performanceMetrics.length;
    if (total === 0) {
      return { hitRate: 0, totalRequests: 0, avgResponseTime: 0, errorRate: 0 };
    }

    const hits = this.performanceMetrics.filter(m => m.event === 'cache_hit').length;
    const errors = this.performanceMetrics.filter(m => m.event === 'network_failed').length;
    
    // Calculate average response time (simplified)
    const responseTimes = this.performanceMetrics.map(m => Date.now() - m.timestamp);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

    return {
      hitRate: (hits / total) * 100,
      totalRequests: total,
      avgResponseTime: Math.round(avgResponseTime),
      errorRate: (errors / total) * 100
    };
  }

  /**
   * Force cache refresh for specific apartment
   */
  async refreshApartmentCache(apartmentSlug: string): Promise<void> {
    if (!this.registration?.active) return;

    this.registration.active.postMessage({
      type: 'refresh_apartment_cache',
      apartmentSlug
    });
  }

  /**
   * Clear all caches
   */
  async clearAllCaches(): Promise<void> {
    if (!this.registration?.active) return;

    this.registration.active.postMessage({
      type: 'clear_all_caches'
    });

    // Also clear browser caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
  }

  /**
   * Setup background sync for calendar updates
   */
  private async setupBackgroundSync(): Promise<void> {
    if (!this.registration || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      console.warn('[SW Manager] Background Sync not supported');
      return;
    }

    try {
      // Background sync is not available in all browsers
      if ('sync' in this.registration) {
        await (this.registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register('calendar-sync');
        console.log('[SW Manager] Background sync registered');
      }
    } catch (error) {
      console.error('[SW Manager] Background sync registration failed:', error);
    }
  }

  /**
   * Check for Service Worker updates
   */
  private async checkForUpdates(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.update();
    } catch (error) {
      console.error('[SW Manager] Update check failed:', error);
    }
  }

  /**
   * Notify about Service Worker update
   */
  private notifyUpdate(): void {
    // Show user notification about update
    if (typeof window !== 'undefined' && 'Notification' in window) {
      new Notification('App Updated', {
        body: 'A new version is available. Refresh to update.',
        icon: '/favicon.ico'
      });
    }
  }

  /**
   * Notify about calendar updates
   */
  private notifyCalendarUpdate(data: CalendarUpdateData): void {
    this.updateCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('[SW Manager] Update callback error:', error);
      }
    });
  }

  /**
   * Subscribe to calendar updates
   */
  onCalendarUpdate(callback: (data: CalendarUpdateData) => void): () => void {
    this.updateCallbacks.add(callback);
    
    return () => {
      this.updateCallbacks.delete(callback);
    };
  }

  /**
   * Get Service Worker status
   */
  getStatus(): {
    supported: boolean;
    registered: boolean;
    active: boolean;
    updating: boolean;
  } {
    return {
      supported: 'serviceWorker' in navigator,
      registered: !!this.registration,
      active: !!this.registration?.active,
      updating: !!this.registration?.installing
    };
  }

  /**
   * Preload critical calendar data
   */
  async preloadCalendarData(apartmentSlug: string, months: string[]): Promise<void> {
    if (!this.registration?.active) return;

    this.registration.active.postMessage({
      type: 'preload_calendar_data',
      apartmentSlug,
      months
    });
  }
}

// Singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();

/**
 * React hook for Service Worker integration
 */
export function useServiceWorker() {
  const [status, setStatus] = useState(serviceWorkerManager.getStatus());
  const [cacheStats, setCacheStats] = useState(serviceWorkerManager.getCacheStats());

  useEffect(() => {
    // Initialize Service Worker
    serviceWorkerManager.initialize();

    // Update status periodically
    const statusInterval = setInterval(() => {
      setStatus(serviceWorkerManager.getStatus());
      setCacheStats(serviceWorkerManager.getCacheStats());
    }, 5000);

    return () => clearInterval(statusInterval);
  }, []);

  return {
    status,
    cacheStats,
    refreshCache: serviceWorkerManager.refreshApartmentCache.bind(serviceWorkerManager),
    clearCaches: serviceWorkerManager.clearAllCaches.bind(serviceWorkerManager),
    preloadData: serviceWorkerManager.preloadCalendarData.bind(serviceWorkerManager),
    onUpdate: serviceWorkerManager.onCalendarUpdate.bind(serviceWorkerManager)
  };
}

/**
 * Performance monitoring component
 */
export function ServiceWorkerStatus() {
  const { status, cacheStats } = useServiceWorker();

  if (!status.supported) return null;

  return React.createElement('div', {
    className: "fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg text-xs"
  }, [
    React.createElement('div', {
      key: 'status',
      className: "flex items-center space-x-2"
    }, [
      React.createElement('div', {
        key: 'indicator',
        className: `w-2 h-2 rounded-full ${status.active ? 'bg-green-500' : 'bg-red-500'}`
      }),
      React.createElement('span', {
        key: 'text'
      }, `SW: ${status.active ? 'Active' : 'Inactive'}`)
    ]),
    
    status.active && React.createElement('div', {
      key: 'stats',
      className: "mt-1 space-y-1"
    }, [
      React.createElement('div', { key: 'hit' }, `Cache Hit: ${cacheStats.hitRate.toFixed(1)}%`),
      React.createElement('div', { key: 'requests' }, `Requests: ${cacheStats.totalRequests}`),
      React.createElement('div', { key: 'time' }, `Avg Time: ${cacheStats.avgResponseTime}ms`)
    ])
  ]);
}

export default serviceWorkerManager;
