import { NextRequest, NextResponse } from 'next/server'
import { createRateLimit } from '@/lib/security'

const rateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute per IP
  message: 'Príliš veľa analytics požiadaviek'
})

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await rateLimit(request)
  if (rateLimitResponse) return rateLimitResponse
  
  try {
    const metric = await request.json()
    
    // Validate metric data
    if (!metric.name || typeof metric.value !== 'number') {
      return NextResponse.json(
        { error: 'Neplatné metric dáta' },
        { status: 400 }
      )
    }
    
    // Log web vitals (in production, send to analytics service)
    console.log('Web Vitals Metric:', {
      name: metric.name,
      value: metric.value,
      id: metric.id,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      url: request.headers.get('referer'),
    })
    
    // In production, you would send this data to your analytics service
    // await sendToAnalyticsService(metric)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Chyba pri spracovaní analytics dát' },
      { status: 500 }
    )
  }
}
