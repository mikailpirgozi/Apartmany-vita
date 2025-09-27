'use client'

import { GoogleAnalytics as GA } from '@next/third-parties/google'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { trackPageView, initializeRUM } from '@/lib/monitoring'

interface GoogleAnalyticsProps {
  gaId: string
}

export function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Initialize Real User Monitoring
    initializeRUM()
  }, [])
  
  useEffect(() => {
    if (pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
      trackPageView(url, document.title)
    }
  }, [pathname, searchParams])
  
  if (!gaId || process.env.NODE_ENV !== 'production') {
    return null
  }
  
  return <GA gaId={gaId} />
}

// Web Vitals tracking component
export function WebVitalsTracker() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('web-vitals').then(({ getCLS, getFCP, getFID, getLCP, getTTFB }) => {
        getCLS((metric) => {
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: 'CLS',
              value: Math.round(metric.value * 1000),
              non_interaction: true,
            })
          }
        })
        
        getFCP((metric) => {
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: 'FCP',
              value: Math.round(metric.value),
              non_interaction: true,
            })
          }
        })
        
        getFID((metric) => {
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: 'FID',
              value: Math.round(metric.value),
              non_interaction: true,
            })
          }
        })
        
        getLCP((metric) => {
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: 'LCP',
              value: Math.round(metric.value),
              non_interaction: true,
            })
          }
        })
        
        getTTFB((metric) => {
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: 'TTFB',
              value: Math.round(metric.value),
              non_interaction: true,
            })
          }
        })
      })
    }
  }, [])
  
  return null
}

// Conversion tracking
export function ConversionTracker() {
  useEffect(() => {
    // Track page load as a micro-conversion
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_load', {
        event_category: 'engagement',
        event_label: window.location.pathname,
      })
    }
  }, [])
  
  return null
}
