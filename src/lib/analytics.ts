import { format } from 'date-fns';
import { availabilityCache, CACHE_KEYS } from './cache';

/**
 * Performance metrics interface
 */
export interface PerformanceMetric {
  id: string;
  timestamp: number;
  type: 'calendar_load' | 'calendar_navigation' | 'calendar_error' | 'api_request' | 'cache_operation';
  apartment?: string;
  loadTime: number;
  cacheHit?: boolean;
  source?: 'redis' | 'memory' | 'api';
  error?: string;
  context?: string;
  userAgent?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

/**
 * Cache performance metrics
 */
export interface CacheMetrics {
  hits: number;
  misses: number;
  errors: number;
  totalRequests: number;
  hitRate: number;
  averageLoadTime: number;
  redisOperations: number;
  memoryOperations: number;
  lastUpdated: number;
}

/**
 * Calendar analytics and performance monitoring
 */
export class CalendarAnalytics {
  private static metrics: PerformanceMetric[] = [];
  private static maxMetrics = 1000; // Keep last 1000 metrics in memory
  private static sessionId = this.generateSessionId();

  /**
   * Generate unique session ID
   */
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track calendar load performance
   */
  static trackCalendarLoad(
    apartmentSlug: string,
    loadTime: number,
    cacheHit: boolean,
    source: 'redis' | 'memory' | 'api' = 'api',
    metadata?: Record<string, any>
  ): void {
    const metric: PerformanceMetric = {
      id: this.generateMetricId(),
      timestamp: Date.now(),
      type: 'calendar_load',
      apartment: apartmentSlug,
      loadTime,
      cacheHit,
      source,
      sessionId: this.sessionId,
      metadata,
    };

    this.addMetric(metric);
    this.logPerformance('Calendar Load', metric);
  }

  /**
   * Track calendar navigation performance
   */
  static trackNavigation(
    apartmentSlug: string,
    from: Date,
    to: Date,
    timeToLoad: number,
    cacheHit: boolean,
    source: 'redis' | 'memory' | 'api' = 'api'
  ): void {
    const metric: PerformanceMetric = {
      id: this.generateMetricId(),
      timestamp: Date.now(),
      type: 'calendar_navigation',
      apartment: apartmentSlug,
      loadTime: timeToLoad,
      cacheHit,
      source,
      sessionId: this.sessionId,
      metadata: {
        from: format(from, 'yyyy-MM'),
        to: format(to, 'yyyy-MM'),
      },
    };

    this.addMetric(metric);
    this.logPerformance('Calendar Navigation', metric);
  }

  /**
   * Track calendar errors
   */
  static trackError(
    error: Error,
    context: string,
    apartmentSlug?: string,
    metadata?: Record<string, any>
  ): void {
    const metric: PerformanceMetric = {
      id: this.generateMetricId(),
      timestamp: Date.now(),
      type: 'calendar_error',
      apartment: apartmentSlug,
      loadTime: 0,
      error: error.message,
      context,
      sessionId: this.sessionId,
      metadata: {
        ...metadata,
        stack: error.stack,
        name: error.name,
      },
    };

    this.addMetric(metric);
    console.error(`📊 Calendar Error [${context}]:`, {
      apartment: apartmentSlug,
      error: error.message,
      timestamp: new Date(metric.timestamp).toISOString(),
    });
  }

  /**
   * Track API request performance
   */
  static trackApiRequest(
    endpoint: string,
    method: string,
    responseTime: number,
    success: boolean,
    cacheHit: boolean = false,
    metadata?: Record<string, any>
  ): void {
    const metric: PerformanceMetric = {
      id: this.generateMetricId(),
      timestamp: Date.now(),
      type: 'api_request',
      loadTime: responseTime,
      cacheHit,
      sessionId: this.sessionId,
      metadata: {
        endpoint,
        method,
        success,
        ...metadata,
      },
    };

    this.addMetric(metric);
    
    if (responseTime > 2000) { // Log slow requests
      console.warn(`🐌 Slow API Request: ${method} ${endpoint} took ${responseTime}ms`);
    }
  }

  /**
   * Track cache operations
   */
  static trackCacheOperation(
    operation: 'get' | 'set' | 'invalidate' | 'clear',
    key: string,
    hit: boolean,
    responseTime: number,
    source: 'redis' | 'memory',
    metadata?: Record<string, any>
  ): void {
    const metric: PerformanceMetric = {
      id: this.generateMetricId(),
      timestamp: Date.now(),
      type: 'cache_operation',
      loadTime: responseTime,
      cacheHit: hit,
      source,
      sessionId: this.sessionId,
      metadata: {
        operation,
        key,
        ...metadata,
      },
    };

    this.addMetric(metric);
  }

