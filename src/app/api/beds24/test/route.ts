import { NextRequest, NextResponse } from 'next/server';
import { runBeds24Tests } from '@/lib/beds24-test';

/**
 * Test Beds24 API connection and functionality
 * GET /api/beds24/test?propId=xxx&roomId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propId = searchParams.get('propId');
    const roomId = searchParams.get('roomId');

    console.log('Testing Beds24 API with:', { propId, roomId });

    const results = await runBeds24Tests(propId || undefined, roomId || undefined);

    return NextResponse.json({
      success: true,
      message: 'Beds24 API tests completed',
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Beds24 API test error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Beds24 API test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
