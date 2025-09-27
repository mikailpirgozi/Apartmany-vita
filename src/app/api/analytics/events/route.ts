import { NextRequest, NextResponse } from 'next/server'
import { createRateLimit } from '@/lib/security'

const rateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20, // 20 events per minute per IP
  message: 'Príliš veľa event tracking požiadaviek'
})

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await rateLimit(request)
  if (rateLimitResponse) return rateLimitResponse
  
  try {
    const eventData = await request.json()
    
    // Validate event data
    if (!eventData.event || typeof eventData.event !== 'string') {
      return NextResponse.json(
        { error: 'Neplatné event dáta' },
        { status: 400 }
      )
    }
    
    // Log event (in production, send to analytics service)
    console.log('Custom Event:', {
      event: eventData.event,
      parameters: eventData.parameters || {},
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      url: request.headers.get('referer'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    })
    
    // In production, you would send this data to your analytics service
    // await sendEventToAnalyticsService(eventData)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Event tracking error:', error)
    return NextResponse.json(
      { error: 'Chyba pri spracovaní event dát' },
      { status: 500 }
    )
  }
}
