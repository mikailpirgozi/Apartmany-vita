/**
 * Advanced Performance Monitoring System
 * Tracks calendar performance, user interactions, and system health
 */

interface PerformanceMetric {
  id: string;
  type: 'calendar_load' | 'api_call' | 'navigation' | 'interaction' | 'error' | 'cache';
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  timestamp: number;
  metadata?: Record<string, any>;
  tags?: string[];
}

interface PerformanceBudget {
  metric: string;
  threshold: number;
  unit: string;
  severity: 'warning' | 'error';
}

interface PerformanceReport {
  summary: {
    totalMetrics: number;
    timeRange: { start: number; end: number };
    averageLoadTime: number;
    cacheHitRate: number;
    errorRate: number;
  };
  metrics: PerformanceMetric[];
  violations: Array<{
    budget: PerformanceBudget;
    actualValue: number;
    severity: 'warning' | 'error';
  }>;
  recommendations: string[];
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private budgets: PerformanceBudget[] = [];
  private maxMetrics = 1000;
  private isEnabled = true;

  constructor() {
    this.setupDefaultBudgets();
    this.initializeObservers();
  }

  /**
   * Setup default performance budgets
   */
  private setupDefaultBudgets(): void {
    this.budgets = [
      { metric: 'calendar_load', threshold: 500, unit: 'ms', severity: 'warning' },
      { metric: 'calendar_load', threshold: 1000, unit: 'ms', severity: 'error' },
      { metric: 'api_call', threshold: 2000, unit: 'ms', severity: 'warning' },
      { metric: 'api_call', threshold: 5000, unit: 'ms', severity: 'error' },
      { metric: 'navigation', threshold: 100, unit: 'ms', severity: 'warning' },
      { metric: 'navigation', threshold: 300, unit: 'ms', severity: 'error' },
      { metric: 'cache_hit_rate', threshold: 80, unit: 'percentage', severity: 'warning' },
      { metric: 'cache_hit_rate', threshold: 60, unit: 'percentage', severity: 'error' },
      { metric: 'error_rate', threshold: 5, unit: 'percentage', severity: 'warning' },
      { metric: 'error_rate', threshold: 10, unit: 'percentage', severity: 'error' }
    ];
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      // Navigation timing
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.trackNavigationTiming(entry as PerformanceNavigationTiming);
          }
        }
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);

      // Resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            this.trackResourceTiming(entry as PerformanceResourceTiming);
          }
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);

      // Long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'longtask') {
            this.trackLongTask(entry);
          }
        }
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.push(longTaskObserver);

      // Layout shifts (CLS)
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            this.trackLayoutShift(entry);
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.trackLCP(lastEntry);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

    } catch (error) {
      console.warn('[Performance Monitor] Observer setup failed:', error);
    }
  }

  /**
   * Track calendar load performance
   */
  trackCalendarLoad(apartmentSlug: string, loadTime: number, cacheHit: boolean): void {
    this.addMetric({
      id: this.generateId(),
      type: 'calendar_load',
      name: 'calendar_load_time',
      value: loadTime,
      unit: 'ms',
      timestamp: Date.now(),
      metadata: {
        apartmentSlug,
        cacheHit,
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`
      },
      tags: ['calendar', 'performance', cacheHit ? 'cache-hit' : 'cache-miss']
    });

    // Check performance budget
    this.checkBudgetViolation('calendar_load', loadTime);
  }

  /**
   * Track API call performance
   */
  trackAPICall(
    endpoint: string, 
    method: string, 
    duration: number, 
    status: number,
    cacheHit: boolean = false
  ): void {
    this.addMetric({
      id: this.generateId(),
      type: 'api_call',
      name: 'api_response_time',
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      metadata: {
        endpoint,
        method,
        status,
        cacheHit,
        success: status >= 200 && status < 300
      },
      tags: ['api', 'performance', cacheHit ? 'cache-hit' : 'network']
    });

    this.checkBudgetViolation('api_call', duration);
  }

  /**
   * Track navigation performance
   */
  trackNavigation(from: string, to: string, duration: number): void {
    this.addMetric({
      id: this.generateId(),
      type: 'navigation',
      name: 'navigation_time',
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      metadata: { from, to },
      tags: ['navigation', 'performance']
    });

    this.checkBudgetViolation('navigation', duration);
  }

  /**
   * Track user interactions
   */
  trackInteraction(action: string, element: string, duration?: number): void {
    this.addMetric({
      id: this.generateId(),
      type: 'interaction',
      name: 'user_interaction',
      value: duration || 0,
      unit: 'ms',
      timestamp: Date.now(),
      metadata: { action, element },
      tags: ['interaction', 'ux']
    });
  }

  /**
   * Track errors
   */
  trackError(error: Error, context: string, severity: 'low' | 'medium' | 'high' = 'medium'): void {
    this.addMetric({
      id: this.generateId(),
      type: 'error',
      name: 'error_occurrence',
      value: 1,
      unit: 'count',
      timestamp: Date.now(),
      metadata: {
        message: error.message,
        stack: error.stack,
        context,
        severity,
        userAgent: navigator.userAgent
      },
      tags: ['error', severity]
    });
  }

  /**
   * Track cache performance
   */
  trackCachePerformance(type: 'hit' | 'miss' | 'set' | 'invalidate', key: string): void {
    this.addMetric({
      id: this.generateId(),
      type: 'cache',
      name: `cache_${type}`,
      value: 1,
      unit: 'count',
      timestamp: Date.now(),
      metadata: { key, type },
      tags: ['cache', type]
    });
  }

  /**
   * Track navigation timing
   */
  private trackNavigationTiming(entry: PerformanceNavigationTiming): void {
    const metrics = [
      { name: 'dns_lookup', value: entry.domainLookupEnd - entry.domainLookupStart },
      { name: 'tcp_connect', value: entry.connectEnd - entry.connectStart },
      { name: 'ssl_handshake', value: entry.connectEnd - entry.secureConnectionStart },
      { name: 'ttfb', value: entry.responseStart - entry.requestStart },
      { name: 'dom_content_loaded', value: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart },
      { name: 'load_complete', value: entry.loadEventEnd - entry.loadEventStart }
    ];

    metrics.forEach(metric => {
      if (metric.value > 0) {
        this.addMetric({
          id: this.generateId(),
          type: 'navigation',
          name: metric.name,
          value: metric.value,
          unit: 'ms',
          timestamp: Date.now(),
          tags: ['navigation', 'timing']
        });
      }
    });
  }

  /**
   * Track resource timing
   */
  private trackResourceTiming(entry: PerformanceResourceTiming): void {
    // Only track calendar-related resources
    if (!entry.name.includes('beds24') && !entry.name.includes('calendar')) {
      return;
    }

    this.addMetric({
      id: this.generateId(),
      type: 'api_call',
      name: 'resource_load_time',
      value: entry.responseEnd - entry.startTime,
      unit: 'ms',
      timestamp: Date.now(),
      metadata: {
        url: entry.name,
        size: entry.transferSize,
        cached: entry.transferSize === 0
      },
      tags: ['resource', 'performance']
    });
  }

  /**
   * Track long tasks
   */
  private trackLongTask(entry: PerformanceEntry): void {
    this.addMetric({
      id: this.generateId(),
      type: 'interaction',
      name: 'long_task',
      value: entry.duration,
      unit: 'ms',
      timestamp: Date.now(),
      metadata: {
        startTime: entry.startTime,
        attribution: (entry as any).attribution
      },
      tags: ['performance', 'blocking']
    });
  }

  /**
   * Track layout shifts
   */
  private trackLayoutShift(entry: PerformanceEntry): void {
    this.addMetric({
      id: this.generateId(),
      type: 'interaction',
      name: 'layout_shift',
      value: (entry as any).value,
      unit: 'count',
      timestamp: Date.now(),
      metadata: {
        startTime: entry.startTime,
        sources: (entry as any).sources
      },
      tags: ['ux', 'stability']
    });
  }

  /**
   * Track Largest Contentful Paint
   */
  private trackLCP(entry: PerformanceEntry): void {
    this.addMetric({
      id: this.generateId(),
      type: 'calendar_load',
      name: 'largest_contentful_paint',
      value: entry.startTime,
      unit: 'ms',
      timestamp: Date.now(),
      metadata: {
        element: (entry as any).element?.tagName,
        url: (entry as any).url
      },
      tags: ['performance', 'lcp']
    });
  }

  /**
   * Add metric to collection
   */
  private addMetric(metric: PerformanceMetric): void {
    if (!this.isEnabled) return;

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Send to analytics if available
    this.sendToAnalytics(metric);
  }

  /**
   * Check budget violations
   */
  private checkBudgetViolation(metricType: string, value: number): void {
    const relevantBudgets = this.budgets.filter(b => b.metric === metricType);
    
    for (const budget of relevantBudgets) {
      if (value > budget.threshold) {
        console.warn(
          `[Performance Monitor] Budget violation: ${metricType} = ${value}${budget.unit} exceeds ${budget.threshold}${budget.unit} (${budget.severity})`
        );
        
        // Track violation as metric
        this.addMetric({
          id: this.generateId(),
          type: 'error',
          name: 'budget_violation',
          value: value - budget.threshold,
          unit: budget.unit,
          timestamp: Date.now(),
          metadata: {
            budget: budget.metric,
            threshold: budget.threshold,
            actualValue: value,
            severity: budget.severity
          },
          tags: ['budget', 'violation', budget.severity]
        });
      }
    }
  }

  /**
   * Send metric to analytics
   */
  private sendToAnalytics(metric: PerformanceMetric): void {
    // Send to Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metric', {
        metric_type: metric.type,
        metric_name: metric.name,
        value: metric.value,
        unit: metric.unit,
        custom_parameters: metric.metadata
      });
    }

    // Send to custom analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric)
      }).catch(error => {
        console.warn('[Performance Monitor] Analytics send failed:', error);
      });
    }
  }

  /**
   * Generate performance report
   */
  generateReport(timeRange?: { start: number; end: number }): PerformanceReport {
    const filteredMetrics = timeRange 
      ? this.metrics.filter(m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end)
      : this.metrics;

    const calendarLoads = filteredMetrics.filter(m => m.type === 'calendar_load');
    const cacheHits = filteredMetrics.filter(m => m.tags?.includes('cache-hit'));
    const errors = filteredMetrics.filter(m => m.type === 'error');

    const averageLoadTime = calendarLoads.length > 0 
      ? calendarLoads.reduce((sum, m) => sum + m.value, 0) / calendarLoads.length 
      : 0;

    const cacheHitRate = filteredMetrics.length > 0 
      ? (cacheHits.length / filteredMetrics.length) * 100 
      : 0;

    const errorRate = filteredMetrics.length > 0 
      ? (errors.length / filteredMetrics.length) * 100 
      : 0;

    // Check for budget violations
    const violations = this.budgets.map(budget => {
      let actualValue = 0;
      
      switch (budget.metric) {
        case 'calendar_load':
          actualValue = averageLoadTime;
          break;
        case 'cache_hit_rate':
          actualValue = cacheHitRate;
          break;
        case 'error_rate':
          actualValue = errorRate;
          break;
      }

      return actualValue > budget.threshold ? {
        budget,
        actualValue,
        severity: budget.severity
      } : null;
    }).filter(Boolean) as any[];

    // Generate recommendations
    const recommendations = this.generateRecommendations(filteredMetrics, violations);

    return {
      summary: {
        totalMetrics: filteredMetrics.length,
        timeRange: timeRange || { 
          start: Math.min(...filteredMetrics.map(m => m.timestamp)), 
          end: Math.max(...filteredMetrics.map(m => m.timestamp)) 
        },
        averageLoadTime,
        cacheHitRate,
        errorRate
      },
      metrics: filteredMetrics,
      violations,
      recommendations
    };
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(metrics: PerformanceMetric[], violations: any[]): string[] {
    const recommendations: string[] = [];

    // Cache recommendations
    const cacheHitRate = (metrics.filter(m => m.tags?.includes('cache-hit')).length / metrics.length) * 100;
    if (cacheHitRate < 80) {
      recommendations.push('Zvýšte cache hit rate implementáciou agresívnejšieho cachingu');
    }

    // Load time recommendations
    const avgLoadTime = metrics
      .filter(m => m.type === 'calendar_load')
      .reduce((sum, m, _, arr) => sum + m.value / arr.length, 0);
    
    if (avgLoadTime > 500) {
      recommendations.push('Optimalizujte načítavanie kalendára - aktuálny čas je príliš vysoký');
    }

    // API recommendations
    const slowAPICalls = metrics.filter(m => m.type === 'api_call' && m.value > 2000);
    if (slowAPICalls.length > 0) {
      recommendations.push('Optimalizujte pomalé API volania alebo implementujte timeout');
    }

    // Error recommendations
    const errorRate = (metrics.filter(m => m.type === 'error').length / metrics.length) * 100;
    if (errorRate > 5) {
      recommendations.push('Znížte error rate implementáciou lepšieho error handlingu');
    }

    return recommendations;
  }

  /**
   * Get real-time statistics
   */
  getRealTimeStats(): {
    activeMetrics: number;
    recentErrors: number;
    avgResponseTime: number;
    cacheHitRate: number;
  } {
    const recentMetrics = this.metrics.filter(m => Date.now() - m.timestamp < 60000); // Last minute
    const recentErrors = recentMetrics.filter(m => m.type === 'error').length;
    const recentAPICalls = recentMetrics.filter(m => m.type === 'api_call');
    const cacheHits = recentMetrics.filter(m => m.tags?.includes('cache-hit')).length;

    const avgResponseTime = recentAPICalls.length > 0
      ? recentAPICalls.reduce((sum, m) => sum + m.value, 0) / recentAPICalls.length
      : 0;

    const cacheHitRate = recentMetrics.length > 0
      ? (cacheHits / recentMetrics.length) * 100
      : 0;

    return {
      activeMetrics: recentMetrics.length,
      recentErrors,
      avgResponseTime,
      cacheHitRate
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Cleanup observers
   */
  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitor() {
  const [stats, setStats] = React.useState(performanceMonitor.getRealTimeStats());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStats(performanceMonitor.getRealTimeStats());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    trackCalendarLoad: performanceMonitor.trackCalendarLoad.bind(performanceMonitor),
    trackAPICall: performanceMonitor.trackAPICall.bind(performanceMonitor),
    trackNavigation: performanceMonitor.trackNavigation.bind(performanceMonitor),
    trackInteraction: performanceMonitor.trackInteraction.bind(performanceMonitor),
    trackError: performanceMonitor.trackError.bind(performanceMonitor),
    generateReport: performanceMonitor.generateReport.bind(performanceMonitor),
    clearMetrics: performanceMonitor.clearMetrics.bind(performanceMonitor)
  };
}

export default performanceMonitor;
