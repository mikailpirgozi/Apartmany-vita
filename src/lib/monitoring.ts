/**
 * Monitoring and analytics utilities
 */

// Web Vitals tracking
export interface WebVitalsMetric {
  name: 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB'
  value: number
  id: string
  delta: number
}

export function trackWebVitals(metric: WebVitalsMetric) {
  // Send to Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    })
  }
  
  // Send to custom analytics endpoint
  if (typeof window !== 'undefined') {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric),
    }).catch(console.error)
  }
  
  console.log(`${metric.name}:`, metric.value)
}

// Custom event tracking
export function trackEvent(eventName: string, parameters: Record<string, any> = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters)
  }
  
  // Send to custom analytics
  fetch('/api/analytics/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: eventName, parameters }),
  }).catch(console.error)
}

// Booking funnel tracking
export function trackBookingStep(step: string, apartmentId: string, additionalData: Record<string, any> = {}) {
  trackEvent('booking_step', {
    step,
    apartment_id: apartmentId,
    ...additionalData
  })
}

export function trackBookingConversion(bookingData: {
  apartmentId: string
  totalPrice: number
  nights: number
  guests: number
}) {
  trackEvent('booking_completed', {
    event_category: 'ecommerce',
    event_label: bookingData.apartmentId,
    value: bookingData.totalPrice,
    custom_parameters: {
      nights: bookingData.nights,
      guests: bookingData.guests,
    }
  })
}

// Search tracking
export function trackSearch(searchParams: {
  checkin: string
  checkout: string
  guests: number
  resultsCount: number
}) {
  trackEvent('apartment_search', {
    event_category: 'search',
    search_term: `${searchParams.checkin}_${searchParams.checkout}_${searchParams.guests}`,
    custom_parameters: {
      results_count: searchParams.resultsCount,
    }
  })
}

// Error tracking
export function trackError(error: Error, context: Record<string, any> = {}) {
  console.error('Application Error:', error, context)
  
  // Send to Sentry (if configured)
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.captureException(error, {
      contexts: { custom: context }
    })
  }
  
  // Send to custom error tracking
  fetch('/api/analytics/errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: error.message,
      stack: error.stack,
      context,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    }),
  }).catch(console.error)
}

// Performance monitoring
export function trackPerformance(metric: {
  name: string
  value: number
  context?: Record<string, any>
}) {
  trackEvent('performance_metric', {
    event_category: 'performance',
    event_label: metric.name,
    value: metric.value,
    custom_parameters: metric.context || {}
  })
}

// User behavior tracking
export function trackUserAction(action: string, target: string, value?: number) {
  trackEvent('user_action', {
    event_category: 'engagement',
    event_label: `${action}_${target}`,
    value: value || 1
  })
}

// Page view tracking
export function trackPageView(url: string, title: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID!, {
      page_title: title,
      page_location: url,
    })
  }
}

// Conversion tracking
export function trackConversion(conversionId: string, value: number, currency = 'EUR') {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: conversionId,
      value: value,
      currency: currency,
    })
  }
}

// A/B test tracking
export function trackABTest(testName: string, variant: string) {
  trackEvent('ab_test', {
    event_category: 'experiment',
    event_label: testName,
    custom_parameters: {
      variant: variant
    }
  })
}

// Newsletter signup tracking
export function trackNewsletterSignup(source: string) {
  trackEvent('newsletter_signup', {
    event_category: 'engagement',
    event_label: source,
  })
}

// Social media tracking
export function trackSocialShare(platform: string, url: string) {
  trackEvent('social_share', {
    event_category: 'social',
    event_label: platform,
    custom_parameters: {
      url: url
    }
  })
}

// Chat interaction tracking
export function trackChatInteraction(action: 'open' | 'close' | 'message_sent', messageCount?: number) {
  trackEvent('chat_interaction', {
    event_category: 'support',
    event_label: action,
    value: messageCount || 1
  })
}

// Real User Monitoring (RUM)
export function initializeRUM() {
  if (typeof window === 'undefined') return
  
  // Track page load time
  window.addEventListener('load', () => {
    const loadTime = performance.now()
    trackPerformance({
      name: 'page_load_time',
      value: Math.round(loadTime)
    })
  })
  
  // Track navigation timing
  if ('navigation' in performance) {
    const nav = performance.navigation
    trackPerformance({
      name: 'navigation_type',
      value: nav.type,
      context: {
        redirect_count: nav.redirectCount
      }
    })
  }
  
  // Track resource timing
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'resource') {
        const resource = entry as PerformanceResourceTiming
        if (resource.duration > 1000) { // Track slow resources
          trackPerformance({
            name: 'slow_resource',
            value: Math.round(resource.duration),
            context: {
              name: resource.name,
              type: resource.initiatorType
            }
          })
        }
      }
    }
  })
  
  observer.observe({ entryTypes: ['resource'] })
}

// Health check monitoring
export async function performHealthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  checks: Record<string, boolean>
}> {
  const checks: Record<string, boolean> = {}
  
  try {
    // Check API health
    const apiResponse = await fetch('/api/health', { method: 'HEAD' })
    checks.api = apiResponse.ok
    
    // Check database connectivity (if applicable)
    // This would typically be done server-side
    checks.database = true // Placeholder
    
    // Check external services
    checks.stripe = true // Placeholder
    checks.email = true // Placeholder
    
    const healthyChecks = Object.values(checks).filter(Boolean).length
    const totalChecks = Object.keys(checks).length
    
    let status: 'healthy' | 'degraded' | 'unhealthy'
    if (healthyChecks === totalChecks) {
      status = 'healthy'
    } else if (healthyChecks >= totalChecks * 0.7) {
      status = 'degraded'
    } else {
      status = 'unhealthy'
    }
    
    return { status, checks }
  } catch (error) {
    trackError(error as Error, { context: 'health_check' })
    return {
      status: 'unhealthy',
      checks: Object.fromEntries(Object.keys(checks).map(key => [key, false]))
    }
  }
}

// Declare global gtag function for TypeScript
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void
    Sentry: any
  }
}
