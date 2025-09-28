import { NextRequest, NextResponse } from 'next/server'
import { getAvailableApartments } from '@/services/apartments'

/**
 * API endpoint pre získanie dostupných apartmánov
 * GET /api/apartments/available?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD&guests=N
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { searchParams } = new URL(request.url)
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    const guests = searchParams.get('guests')
    
    // Validate required parameters
    if (!checkIn || !checkOut || !guests) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: checkIn, checkOut, guests'
      }, { status: 400 })
    }
    
    // Validate date format
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const guestCount = parseInt(guests)
    
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      }, { status: 400 })
    }
    
    if (isNaN(guestCount) || guestCount < 1 || guestCount > 20) {
      return NextResponse.json({
        success: false,
        error: 'Invalid guest count. Must be between 1 and 20'
      }, { status: 400 })
    }
    
    if (checkInDate >= checkOutDate) {
      return NextResponse.json({
        success: false,
        error: 'Check-out date must be after check-in date'
      }, { status: 400 })
    }
    
    // Get available apartments
    console.log(`🔍 API: Fetching available apartments for ${checkIn} to ${checkOut}, ${guests} guests`)
    const apartments = await getAvailableApartments(checkInDate, checkOutDate, guestCount)
    
    const response = {
      success: true,
      apartments,
      searchParams: {
        checkIn,
        checkOut,
        guests: guestCount
      },
      meta: {
        total: apartments.length,
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    }
    
    console.log(`✅ API: Found ${apartments.length} available apartments in ${Date.now() - startTime}ms`)
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // 5 minutes cache
        'X-Response-Time': `${Date.now() - startTime}ms`,
        'X-Total-Results': apartments.length.toString()
      }
    })
    
  } catch (error) {
    console.error('❌ API: Error fetching available apartments:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      meta: {
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })
  }
}
