import { NextResponse } from 'next/server'
import { getGoogleReviewsWithCache } from '@/services/google-reviews'

export async function GET() {
  try {
    const reviews = await getGoogleReviewsWithCache()
    
    return NextResponse.json(reviews, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    })
  } catch (error) {
    console.error('Error in Google Reviews API:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch reviews',
        reviews: [],
        averageRating: 4.8,
        totalReviews: 0,
        status: 'error'
      },
      { status: 500 }
    )
  }
}
