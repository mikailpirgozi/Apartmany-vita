import { NextRequest, NextResponse } from 'next/server';
import { analytics } from '@/lib/analytics';
import { availabilityCache } from '@/lib/cache';
import { z } from 'zod';

// Request validation schema
const DashboardRequestSchema = z.object({
  timeWindow: z.coerce.number().min(300000).max(86400000).optional().default(3600000), // 5min to 24h, default 1h
  apartment: z.string().optional(),
  includeMetrics: z.coerce.boolean().optional().default(true),
  includeAlerts: z.coerce.boolean().optional().default(true),
  includeCache: z.coerce.boolean().optional().default(true),
});

/**
 * GET /api/analytics/dashboard
 * Real-time performance monitoring dashboard
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    // Parse and validate query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const { timeWindow, apartment, includeMetrics, includeAlerts, includeCache } = 
      DashboardRequestSchema.parse(searchParams);

    const dashboardData: {
      timestamp: string;
      timeWindow: number;
      apartment: string;
      apartmentMetrics?: {
        apartment: string;
        totalRequests: number;
        averageLoadTime: number;
        cacheHitRate: number;
        errorCount: number;
        recentMetrics: unknown[];
      };
      summary?: unknown;
      alerts?: unknown;
      cacheStats?: {
        redis: { connected: boolean };
        memory: { keys: number; size: string };
        error?: string;
      };
      overview?: {
        recentActivity: unknown;
        topApartments: unknown;
        quickStats: {
          totalRequests: number;
          averageResponseTime: number;
          cacheHitRate: number;
          errorRate: number;
        };
      };
      insights?: unknown[];
    } = {
      timestamp: new Date().toISOString(),
      timeWindow,
      apartment: apartment || 'all',
    };

    // Get performance summary
    if (includeMetrics) {
      if (apartment) {
        // Apartment-specific metrics
        const apartmentMetrics = analytics.getApartmentMetrics(apartment, timeWindow);
        dashboardData.apartmentMetrics = {
          apartment,
          totalRequests: apartmentMetrics.length,
          averageLoadTime: apartmentMetrics.length > 0 
            ? apartmentMetrics.reduce((sum, m) => sum + m.loadTime, 0) / apartmentMetrics.length 
            : 0,
          cacheHitRate: apartmentMetrics.length > 0 
            ? apartmentMetrics.filter(m => m.cacheHit).length / apartmentMetrics.length 
            : 0,
          errorCount: apartmentMetrics.filter(m => m.type === 'calendar_error').length,
          recentMetrics: apartmentMetrics.slice(-10), // Last 10 metrics
        };
      } else {
        // Overall performance summary
        dashboardData.summary = analytics.getPerformanceSummary(timeWindow);
      }
    }

    // Get performance alerts
    if (includeAlerts) {
      dashboardData.alerts = analytics.getPerformanceAlerts();
    }

    // Get cache statistics
    if (includeCache) {
      try {
        dashboardData.cacheStats = await availabilityCache.getCacheStats();
      } catch (error) {
        console.warn('Failed to get cache stats:', error);
        dashboardData.cacheStats = {
          redis: { connected: false },
          memory: { keys: 0, size: '0KB' },
          error: 'Failed to retrieve cache statistics'
        };
      }
    }

    // Get dashboard overview data
    const dashboardOverview = analytics.getDashboardData();
    dashboardData.overview = {
      recentActivity: dashboardOverview.recentMetrics,
      topApartments: dashboardOverview.topApartments,
      quickStats: {
        totalRequests: dashboardOverview.summary.calendar.totalLoads + dashboardOverview.summary.api.totalRequests,
        averageResponseTime: Math.round(
          (dashboardOverview.summary.calendar.averageLoadTime + dashboardOverview.summary.api.averageResponseTime) / 2
        ),
        cacheHitRate: Math.round(dashboardOverview.summary.cache.hitRate * 100),
        errorRate: Math.round(dashboardOverview.summary.calendar.errorRate * 100),
      }
    };

    // Performance insights
    dashboardData.insights = generatePerformanceInsights({
      summary: dashboardData.summary as {
        cache: { hitRate: number };
        calendar: { averageLoadTime: number; errorRate: number };
        api: { averageResponseTime: number };
      }
    });

    return NextResponse.json({
      success: true,
      data: dashboardData,
      generatedAt: new Date().toISOString(),
      responseTime: Date.now() - startTime,
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': `${Date.now() - startTime}ms`,
      }
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      responseTime: Date.now() - startTime,
    }, { status: 500 });
  }
}

/**
 * POST /api/analytics/dashboard
 * Export dashboard data in various formats
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    const ExportRequestSchema = z.object({
      format: z.enum(['json', 'csv']).default('json'),
      timeWindow: z.number().min(300000).max(86400000).optional().default(3600000),
      includeRawMetrics: z.boolean().optional().default(false),
    });

    const { format, timeWindow, includeRawMetrics } = ExportRequestSchema.parse(body);

    const exportData: {
      exportedAt: string;
      timeWindow: number;
      summary: unknown;
      alerts: unknown;
      rawMetrics?: unknown;
      cacheStats?: {
        redis: { connected: boolean; keys?: number };
        memory: { keys: number; size: string };
        error?: string;
      };
    } = {
      exportedAt: new Date().toISOString(),
      timeWindow,
      summary: analytics.getPerformanceSummary(timeWindow),
      alerts: analytics.getPerformanceAlerts(),
    };

    if (includeRawMetrics) {
      exportData.rawMetrics = analytics.exportMetrics(format, timeWindow);
    }

    // Add cache statistics
    try {
      exportData.cacheStats = await availabilityCache.getCacheStats();
    } catch {
      exportData.cacheStats = {
        redis: { connected: false },
        memory: { keys: 0, size: '0KB' },
        error: 'Failed to retrieve cache stats'
      };
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = convertToCsv({
        ...exportData,
        summary: exportData.summary as {
          calendar: { totalLoads: number; averageLoadTime: number; errorRate: number };
          cache: { hitRate: number };
          api: { totalRequests: number; averageResponseTime: number };
        }
      });
      
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="dashboard-export-${Date.now()}.csv"`,
        }
      });
    }

    return NextResponse.json({
      success: true,
      format,
      data: exportData,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="dashboard-export-${Date.now()}.json"`,
      }
    });

  } catch (error) {
    console.error('Dashboard export error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Export failed',
    }, { status: 500 });
  }
}

/**
 * DELETE /api/analytics/dashboard
 * Clear analytics data and cache
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    
    const ClearRequestSchema = z.object({
      clearMetrics: z.coerce.boolean().optional().default(false),
      clearCache: z.coerce.boolean().optional().default(false),
      apartment: z.string().optional(),
    });

    const { clearMetrics, clearCache, apartment } = ClearRequestSchema.parse(searchParams);

    const results: {
      cleared: string[];
      errors: string[];
    } = {
      cleared: [],
      errors: [],
    };

    // Clear analytics metrics
    if (clearMetrics) {
      try {
        analytics.cleanup(); // This clears old metrics
        results.cleared.push('analytics_metrics');
      } catch (error) {
        results.errors.push(`Failed to clear metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Clear cache
    if (clearCache) {
      try {
        if (apartment) {
          const pattern = `${apartment}:*`;
          await availabilityCache.invalidatePattern(pattern);
          results.cleared.push(`cache_for_${apartment}`);
        } else {
          await availabilityCache.clearAll();
          results.cleared.push('all_cache');
        }
      } catch (error) {
        results.errors.push(`Failed to clear cache: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleared: ${results.cleared.join(', ')}`,
      results,
    });

  } catch (error) {
    console.error('Dashboard clear error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Clear operation failed',
    }, { status: 500 });
  }
}

/**
 * Generate performance insights based on dashboard data
 */
