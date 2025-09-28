"use client";

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Clock, 
  Database, 
  Zap, 
  RefreshCw, 
  TrendingUp,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerformanceMetrics {
  cacheHitRate: number;
  averageLoadTime: number;
  totalRequests: number;
  cachedRequests: number;
  prefetchSuccessRate: number;
  navigationSpeed: number;
}

interface CalendarPerformanceMonitorProps {
  apartmentSlug: string;
  className?: string;
}

export function CalendarPerformanceMonitor({ 
  apartmentSlug, 
  className 
}: CalendarPerformanceMonitorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cacheHitRate: 0,
    averageLoadTime: 0,
    totalRequests: 0,
    cachedRequests: 0,
    prefetchSuccessRate: 0,
    navigationSpeed: 0
  });
  
  const queryClient = useQueryClient();

  useEffect(() => {
    // Calculate metrics from query cache
    const calculateMetrics = () => {
      const queries = queryClient.getQueryCache().getAll();
      const availabilityQueries = queries.filter(q => 
        q.queryKey[0] === 'availability' && 
        q.queryKey[1] === apartmentSlug
      );

      const totalQueries = availabilityQueries.length;
      const cachedQueries = availabilityQueries.filter(q => 
        q.state.data && q.state.dataUpdatedAt > 0
      ).length;

      const cacheHitRate = totalQueries > 0 ? (cachedQueries / totalQueries) * 100 : 0;

      // Get performance data from localStorage if available
      const perfData = localStorage.getItem(`calendar-perf-${apartmentSlug}`);
      let storedMetrics = {};
      
      if (perfData) {
        try {
          storedMetrics = JSON.parse(perfData);
        } catch (e) {
          console.warn('Failed to parse performance data:', e);
        }
      }

      setMetrics({
        cacheHitRate: Math.round(cacheHitRate),
        averageLoadTime: (storedMetrics as any)?.averageLoadTime || 0,
        totalRequests: totalQueries,
        cachedRequests: cachedQueries,
        prefetchSuccessRate: (storedMetrics as any)?.prefetchSuccessRate || 0,
        navigationSpeed: (storedMetrics as any)?.navigationSpeed || 0
      });
    };

    // Calculate metrics initially and on interval
    calculateMetrics();
    const interval = setInterval(calculateMetrics, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, [apartmentSlug, queryClient]);

  const clearCache = () => {
    queryClient.invalidateQueries({
      queryKey: ['availability', apartmentSlug]
    });
    
    // Clear performance data
    localStorage.removeItem(`calendar-perf-${apartmentSlug}`);
    
    setMetrics({
      cacheHitRate: 0,
      averageLoadTime: 0,
      totalRequests: 0,
      cachedRequests: 0,
      prefetchSuccessRate: 0,
      navigationSpeed: 0
    });
  };

  const getPerformanceGrade = (cacheHitRate: number): { grade: string; color: string } => {
    if (cacheHitRate >= 90) return { grade: 'A+', color: 'text-green-600' };
    if (cacheHitRate >= 80) return { grade: 'A', color: 'text-green-500' };
    if (cacheHitRate >= 70) return { grade: 'B', color: 'text-yellow-500' };
    if (cacheHitRate >= 60) return { grade: 'C', color: 'text-orange-500' };
    return { grade: 'D', color: 'text-red-500' };
  };

  const { grade, color } = getPerformanceGrade(metrics.cacheHitRate);

  if (!isVisible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Eye className="h-4 w-4 mr-2" />
        Performance
      </Button>
    );
  }

  return (
    <Card className={cn("fixed bottom-4 right-4 z-50 w-80", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Calendar Performance
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={cn("text-xs", color)}>
              {grade}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              <EyeOff className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Cache Hit Rate */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs">Cache Hit Rate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${metrics.cacheHitRate}%` }}
              />
            </div>
            <span className="text-xs font-medium">{metrics.cacheHitRate}%</span>
          </div>
        </div>

        {/* Load Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs">Avg Load Time</span>
          </div>
          <span className="text-xs font-medium">
            {metrics.averageLoadTime > 0 ? `${metrics.averageLoadTime}ms` : 'N/A'}
          </span>
        </div>

        {/* Navigation Speed */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs">Navigation</span>
          </div>
          <span className="text-xs font-medium">
            {metrics.navigationSpeed > 0 ? `${metrics.navigationSpeed}ms` : 'N/A'}
          </span>
        </div>

        {/* Prefetch Success */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs">Prefetch Success</span>
          </div>
          <span className="text-xs font-medium">
            {metrics.prefetchSuccessRate > 0 ? `${metrics.prefetchSuccessRate}%` : 'N/A'}
          </span>
        </div>

        {/* Cache Stats */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Cached: {metrics.cachedRequests}</span>
            <span>Total: {metrics.totalRequests}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearCache}
            className="flex-1 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Clear Cache
          </Button>
        </div>

        {/* Performance Tips */}
        {metrics.cacheHitRate < 70 && (
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
            💡 Tip: Navigate between months to see cache improvements
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Hook for tracking performance metrics
export function useCalendarPerformanceTracking(apartmentSlug: string) {
  useEffect(() => {
    // Track page load performance
    const trackPageLoad = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      
      if (loadTime > 0) {
        const perfKey = `calendar-perf-${apartmentSlug}`;
        const existingData = localStorage.getItem(perfKey);
        let perfData = { loadTimes: [], navigationTimes: [], prefetchSuccess: 0 };
        
        if (existingData) {
          try {
            perfData = JSON.parse(existingData);
          } catch (e) {
            console.warn('Failed to parse existing performance data');
          }
        }
        
        perfData.loadTimes.push(loadTime);
        
        // Keep only last 10 measurements
        if (perfData.loadTimes.length > 10) {
          perfData.loadTimes = perfData.loadTimes.slice(-10);
        }
        
        // Calculate average
        const averageLoadTime = Math.round(
          perfData.loadTimes.reduce((a, b) => a + b, 0) / perfData.loadTimes.length
        );
        
        localStorage.setItem(perfKey, JSON.stringify({
          ...perfData,
          averageLoadTime
        }));
      }
    };

    // Track after page is fully loaded
    if (document.readyState === 'complete') {
      trackPageLoad();
    } else {
      window.addEventListener('load', trackPageLoad);
      return () => window.removeEventListener('load', trackPageLoad);
    }
  }, [apartmentSlug]);
}
