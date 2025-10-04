import { useEffect, useRef, useCallback } from 'react'

interface UseImagePreloaderOptions {
  images: string[]
  currentIndex: number
  preloadCount?: number // How many images ahead to preload
  isActive: boolean // Only preload when gallery is open
}

interface PreloadedImage {
  url: string
  loaded: boolean
  priority: number
}

/**
 * Custom hook for intelligent image preloading in galleries
 * Implements priority-based loading: current + nearest neighbors first, then rest
 * 
 * Inspired by Airbnb's image loading strategy:
 * - Preload current image immediately
 * - Preload next N images in both directions
 * - Queue remaining images with lower priority
 */
export function useImagePreloader({
  images,
  currentIndex,
  preloadCount = 5,
  isActive
}: UseImagePreloaderOptions) {
  const preloadedImages = useRef<Map<string, HTMLImageElement>>(new Map())
  const preloadQueue = useRef<PreloadedImage[]>([])
  const isPreloading = useRef(false)

  // Calculate which images to preload based on current index
  const calculatePreloadPriority = useCallback((index: number): PreloadedImage[] => {
    const priorities: PreloadedImage[] = []
    const totalImages = images.length

    // Priority 1: Current image
    const currentUrl = images[index];
    if (currentUrl) {
      priorities.push({
        url: currentUrl,
        loaded: false,
        priority: 1
      })
    }

    // Priority 2: Immediate neighbors (±1)
    for (let offset = 1; offset <= Math.min(2, preloadCount); offset++) {
      const nextIndex = (index + offset) % totalImages
      const prevIndex = (index - offset + totalImages) % totalImages

      const nextUrl = images[nextIndex];
      if (nextUrl) {
        priorities.push({
          url: nextUrl,
          loaded: false,
          priority: 2
        })
      }

      if (offset <= preloadCount / 2) {
        const prevUrl = images[prevIndex];
        if (prevUrl) {
          priorities.push({
            url: prevUrl,
            loaded: false,
            priority: 2
          })
        }
      }
    }

    // Priority 3: Extended range (up to preloadCount)
    for (let offset = 3; offset <= preloadCount; offset++) {
      const nextIndex = (index + offset) % totalImages
      const nextUrl = images[nextIndex];
      if (nextUrl) {
        priorities.push({
          url: nextUrl,
          loaded: false,
          priority: 3
        })
      }
    }

    // Priority 4: Remaining images
    for (let i = 0; i < totalImages; i++) {
      const imageUrl = images[i];
      if (imageUrl && !priorities.some(p => p.url === imageUrl)) {
        priorities.push({
          url: imageUrl,
          loaded: false,
          priority: 4
        })
      }
    }

    return priorities
  }, [images, preloadCount])

  // Preload a single image
  const preloadImage = useCallback((url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (preloadedImages.current.has(url)) {
        resolve()
        return
      }

      const img = new window.Image()
      
      img.onload = () => {
        preloadedImages.current.set(url, img)
        resolve()
      }
      
      img.onerror = () => {
        console.warn(`Failed to preload image: ${url}`)
        reject(new Error(`Failed to load ${url}`))
      }

      img.src = url
    })
  }, [])

  // Process preload queue
  const processQueue = useCallback(async () => {
    if (isPreloading.current || preloadQueue.current.length === 0) {
      return
    }

    isPreloading.current = true

    // Sort by priority (lower number = higher priority)
    const sortedQueue = [...preloadQueue.current].sort((a, b) => a.priority - b.priority)

    // Preload images in batches to avoid overwhelming the browser
    const batchSize = 3
    for (let i = 0; i < sortedQueue.length; i += batchSize) {
      const batch = sortedQueue.slice(i, i + batchSize)
      
      try {
        await Promise.all(
          batch.map(item => 
            preloadImage(item.url)
              .then(() => {
                // Mark as loaded
                const queueItem = preloadQueue.current.find(q => q.url === item.url)
                if (queueItem) {
                  queueItem.loaded = true
                }
              })
              .catch(() => {
                // Silent fail, already logged in preloadImage
              })
          )
        )
      } catch (error) {
        console.warn('Batch preload error:', error)
      }

      // Small delay between batches to not block main thread
      if (i + batchSize < sortedQueue.length) {
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    }

    isPreloading.current = false
  }, [preloadImage])

  // Start preloading when gallery opens or index changes
  useEffect(() => {
    if (!isActive || images.length === 0) {
      return
    }

    // Calculate new priority queue
    const newQueue = calculatePreloadPriority(currentIndex)
    
    // Filter out already loaded images
    preloadQueue.current = newQueue.filter(
      item => !preloadedImages.current.has(item.url)
    )

    // Start processing queue
    processQueue()
  }, [isActive, currentIndex, images, calculatePreloadPriority, processQueue])

  // Cleanup on unmount
  useEffect(() => {
    const imagesCache = preloadedImages.current
    const queue = preloadQueue.current
    const preloadingFlag = isPreloading
    
    return () => {
      imagesCache.clear()
      queue.length = 0
      preloadingFlag.current = false
    }
  }, [])

  // Return preload status for debugging (optional)
  return {
    isPreloading: isPreloading.current,
    preloadedCount: preloadedImages.current.size,
    totalImages: images.length
  }
}

