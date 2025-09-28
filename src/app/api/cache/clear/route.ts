import { NextRequest, NextResponse } from 'next/server';
import { availabilityCache } from '@/lib/cache';

/**
 * Clear cache endpoint for debugging
 * DELETE /api/cache/clear
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pattern = searchParams.get('pattern');
    const key = searchParams.get('key');

    if (pattern) {
      // Clear cache entries matching pattern
      await availabilityCache.invalidatePattern(pattern);
      return NextResponse.json({
        success: true,
        message: `Cache cleared for pattern: ${pattern}`
      });
    } else if (key) {
      // Clear specific cache key
      await availabilityCache.invalidateKey(key);
      return NextResponse.json({
        success: true,
        message: `Cache cleared for key: ${key}`
      });
    } else {
      // Clear all cache
      await availabilityCache.clearAll();
      return NextResponse.json({
        success: true,
        message: 'All cache cleared'
      });
    }

  } catch (error) {
    console.error('Cache clear error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Get cache stats
 * GET /api/cache/clear
 */
export async function GET() {
  try {
    const stats = await availabilityCache.getCacheStats();
    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Cache stats error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