function generatePerformanceInsights(dashboardData: {
  summary?: {
    cache: { hitRate: number };
    calendar: { averageLoadTime: number; errorRate: number };
    api: { averageResponseTime: number };
  };
}): {
  type: 'success' | 'warning' | 'error';
  message: string;
  recommendation?: string;
}[] {
  const insights: {
    type: 'success' | 'warning' | 'error';
    message: string;
    recommendation?: string;
  }[] = [];
  
  const summary = dashboardData.summary;
  if (!summary) return insights;

  // Cache performance insights
  if (summary.cache.hitRate > 0.9) {
    insights.push({
      type: 'success',
      message: `Excellent cache performance: ${Math.round(summary.cache.hitRate * 100)}% hit rate`,
    });
  } else if (summary.cache.hitRate < 0.7) {
    insights.push({
      type: 'warning',
      message: `Low cache hit rate: ${Math.round(summary.cache.hitRate * 100)}%`,
      recommendation: 'Consider increasing cache TTL or checking cache invalidation patterns',
    });
  }

  // Response time insights
  if (summary.calendar.averageLoadTime < 500) {
    insights.push({
      type: 'success',
      message: `Fast calendar loading: ${Math.round(summary.calendar.averageLoadTime)}ms average`,
    });
  } else if (summary.calendar.averageLoadTime > 2000) {
    insights.push({
      type: 'error',
      message: `Slow calendar loading: ${Math.round(summary.calendar.averageLoadTime)}ms average`,
      recommendation: 'Check API performance and consider cache optimization',
    });
  }

  // Error rate insights
  if (summary.calendar.errorRate > 0.05) {
    insights.push({
      type: 'error',
      message: `High error rate: ${Math.round(summary.calendar.errorRate * 100)}%`,
      recommendation: 'Investigate API reliability and implement better error handling',
    });
  } else if (summary.calendar.errorRate === 0) {
    insights.push({
      type: 'success',
      message: 'No errors detected in the current time window',
    });
  }

  // API performance insights
  if (summary.api.averageResponseTime > 3000) {
    insights.push({
      type: 'warning',
      message: `Slow API responses: ${Math.round(summary.api.averageResponseTime)}ms average`,
      recommendation: 'Consider API optimization or increase cache duration',
    });
  }

  return insights;
}

