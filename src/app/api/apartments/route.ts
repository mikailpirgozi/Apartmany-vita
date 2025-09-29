import { NextResponse } from 'next/server';
import { getApartments } from '@/services/apartments';

export async function GET() {
  try {
    // Fetch apartments from database with fallback to static data
    const apartments = await getApartments();
    
    return NextResponse.json(apartments, {
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
