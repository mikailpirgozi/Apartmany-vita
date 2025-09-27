'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ApartmentGalleryProps {
  images: string[]
  apartmentName: string
}

export function ApartmentGallery({ images, apartmentName }: ApartmentGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className="space-y-4">
        <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-muted flex items-center justify-center">
          <span className="text-muted-foreground">Fotky nie sú dostupné</span>
        </div>
      </div>
    )
  }

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
        <Image
          src={images[selectedImage]}
          alt={`${apartmentName} - hlavná fotka`}
          fill
          className="object-cover"
          priority
        />
        
        <Button
          variant="secondary" 
          size="sm"
          className="absolute bottom-4 right-4"
          onClick={() => {
            setLightboxIndex(selectedImage)
            setShowLightbox(true)
          }}
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          Všetky fotky ({images.length})
        </Button>
      </div>
      
      {/* Thumbnail Grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 4).map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={cn(
                "relative aspect-square overflow-hidden rounded border-2 transition-all",
                selectedImage === index ? "border-primary" : "border-transparent hover:border-muted-foreground"
              )}
            >
              <Image 
                src={image} 
                alt={`${apartmentName} - fotka ${index + 1}`} 
                fill 
                className="object-cover" 
              />
              {index === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-semibold">+{images.length - 4}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={showLightbox} onOpenChange={setShowLightbox}>
        <DialogContent className="max-w-4xl p-0">
          <div className="relative">
            <Image
              src={images[lightboxIndex]}
              alt={`${apartmentName} - fotka ${lightboxIndex + 1}`}
              width={800}
              height={600}
              className="w-full h-auto"
            />
            
            {images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {lightboxIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
