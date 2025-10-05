import { NextRequest, NextResponse } from 'next/server';
import { availabilityCache } from '@/lib/cache';

/**
 * Clear availability cache for debugging
 * GET /api/beds24/clear-cache?apartment=lite-apartman
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apartment = searchParams.get('apartment');
    
    if (!apartment) {
      return NextResponse.json({
        success: false,
        error: 'Missing apartment parameter'
      }, { status: 400 });
    }

    // Clear cache for this apartment (all date ranges)
    await availabilityCache.invalidatePattern(`${apartment}:*`);
    
    console.log(`✅ Cache cleared for apartment: ${apartment}`);
    
    return NextResponse.json({
      success: true,
      message: `Cache cleared for ${apartment}`
    });
    
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