  /**
   * Get performance summary for time period
   */
  static getPerformanceSummary(
    timeWindowMs: number = 3600000 // Default: 1 hour
  ): {
    calendar: {
      totalLoads: number;
      averageLoadTime: number;
      cacheHitRate: number;
      errorRate: number;
    };
    api: {
      totalRequests: number;
      averageResponseTime: number;
      successRate: number;
    };
    cache: CacheMetrics;
  } {
    const now = Date.now();
    const cutoff = now - timeWindowMs;
    const recentMetrics = this.metrics.filter(m => m.timestamp >= cutoff);

    // Calendar metrics
    const calendarMetrics = recentMetrics.filter(m => 
      m.type === 'calendar_load' || m.type === 'calendar_navigation'
    );
    const calendarErrors = recentMetrics.filter(m => m.type === 'calendar_error');

    const calendarSummary = {
      totalLoads: calendarMetrics.length,
      averageLoadTime: calendarMetrics.length > 0 
        ? calendarMetrics.reduce((sum, m) => sum + m.loadTime, 0) / calendarMetrics.length 
        : 0,
      cacheHitRate: calendarMetrics.length > 0 
        ? calendarMetrics.filter(m => m.cacheHit).length / calendarMetrics.length 
        : 0,
      errorRate: (calendarMetrics.length + calendarErrors.length) > 0 
        ? calendarErrors.length / (calendarMetrics.length + calendarErrors.length) 
        : 0,
    };

    // API metrics
    const apiMetrics = recentMetrics.filter(m => m.type === 'api_request');
    const apiSummary = {
      totalRequests: apiMetrics.length,
      averageResponseTime: apiMetrics.length > 0 
        ? apiMetrics.reduce((sum, m) => sum + m.loadTime, 0) / apiMetrics.length 
        : 0,
      successRate: apiMetrics.length > 0 
        ? apiMetrics.filter(m => m.metadata?.success).length / apiMetrics.length 
        : 0,
    };

    // Cache metrics
    const cacheMetrics = recentMetrics.filter(m => m.type === 'cache_operation');
    const cacheHits = cacheMetrics.filter(m => m.cacheHit);
    const cacheMisses = cacheMetrics.filter(m => !m.cacheHit);
    const cacheErrors = recentMetrics.filter(m => 
      m.type === 'calendar_error' && m.context?.includes('cache')
    );

    const cacheSummary: CacheMetrics = {
      hits: cacheHits.length,
      misses: cacheMisses.length,
      errors: cacheErrors.length,
      totalRequests: cacheMetrics.length,
      hitRate: cacheMetrics.length > 0 ? cacheHits.length / cacheMetrics.length : 0,
      averageLoadTime: cacheMetrics.length > 0 
        ? cacheMetrics.reduce((sum, m) => sum + m.loadTime, 0) / cacheMetrics.length 
        : 0,
      redisOperations: cacheMetrics.filter(m => m.source === 'redis').length,
      memoryOperations: cacheMetrics.filter(m => m.source === 'memory').length,
      lastUpdated: now,
    };

    return {
      calendar: calendarSummary,
      api: apiSummary,
      cache: cacheSummary,
    };
  }

  /**
   * Get metrics for specific apartment
   */
  static getApartmentMetrics(
    apartmentSlug: string,
    timeWindowMs: number = 3600000
  ): PerformanceMetric[] {
    const cutoff = Date.now() - timeWindowMs;
    return this.metrics.filter(m => 
      m.apartment === apartmentSlug && m.timestamp >= cutoff
    );
  }

  /**
   * Get slow performance alerts
   */
  static getPerformanceAlerts(): {
    type: 'slow_load' | 'high_error_rate' | 'low_cache_hit';
    message: string;
    severity: 'warning' | 'critical';
    metric: PerformanceMetric | null;
  }[] {
    const alerts: any[] = [];
    const summary = this.getPerformanceSummary();

    // Slow load times
    if (summary.calendar.averageLoadTime > 2000) {
      alerts.push({
        type: 'slow_load',
        message: `Average calendar load time is ${Math.round(summary.calendar.averageLoadTime)}ms (target: <500ms)`,
        severity: summary.calendar.averageLoadTime > 5000 ? 'critical' : 'warning',
        metric: null,
      });
    }

    // High error rate
    if (summary.calendar.errorRate > 0.05) { // 5%
      alerts.push({
        type: 'high_error_rate',
        message: `Calendar error rate is ${Math.round(summary.calendar.errorRate * 100)}% (target: <2%)`,
        severity: summary.calendar.errorRate > 0.1 ? 'critical' : 'warning',
        metric: null,
      });
    }

    // Low cache hit rate
    if (summary.cache.hitRate < 0.8 && summary.cache.totalRequests > 10) { // 80%
      alerts.push({
        type: 'low_cache_hit',
        message: `Cache hit rate is ${Math.round(summary.cache.hitRate * 100)}% (target: >90%)`,
        severity: summary.cache.hitRate < 0.5 ? 'critical' : 'warning',
        metric: null,
      });
    }

    return alerts;
  }

