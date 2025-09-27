/**
 * Performance optimization utilities
 */

// Image optimization helper
export function getOptimizedImageUrl(src: string, width: number, quality = 80): string {
  if (src.includes('cloudinary.com')) {
    // Cloudinary optimization
    return src.replace('/upload/', `/upload/w_${width},q_${quality},f_auto/`)
  }
  
  if (src.includes('unsplash.com')) {
    // Unsplash optimization
    return `${src}?w=${width}&q=${quality}&fm=webp&fit=crop`
  }
  
  return src
}

// Lazy loading intersection observer
export function createLazyLoadObserver(callback: (entry: IntersectionObserverEntry) => void) {
  if (typeof window === 'undefined') return null
  
  return new IntersectionObserver(
    (entries) => {
      entries.forEach(callback)
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.1,
    }
  )
}

// Debounce function for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle function for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Preload critical resources
export function preloadResource(href: string, as: string, type?: string) {
  if (typeof document === 'undefined') return
  
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  if (type) link.type = type
  
  document.head.appendChild(link)
}

// Critical CSS inlining
export function inlineCriticalCSS(css: string) {
  if (typeof document === 'undefined') return
  
  const style = document.createElement('style')
  style.textContent = css
  document.head.appendChild(style)
}

// Web Vitals measurement
export function measureWebVitals() {
  if (typeof window === 'undefined') return
  
  // Measure CLS (Cumulative Layout Shift)
  let clsValue = 0
  const clsEntries: LayoutShift[] = []
  
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'layout-shift' && !(entry as LayoutShift).hadRecentInput) {
        clsEntries.push(entry as LayoutShift)
        clsValue += (entry as LayoutShift).value
      }
    }
  })
  
  observer.observe({ type: 'layout-shift', buffered: true })
  
  // Measure LCP (Largest Contentful Paint)
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    const lastEntry = entries[entries.length - 1]
    console.log('LCP:', lastEntry.startTime)
  })
  
  lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
  
  // Measure FID (First Input Delay)
  const fidObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('FID:', (entry as PerformanceEventTiming).processingStart - entry.startTime)
    }
  })
  
  fidObserver.observe({ type: 'first-input', buffered: true })
  
  return {
    getCLS: () => clsValue,
    cleanup: () => {
      observer.disconnect()
      lcpObserver.disconnect()
      fidObserver.disconnect()
    }
  }
}

// Resource hints for critical resources
export function addResourceHints() {
  if (typeof document === 'undefined') return
  
  const hints = [
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: '//res.cloudinary.com' },
    { rel: 'dns-prefetch', href: '//images.unsplash.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
  ]
  
  hints.forEach(({ rel, href, crossorigin }) => {
    const link = document.createElement('link')
    link.rel = rel
    link.href = href
    if (crossorigin) link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })
}

// Bundle splitting helpers
export const dynamicImports = {
  // Lazy load heavy components
  BookingWidget: () => import('@/components/booking/booking-widget'),
  ApartmentGallery: () => import('@/components/apartment/apartment-gallery'),
  GoogleReviews: () => import('@/components/reviews/google-reviews'),
  // AIChatbot: () => import('@/components/chat/ai-chatbot'),
  
  // Lazy load third-party libraries
  Stripe: () => import('@stripe/stripe-js'),
  DatePicker: () => import('react-day-picker'),
}

// Service Worker registration
export function registerServiceWorker() {
  if (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    process.env.NODE_ENV === 'production'
  ) {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration)
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError)
      })
  }
}
