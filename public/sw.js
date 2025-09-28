/**
 * Service Worker for Apartmany Vita Calendar Caching
 * Provides offline-first calendar experience with intelligent caching
 */

const CACHE_NAME = 'apartmany-vita-calendar-v1';
const STATIC_CACHE_NAME = 'apartmany-vita-static-v1';
const API_CACHE_NAME = 'apartmany-vita-api-v1';

// Cache strategies configuration
const CACHE_STRATEGIES = {
  // Static assets - cache first
  static: [
    '/',
    '/apartments',
    '/booking',
    '/_next/static/',
    '/favicon.ico'
  ],
  
  // API endpoints - network first with fallback
  api: [
    '/api/beds24/availability',
    '/api/beds24/batch-availability',
    '/api/beds24/cached-availability',
    '/api/apartments'
  ],
  
  // Images - cache first with network fallback
  images: [
    '/images/',
    '/_next/image'
  ]
};

// Cache TTL configuration
const CACHE_TTL = {
  api: 5 * 60 * 1000,      // 5 minutes for API responses
  static: 24 * 60 * 60 * 1000, // 24 hours for static assets
  images: 7 * 24 * 60 * 60 * 1000 // 7 days for images
};

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.addAll(CACHE_STRATEGIES.static);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

/**
 * Activate event - cleanup old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE_NAME && 
                cacheName !== API_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Claim all clients
      self.clients.claim()
    ])
  );
});

/**
 * Fetch event - intelligent caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Only handle GET requests
  if (request.method !== 'GET') return;
  
  // Calendar API requests - network first with cache fallback
  if (isCalendarAPI(url.pathname)) {
    event.respondWith(handleCalendarAPI(request));
    return;
  }
  
  // Static assets - cache first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }
  
  // Images - cache first with network fallback
  if (isImage(url.pathname)) {
    event.respondWith(handleImage(request));
    return;
  }
  
  // Default - network first
  event.respondWith(fetch(request));
});

/**
 * Handle calendar API requests with intelligent caching
 */
async function handleCalendarAPI(request) {
  const url = new URL(request.url);
  const cacheKey = generateCacheKey(url);
  
  try {
    // Try network first for fresh data
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful response
      const cache = await caches.open(API_CACHE_NAME);
      const responseClone = networkResponse.clone();
      
      // Add timestamp for TTL checking
      const responseWithTimestamp = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: {
          ...Object.fromEntries(responseClone.headers.entries()),
          'sw-cached-at': Date.now().toString()
        }
      });
      
      await cache.put(cacheKey, responseWithTimestamp);
      
      // Track cache performance
      trackCachePerformance('api', 'network_success', Date.now());
      
      return networkResponse;
    }
  } catch {
    console.warn('[SW] Network request failed, trying cache');
  }
  
  // Network failed, try cache
  const cache = await caches.open(API_CACHE_NAME);
  const cachedResponse = await cache.match(cacheKey);
  
  if (cachedResponse) {
    // Check if cache is still valid
    const cachedAt = parseInt(cachedResponse.headers.get('sw-cached-at') || '0');
    const isExpired = Date.now() - cachedAt > CACHE_TTL.api;
    
    if (!isExpired) {
      trackCachePerformance('api', 'cache_hit', Date.now());
      return cachedResponse;
    } else {
      // Cache expired, delete it
      await cache.delete(cacheKey);
    }
  }
  
  // No valid cache, return offline response
  trackCachePerformance('api', 'cache_miss', Date.now());
  return createOfflineResponse();
}

/**
 * Handle static assets with cache-first strategy
 */
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    trackCachePerformance('static', 'cache_hit', Date.now());
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
      trackCachePerformance('static', 'network_success', Date.now());
    }
    return networkResponse;
  } catch (error) {
    trackCachePerformance('static', 'network_failed', Date.now());
    throw error;
  }
}

/**
 * Handle images with cache-first strategy
 */
async function handleImage(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    // Return placeholder image for offline
    return new Response(
      '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" fill="#9ca3af">Image Offline</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

/**
 * Helper functions
 */
function isCalendarAPI(pathname) {
  return CACHE_STRATEGIES.api.some(pattern => pathname.includes(pattern));
}

function isStaticAsset(pathname) {
  return CACHE_STRATEGIES.static.some(pattern => pathname.includes(pattern)) ||
         pathname.includes('_next/static') ||
         pathname.endsWith('.js') ||
         pathname.endsWith('.css');
}

function isImage(pathname) {
  return CACHE_STRATEGIES.images.some(pattern => pathname.includes(pattern)) ||
         /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(pathname);
}

function generateCacheKey(url) {
  // Create consistent cache key for API requests
  const params = new URLSearchParams(url.search);
  const sortedParams = Array.from(params.entries()).sort();
  return `${url.pathname}?${new URLSearchParams(sortedParams).toString()}`;
}

function createOfflineResponse() {
  return new Response(
    JSON.stringify({
      error: 'Offline',
      message: 'Calendar data not available offline',
      offline: true,
      timestamp: Date.now()
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    }
  );
}

function trackCachePerformance(type, event, timestamp) {
  // Send performance data to main thread
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'cache_performance',
        data: { type, event, timestamp }
      });
    });
  });
}

/**
 * Background sync for calendar updates
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'calendar-sync') {
    event.waitUntil(syncCalendarData());
  }
});

async function syncCalendarData() {
  try {
    // Get all cached calendar requests
    const cache = await caches.open(API_CACHE_NAME);
    const requests = await cache.keys();
    
    // Refresh calendar data in background
    const calendarRequests = requests.filter(request => 
      request.url.includes('/api/beds24/availability')
    );
    
    await Promise.all(
      calendarRequests.map(async (request) => {
        try {
          const response = await fetch(request);
          if (response.ok) {
            await cache.put(request, response);
          }
        } catch {
          console.warn('[SW] Background sync failed for:', request.url);
        }
      })
    );
    
    console.log('[SW] Background calendar sync completed');
  } catch {
    console.error('[SW] Background sync error');
  }
}

/**
 * Push notifications for calendar updates
 */
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    if (data.type === 'calendar_update') {
      event.waitUntil(handleCalendarUpdate(data));
    }
  }
});

async function handleCalendarUpdate(data) {
  // Invalidate related cache entries
  const cache = await caches.open(API_CACHE_NAME);
  const keys = await cache.keys();
  
  const keysToDelete = keys.filter(request => 
    request.url.includes(data.apartmentSlug) &&
    request.url.includes(data.month)
  );
  
  await Promise.all(keysToDelete.map(key => cache.delete(key)));
  
  // Show notification to user
  await self.registration.showNotification('Calendar Updated', {
    body: `New availability for ${data.apartmentName}`,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: { apartmentSlug: data.apartmentSlug, month: data.month }
  });
}

console.log('[SW] Service Worker loaded successfully');