  /**
   * Export metrics for external analytics
   */
  static exportMetrics(
    format: 'json' | 'csv' = 'json',
    timeWindowMs?: number
  ): string {
    let metricsToExport = this.metrics;
    
    if (timeWindowMs) {
      const cutoff = Date.now() - timeWindowMs;
      metricsToExport = this.metrics.filter(m => m.timestamp >= cutoff);
    }

    if (format === 'csv') {
      const headers = [
        'id', 'timestamp', 'type', 'apartment', 'loadTime', 
        'cacheHit', 'source', 'error', 'context', 'sessionId'
      ];
      
      const rows = metricsToExport.map(m => [
        m.id,
        new Date(m.timestamp).toISOString(),
        m.type,
        m.apartment || '',
        m.loadTime,
        m.cacheHit || false,
        m.source || '',
        m.error || '',
        m.context || '',
        m.sessionId || '',
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    return JSON.stringify(metricsToExport, null, 2);
  }

  /**
   * Clear old metrics to prevent memory leaks
   */
  static cleanup(): void {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // Keep 24 hours
    const initialCount = this.metrics.length;
    this.metrics = this.metrics.filter(m => m.timestamp >= cutoff);
    
    const removed = initialCount - this.metrics.length;
    if (removed > 0) {
      console.log(`🧹 Cleaned up ${removed} old performance metrics`);
    }
  }

  /**
   * Get real-time performance dashboard data
   */
  static getDashboardData(): {
    summary: ReturnType<typeof CalendarAnalytics.getPerformanceSummary>;
    alerts: ReturnType<typeof CalendarAnalytics.getPerformanceAlerts>;
    recentMetrics: PerformanceMetric[];
    topApartments: { apartment: string; requests: number; avgLoadTime: number }[];
  } {
    const summary = this.getPerformanceSummary();
    const alerts = this.getPerformanceAlerts();
    const recentMetrics = this.metrics
      .filter(m => m.timestamp >= Date.now() - 300000) // Last 5 minutes
      .slice(-20); // Last 20 metrics

    // Top apartments by request count
    const apartmentStats = new Map<string, { requests: number; totalTime: number }>();
    
    this.metrics
      .filter(m => m.apartment && m.timestamp >= Date.now() - 3600000) // Last hour
      .forEach(m => {
        const stats = apartmentStats.get(m.apartment!) || { requests: 0, totalTime: 0 };
        stats.requests++;
        stats.totalTime += m.loadTime;
        apartmentStats.set(m.apartment!, stats);
      });

    const topApartments = Array.from(apartmentStats.entries())
      .map(([apartment, stats]) => ({
        apartment,
        requests: stats.requests,
        avgLoadTime: stats.totalTime / stats.requests,
      }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 5);

    return {
      summary,
      alerts,
      recentMetrics,
      topApartments,
    };
  }

  /**
   * Private helper methods
   */
  private static generateMetricId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only recent metrics in memory
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Store in cache for persistence (optional)
    this.persistMetric(metric);
  }

  private static async persistMetric(metric: PerformanceMetric): Promise<void> {
    try {
      const key = `${CACHE_KEYS.METRICS}:${format(new Date(), 'yyyy-MM-dd')}`;
      // This would store daily metrics - implement based on needs
      // await availabilityCache.setAvailability(key, metric, 86400); // 24 hours
    } catch (error) {
      // Silent fail for metrics persistence
      console.debug('Failed to persist metric:', error);
    }
  }

  private static logPerformance(action: string, metric: PerformanceMetric): void {
    const emoji = metric.loadTime < 500 ? '⚡' : metric.loadTime < 2000 ? '⏱️' : '🐌';
    const cacheStatus = metric.cacheHit ? '📦 HIT' : '❌ MISS';
    
    console.log(
      `${emoji} ${action}: ${metric.loadTime}ms | ${cacheStatus} | ${metric.source?.toUpperCase()} | ${metric.apartment || 'N/A'}`
    );
  }
}

// Auto-cleanup every hour
if (typeof window !== 'undefined') {
  setInterval(() => {
    CalendarAnalytics.cleanup();
  }, 3600000); // 1 hour
}

// Export singleton for easy access
export const analytics = CalendarAnalytics;
