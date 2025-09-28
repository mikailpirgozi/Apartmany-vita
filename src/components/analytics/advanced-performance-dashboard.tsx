/**
 * Advanced Performance Dashboard
 * Real-time monitoring and visualization of calendar performance
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Activity, 
  Clock, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  TrendingDown,
  Zap,
  Globe,
  Server,
  Users
} from 'lucide-react';
import { usePerformanceMonitor } from '@/lib/performance-monitor';
import { cn } from '@/lib/utils';

interface PerformanceDashboardProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function AdvancedPerformanceDashboard({
  className,
  autoRefresh = true,
  refreshInterval = 5000
}: PerformanceDashboardProps) {
  const { stats, generateReport, clearMetrics } = usePerformanceMonitor();
  const [report, setReport] = useState<any>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d'>('1h');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-refresh data
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, selectedTimeRange]);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [selectedTimeRange]);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const now = Date.now();
      const timeRanges = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000
      };
      
      const timeRange = {
        start: now - timeRanges[selectedTimeRange],
        end: now
      };

      const newReport = generateReport(timeRange);
      setReport(newReport);
    } catch (error) {
      console.error('Failed to generate performance report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getHealthScore = () => {
    if (!report) return 0;
    
    let score = 100;
    
    // Penalize for violations
    score -= report.violations.length * 10;
    
    // Penalize for high error rate
    if (report.summary.errorRate > 5) score -= 20;
    if (report.summary.errorRate > 10) score -= 30;
    
    // Penalize for low cache hit rate
    if (report.summary.cacheHitRate < 80) score -= 15;
    if (report.summary.cacheHitRate < 60) score -= 25;
    
    // Penalize for slow load times
    if (report.summary.averageLoadTime > 500) score -= 15;
    if (report.summary.averageLoadTime > 1000) score -= 25;
    
    return Math.max(0, score);
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 70) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!report?.metrics) return [];

    const groupedByHour = report.metrics.reduce((acc: any, metric: any) => {
      const hour = new Date(metric.timestamp).getHours();
      const key = `${hour}:00`;
      
      if (!acc[key]) {
        acc[key] = {
          time: key,
          loadTime: [],
          apiCalls: [],
          errors: 0,
          cacheHits: 0,
          total: 0
        };
      }
      
      acc[key].total++;
      
      if (metric.type === 'calendar_load') {
        acc[key].loadTime.push(metric.value);
      }
      
      if (metric.type === 'api_call') {
        acc[key].apiCalls.push(metric.value);
      }
      
      if (metric.type === 'error') {
        acc[key].errors++;
      }
      
      if (metric.tags?.includes('cache-hit')) {
        acc[key].cacheHits++;
      }
      
      return acc;
    }, {});

    return Object.values(groupedByHour).map((item: any) => ({
      time: item.time,
      avgLoadTime: item.loadTime.length > 0 
        ? item.loadTime.reduce((a: number, b: number) => a + b, 0) / item.loadTime.length 
        : 0,
      avgApiTime: item.apiCalls.length > 0
        ? item.apiCalls.reduce((a: number, b: number) => a + b, 0) / item.apiCalls.length
        : 0,
      errorRate: item.total > 0 ? (item.errors / item.total) * 100 : 0,
      cacheHitRate: item.total > 0 ? (item.cacheHits / item.total) * 100 : 0
    }));
  };

  const chartData = prepareChartData();
  const healthScore = getHealthScore();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time monitoring kalendára a API výkonnosti
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Tabs value={selectedTimeRange} onValueChange={(value: any) => setSelectedTimeRange(value)}>
            <TabsList>
              <TabsTrigger value="1h">1H</TabsTrigger>
              <TabsTrigger value="24h">24H</TabsTrigger>
              <TabsTrigger value="7d">7D</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={isLoading}
          >
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearMetrics}
          >
            Clear Data
          </Button>
        </div>
      </div>

      {/* Health Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Health Score</CardTitle>
          {getHealthIcon(healthScore)}
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Progress value={healthScore} className="h-2" />
            </div>
            <div className={cn("text-2xl font-bold", getHealthColor(healthScore))}>
              {healthScore.toFixed(0)}%
            </div>
          </div>
          
          {report?.violations && report.violations.length > 0 && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {report.violations.length} performance budget violations detected
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Load Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {report?.summary.averageLoadTime?.toFixed(0) || 0}ms
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.avgResponseTime < 500 ? (
                <span className="text-green-600 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Excellent
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Needs improvement
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {report?.summary.cacheHitRate?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              <Badge variant={stats.cacheHitRate > 80 ? "default" : "destructive"}>
                {stats.cacheHitRate > 80 ? "Good" : "Poor"}
              </Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {report?.summary.errorRate?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              <Badge variant={stats.recentErrors === 0 ? "default" : "destructive"}>
                {stats.recentErrors} recent errors
              </Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Metrics</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activeMetrics}
            </div>
            <p className="text-xs text-muted-foreground">
              Last minute activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Load Time Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="avgLoadTime" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Avg Load Time (ms)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cache Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="cacheHitRate" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      name="Cache Hit Rate (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>API Response Times</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgApiTime" fill="#8884d8" name="API Time (ms)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="errorRate" fill="#ff7300" name="Error Rate (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              {report?.recommendations && report.recommendations.length > 0 ? (
                <div className="space-y-3">
                  {report.recommendations.map((rec: string, index: number) => (
                    <Alert key={index}>
                      <Zap className="h-4 w-4" />
                      <AlertDescription>{rec}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No recommendations - performance is optimal!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdvancedPerformanceDashboard;
