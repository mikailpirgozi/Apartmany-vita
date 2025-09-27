import { NextResponse } from 'next/server';
import { mockApartments } from '@/lib/mock-data';

export async function GET() {
  try {
    // Return mock apartments data
    // In production, this would fetch from database
    return NextResponse.json(mockApartments, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (error) {
    console.error('Error fetching apartments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch apartments' },
      { status: 500 }
    );
  }
}