/**
 * Convert dashboard data to CSV format
 */
function convertToCsv(data: {
  exportedAt: string;
  summary?: {
    calendar: { totalLoads: number; averageLoadTime: number; errorRate: number };
    cache: { hitRate: number };
    api: { totalRequests: number; averageResponseTime: number };
  };
  cacheStats?: {
    error?: string;
    redis: { connected: boolean; keys?: number };
    memory: { keys: number };
  };
}): string {
  const lines: string[] = [];
  
  // Header
  lines.push('Metric,Value,Timestamp');
  
  // Summary data
  if (data.summary) {
    const summary = data.summary;
    lines.push(`Calendar Total Loads,${summary.calendar.totalLoads},${data.exportedAt}`);
    lines.push(`Calendar Average Load Time,${Math.round(summary.calendar.averageLoadTime)},${data.exportedAt}`);
    lines.push(`Cache Hit Rate,${Math.round(summary.cache.hitRate * 100)},${data.exportedAt}`);
    lines.push(`Error Rate,${Math.round(summary.calendar.errorRate * 100)},${data.exportedAt}`);
    lines.push(`API Total Requests,${summary.api.totalRequests},${data.exportedAt}`);
    lines.push(`API Average Response Time,${Math.round(summary.api.averageResponseTime)},${data.exportedAt}`);
  }

  // Cache stats
  if (data.cacheStats && !data.cacheStats.error) {
    lines.push(`Redis Connected,${data.cacheStats.redis.connected},${data.exportedAt}`);
    lines.push(`Redis Keys,${data.cacheStats.redis.keys || 0},${data.exportedAt}`);
    lines.push(`Memory Cache Keys,${data.cacheStats.memory.keys},${data.exportedAt}`);
  }

  return lines.join('\n');
}
