/**
 * Advanced Performance Dashboard
 * Displays comprehensive performance metrics and analytics
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Clock, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  BarChart3,
  Zap,
  Server,
  Globe,
  Users
} from 'lucide-react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  apiResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  memoryUsage: number;
  activeConnections: number;
  requestsPerSecond: number;
}

interface ChartData {
  time: string;
  avgLoadTime: number;
  avgApiTime: number;
  errorRate: number;
  cacheHitRate: number;
}

export default function AdvancedPerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    apiResponseTime: 0,
    cacheHitRate: 0,
    errorRate: 0,
    memoryUsage: 0,
    activeConnections: 0,
    requestsPerSecond: 0
  });

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Mock data generation
  useEffect(() => {
    const generateMockData = () => {
      setMetrics({
        loadTime: Math.random() * 500 + 100,
        renderTime: Math.random() * 100 + 20,
        apiResponseTime: Math.random() * 300 + 50,
        cacheHitRate: Math.random() * 20 + 80,
        errorRate: Math.random() * 5,
        memoryUsage: Math.random() * 1000 + 500,
        activeConnections: Math.floor(Math.random() * 50 + 10),
        requestsPerSecond: Math.random() * 100 + 20
      });

      // Generate chart data
      const data: ChartData[] = [];
      for (let i = 0; i < 24; i++) {
        data.push({
          time: `${i}:00`,
          avgLoadTime: Math.random() * 400 + 100,
          avgApiTime: Math.random() * 200 + 50,
          errorRate: Math.random() * 3,
          cacheHitRate: Math.random() * 15 + 80
        });
      }
      setChartData(data);
      setLastUpdated(new Date());
      setIsLoading(false);
    };

    generateMockData();
    const interval = setInterval(generateMockData, 5000);
    return () => clearInterval(interval);
  }, []);

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setLastUpdated(new Date());
    }, 1000);
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (value <= thresholds.warning) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading performance data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time performance metrics and analytics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </Badge>
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Load Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.loadTime.toFixed(0)}ms</div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(metrics.loadTime, { good: 200, warning: 500 })}
              <span className={`text-xs ${getStatusColor(metrics.loadTime, { good: 200, warning: 500 })}`}>
                {metrics.loadTime <= 200 ? 'Excellent' : metrics.loadTime <= 500 ? 'Good' : 'Needs Attention'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Response</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.apiResponseTime.toFixed(0)}ms</div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(metrics.apiResponseTime, { good: 100, warning: 300 })}
              <span className={`text-xs ${getStatusColor(metrics.apiResponseTime, { good: 100, warning: 300 })}`}>
                {metrics.apiResponseTime <= 100 ? 'Fast' : metrics.apiResponseTime <= 300 ? 'Good' : 'Slow'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cacheHitRate.toFixed(1)}%</div>
            <Progress value={metrics.cacheHitRate} className="mt-2" />
            <div className="flex items-center space-x-2 mt-2">
              {getStatusIcon(100 - metrics.cacheHitRate, { good: 10, warning: 20 })}
              <span className={`text-xs ${getStatusColor(100 - metrics.cacheHitRate, { good: 10, warning: 20 })}`}>
                {metrics.cacheHitRate >= 90 ? 'Excellent' : metrics.cacheHitRate >= 80 ? 'Good' : 'Poor'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.errorRate.toFixed(2)}%</div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(metrics.errorRate, { good: 1, warning: 3 })}
              <span className={`text-xs ${getStatusColor(metrics.errorRate, { good: 1, warning: 3 })}`}>
                {metrics.errorRate <= 1 ? 'Low' : metrics.errorRate <= 3 ? 'Medium' : 'High'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">Chart placeholder - recharts not available</p>
                    <p className="text-sm text-gray-400 mt-1">Performance trends would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Memory Usage</span>
                  <span className="text-sm text-gray-600">{metrics.memoryUsage.toFixed(0)} MB</span>
                </div>
                <Progress value={(metrics.memoryUsage / 2000) * 100} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Connections</span>
                  <span className="text-sm text-gray-600">{metrics.activeConnections}</span>
                </div>
                <Progress value={(metrics.activeConnections / 100) * 100} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Requests/sec</span>
                  <span className="text-sm text-gray-600">{metrics.requestsPerSecond.toFixed(1)}</span>
                </div>
                <Progress value={(metrics.requestsPerSecond / 200) * 100} className="h-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Load Time Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">Chart placeholder - recharts not available</p>
                    <p className="text-sm text-gray-400 mt-1">Load time trends would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Response Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
                  <div className="text-center">
                    <Server className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">Chart placeholder - recharts not available</p>
                    <p className="text-sm text-gray-400 mt-1">API response times would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Cache Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
                  <div className="text-center">
                    <Database className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">Chart placeholder - recharts not available</p>
                    <p className="text-sm text-gray-400 mt-1">Cache performance would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
                  <div className="text-center">
                    <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">Chart placeholder - recharts not available</p>
                    <p className="text-sm text-gray-400 mt-1">Error rates would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Alerts */}
      {metrics.errorRate > 3 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            High error rate detected: {metrics.errorRate.toFixed(2)}%. Please investigate system issues.
          </AlertDescription>
        </Alert>
      )}

      {metrics.cacheHitRate < 80 && (
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            Cache hit rate is below optimal: {metrics.cacheHitRate.toFixed(1)}%. Consider cache optimization.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}