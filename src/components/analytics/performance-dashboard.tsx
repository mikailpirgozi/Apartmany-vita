'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Activity, 
  Database, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Download,
  Trash2
} from 'lucide-react';

interface DashboardData {
  timestamp: string;
  timeWindow: number;
  summary?: {
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
    cache: {
      hits: number;
      misses: number;
      hitRate: number;
      totalRequests: number;
      averageLoadTime: number;
    };
  };
  alerts?: Array<{
    type: 'slow_load' | 'high_error_rate' | 'low_cache_hit';
    message: string;
    severity: 'warning' | 'critical';
  }>;
  cacheStats?: {
    redis: { connected: boolean; keys?: number };
    memory: { keys: number; size: string };
  };
  overview?: {
    recentActivity: any[];
    topApartments: Array<{
      apartment: string;
      requests: number;
      avgLoadTime: number;
    }>;
    quickStats: {
      totalRequests: number;
      averageResponseTime: number;
      cacheHitRate: number;
      errorRate: number;
    };
  };
  insights?: Array<{
    type: 'success' | 'warning' | 'error';
    message: string;
    recommendation?: string;
  }>;
}

interface PerformanceDashboardProps {
  className?: string;
  refreshInterval?: number; // milliseconds
  showControls?: boolean;
}

export function PerformanceDashboard({ 
  className = '',
  refreshInterval = 30000, // 30 seconds
  showControls = true 
}: PerformanceDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [timeWindow, setTimeWindow] = useState(3600000); // 1 hour

  // Fetch dashboard data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/analytics/dashboard?timeWindow=${timeWindow}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setLastUpdated(new Date());
      } else {
        setError(result.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    fetchData();
    
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, timeWindow]);

  // Export data
  const exportData = async (format: 'json' | 'csv') => {
    try {
      const response = await fetch('/api/analytics/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          timeWindow,
          includeRawMetrics: true,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-export-${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  // Clear cache
  const clearCache = async () => {
    try {
      const response = await fetch('/api/analytics/dashboard?clearCache=true', {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchData(); // Refresh data after clearing
      }
    } catch (err) {
      console.error('Clear cache failed:', err);
    }
  };

  if (loading && !data) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Dashboard Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) return null;

  const formatTime = (ms: number) => `${Math.round(ms)}ms`;
  const formatPercent = (rate: number) => `${Math.round(rate * 100)}%`;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with controls */}
      {showControls && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Performance Dashboard</h2>
            <p className="text-muted-foreground">
              Last updated: {lastUpdated?.toLocaleTimeString() || 'Never'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={timeWindow}
              onChange={(e) => setTimeWindow(Number(e.target.value))}
              className="px-3 py-1 border rounded"
            >
              <option value={300000}>5 minutes</option>
              <option value={1800000}>30 minutes</option>
              <option value={3600000}>1 hour</option>
              <option value={21600000}>6 hours</option>
              <option value={86400000}>24 hours</option>
            </select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <Activity className="h-4 w-4 mr-1" />
              {autoRefresh ? 'Auto' : 'Manual'}
            </Button>
            
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => exportData('json')}>
              <Download className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" onClick={clearCache}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {data.overview && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.overview.quickStats.totalRequests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.overview.quickStats.averageResponseTime}ms</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.overview.quickStats.cacheHitRate}%</div>
              <Progress value={data.overview.quickStats.cacheHitRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.overview.quickStats.errorRate}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts */}
      {data.alerts && data.alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Performance Alerts</h3>
          {data.alerts.map((alert, index) => (
            <Alert 
              key={index}
              variant={alert.severity === 'critical' ? 'destructive' : 'default'}
            >
              {alert.severity === 'critical' ? (
                <XCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertTitle className="capitalize">{alert.severity} Alert</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Insights */}
      {data.insights && data.insights.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Performance Insights</h3>
          {data.insights.map((insight, index) => (
            <Alert 
              key={index}
              variant={insight.type === 'error' ? 'destructive' : 'default'}
            >
              {insight.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : insight.type === 'error' ? (
                <XCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertTitle>{insight.message}</AlertTitle>
              {insight.recommendation && (
                <AlertDescription>{insight.recommendation}</AlertDescription>
              )}
            </Alert>
          ))}
        </div>
      )}

      {/* Detailed Metrics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="apartments">Apartments</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          {data.summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Calendar Performance</CardTitle>
                  <CardDescription>Calendar loading and navigation metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Loads:</span>
                    <Badge variant="secondary">{data.summary.calendar.totalLoads}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Load Time:</span>
                    <Badge variant="secondary">{formatTime(data.summary.calendar.averageLoadTime)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Cache Hit Rate:</span>
                    <Badge variant="secondary">{formatPercent(data.summary.calendar.cacheHitRate)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Error Rate:</span>
                    <Badge 
                      variant={data.summary.calendar.errorRate > 0.05 ? 'destructive' : 'secondary'}
                    >
                      {formatPercent(data.summary.calendar.errorRate)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Performance</CardTitle>
                  <CardDescription>Backend API response metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Requests:</span>
                    <Badge variant="secondary">{data.summary.api.totalRequests}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Response Time:</span>
                    <Badge variant="secondary">{formatTime(data.summary.api.averageResponseTime)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <Badge 
                      variant={data.summary.api.successRate < 0.95 ? 'destructive' : 'secondary'}
                    >
                      {formatPercent(data.summary.api.successRate)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Cache Statistics</CardTitle>
                <CardDescription>Redis and memory cache performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.cacheStats && (
                  <>
                    <div className="flex justify-between">
                      <span>Redis Status:</span>
                      <Badge variant={data.cacheStats.redis.connected ? 'default' : 'destructive'}>
                        {data.cacheStats.redis.connected ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Redis Keys:</span>
                      <Badge variant="secondary">{data.cacheStats.redis.keys || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Memory Keys:</span>
                      <Badge variant="secondary">{data.cacheStats.memory.keys}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Memory Size:</span>
                      <Badge variant="secondary">{data.cacheStats.memory.size}</Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {data.summary && (
              <Card>
                <CardHeader>
                  <CardTitle>Cache Performance</CardTitle>
                  <CardDescription>Cache hit/miss statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Cache Hits:</span>
                    <Badge variant="secondary">{data.summary.cache.hits}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Cache Misses:</span>
                    <Badge variant="secondary">{data.summary.cache.misses}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Hit Rate:</span>
                    <Badge 
                      variant={data.summary.cache.hitRate < 0.8 ? 'destructive' : 'default'}
                    >
                      {formatPercent(data.summary.cache.hitRate)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Cache Load Time:</span>
                    <Badge variant="secondary">{formatTime(data.summary.cache.averageLoadTime)}</Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="apartments" className="space-y-4">
          {data.overview?.topApartments && (
            <Card>
              <CardHeader>
                <CardTitle>Top Apartments by Activity</CardTitle>
                <CardDescription>Most requested apartments in the current time window</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.overview.topApartments.map((apartment, index) => (
                    <div key={apartment.apartment} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="font-medium">{apartment.apartment}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{apartment.requests} requests</span>
                        <span>{formatTime(apartment.avgLoadTime)} avg</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
