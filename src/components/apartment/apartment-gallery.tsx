'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { ImageIcon, ChevronLeft, ChevronRight, X } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useImagePreloader } from '@/hooks/useImagePreloader'

interface ApartmentGalleryProps {
  images: string[]
  apartmentName: string
}

export function ApartmentGallery({ images, apartmentName }: ApartmentGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50

  // Intelligent image preloading - starts when lightbox opens
  useImagePreloader({
    images,
    currentIndex: lightboxIndex,
    preloadCount: 5,
    isActive: showLightbox
  })

  // Prevent context menu (long-press menu on mobile, right-click on desktop)
  const handleContextMenu = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  // Prevent drag start
  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const nextImage = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const prevImage = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  // Keyboard navigation
  useEffect(() => {
    if (!showLightbox) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevImage()
      } else if (e.key === 'ArrowRight') {
        nextImage()
      } else if (e.key === 'Escape') {
        setShowLightbox(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showLightbox, nextImage, prevImage])

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (showLightbox) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showLightbox])

  if (images.length === 0) {
    return (
      <div className="space-y-4">
        <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-muted flex items-center justify-center">
          <span className="text-muted-foreground">Fotky nie sú dostupné</span>
        </div>
      </div>
    )
  }

  // Touch/swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0]?.clientX ?? 0)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0]?.clientX ?? 0)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      nextImage()
    } else if (isRightSwipe) {
      prevImage()
    }
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setShowLightbox(true)
  }

  return (
    <div className="space-y-4" data-testid="apartment-gallery">
      {/* Main Image - Clickable */}
      <div 
        className="relative aspect-[16/10] overflow-hidden rounded-lg cursor-pointer group"
        onClick={() => openLightbox(selectedImage)}
      >
        <Image
          src={images[selectedImage] ?? ''}
          alt={`${apartmentName} Trenčín – moderný apartmán s kompletným vybavením v centre mesta`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 60vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        
        <Button
          variant="secondary" 
          size="sm"
          className="absolute bottom-4 right-4 z-10"
          onClick={(e) => {
            e.stopPropagation()
            openLightbox(selectedImage)
          }}
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          Všetky fotky ({images.length})
        </Button>
      </div>
      
      {/* Thumbnail Grid - Also clickable */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 4).map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedImage(index)
                openLightbox(index)
              }}
              className={cn(
                "relative aspect-square overflow-hidden rounded border-2 transition-all hover:scale-105",
                selectedImage === index ? "border-primary" : "border-transparent hover:border-muted-foreground"
              )}
            >
              <Image 
                src={image} 
                alt={`${apartmentName} Trenčín – ${index === 0 ? 'obývačka' : index === 1 ? 'spálňa' : index === 2 ? 'kúpeľňa' : 'kuchyňa'} s moderným vybavením`} 
                fill 
                sizes="(max-width: 768px) 25vw, (max-width: 1200px) 20vw, 15vw"
                className="object-cover" 
              />
              {index === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center transition-all hover:bg-black/70">
                  <span className="text-white font-semibold text-lg">+{images.length - 4}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Custom Fullscreen Lightbox */}
      {showLightbox && (
        <div 
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center select-none"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onContextMenu={handleContextMenu}
          role="dialog"
          aria-modal="true"
          aria-label={`${apartmentName} - Galéria fotografií`}
          style={{
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none',
            userSelect: 'none'
          }}
        >
          {/* Screen reader only content */}
          <div className="sr-only">
            <h2>{apartmentName} - Galéria fotografií</h2>
            <p>Prehliadanie fotografií apartmánu {apartmentName}. Fotografia {lightboxIndex + 1} z {images.length}.</p>
          </div>
          
          {/* Close button */}
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 z-50 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            aria-label="Zavrieť galériu"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium">
            {lightboxIndex + 1} / {images.length}
          </div>

          {/* Main image container */}
          <div 
            className="relative w-full h-full flex items-center justify-center p-4"
            onContextMenu={handleContextMenu}
          >
            <div 
              className="relative w-full h-full"
              onDragStart={handleDragStart}
            >
              <Image
                src={images[lightboxIndex] ?? ''}
                alt={`${apartmentName} Trenčín – ${lightboxIndex === 0 ? 'priestranná obývačka' : lightboxIndex === 1 ? 'pohodlná spálňa' : lightboxIndex === 2 ? 'moderná kúpeľňa' : 'plne vybavená kuchyňa'}`}
                fill
                sizes="100vw"
                className="object-contain pointer-events-none"
                priority
                draggable={false}
                onContextMenu={handleContextMenu}
              />
            </div>

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 h-14 w-14 rounded-full bg-black/50 hover:bg-black/70 text-white border-none"
                  onClick={prevImage}
                  aria-label="Predchádzajúca fotka"
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 h-14 w-14 rounded-full bg-black/50 hover:bg-black/70 text-white border-none"
                  onClick={nextImage}
                  aria-label="Ďalšia fotka"
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}
          </div>

          {/* Thumbnail strip at bottom */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-[95vw] overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 px-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setLightboxIndex(index)}
                    onContextMenu={handleContextMenu}
                    className={cn(
                      "relative flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all",
                      lightboxIndex === index 
                        ? "border-white scale-110" 
                        : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                    )}
                  >
                    <Image
                      src={image}
                      alt={`${apartmentName} Trenčín – náhľad fotografie ${index + 1}`}
                      fill
                      sizes="64px"
                      className="object-cover pointer-events-none"
                      draggable={false}
                      onContextMenu={handleContextMenu}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
