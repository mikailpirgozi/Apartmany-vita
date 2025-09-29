'use client'

import { GoogleAnalytics as GA } from '@next/third-parties/google'
import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { trackPageView, initializeRUM } from '@/lib/monitoring'

interface GoogleAnalyticsProps {
  gaId: string
}

export function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    setMounted(true)
    // Initialize Real User Monitoring
    initializeRUM()
  }, [])
  
  useEffect(() => {
    if (mounted && pathname && typeof window !== 'undefined') {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
      trackPageView(url, document.title)
    }
  }, [mounted, pathname, searchParams])
  
  if (!gaId || process.env.NODE_ENV !== 'production') {
    return null
  }
  
  // Don't render GA component until mounted to prevent hydration mismatch
  if (!mounted) {
    return null
  }
  
  return <GA gaId={gaId} />
}

// Web Vitals tracking component
export function WebVitalsTracker() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('web-vitals').then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
        onCLS((metric) => {
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: 'CLS',
              value: Math.round(metric.value * 1000),
              non_interaction: true,
            })
          }
        })
        
        onFCP((metric) => {
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: 'FCP',
              value: Math.round(metric.value),
              non_interaction: true,
            })
          }
        })
        
        onINP((metric) => {
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: 'INP',
              value: Math.round(metric.value),
              non_interaction: true,
            })
          }
        })
        
        onLCP((metric) => {
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: 'LCP',
              value: Math.round(metric.value),
              non_interaction: true,
            })
          }
        })
        
        onTTFB((metric) => {
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
