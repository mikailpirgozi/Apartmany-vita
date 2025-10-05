'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, X, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface BreakfastImageManagerProps {
  images: string[]
  onImagesChange: (images: string[]) => void
}

export function BreakfastImageManager({
  images,
  onImagesChange
}: BreakfastImageManagerProps) {
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/breakfast/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }

        const data = await response.json()
        return data.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      const newImages = [...images, ...uploadedUrls]
      onImagesChange(newImages)
      
      toast({
        title: 'Úspešne nahraté',
        description: `Nahraných ${uploadedUrls.length} fotiek`,
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Chyba',
        description: error instanceof Error ? error.message : 'Chyba pri nahrávaní fotiek',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
    
    toast({
      title: 'Fotka odstránená',
      description: `Fotka #${index + 1} bola odstránená${index === 0 ? ' (bola hlavná)' : ''}`,
    })
  }

  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    onImagesChange(newImages)
  }

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div>
        <input
          type="file"
          id="breakfast-image-upload"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
        />
        <label htmlFor="breakfast-image-upload">
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            className="cursor-pointer"
            asChild
          >
            <span>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Nahrávam...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Nahrať fotky
                </>
              )}
            </span>
          </Button>
        </label>
        <p className="text-sm text-muted-foreground mt-2">
          Prvá fotka bude hlavná. Max 5MB na fotku.
        </p>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <Card key={index} className="relative group overflow-hidden">
              <div className="aspect-square relative">
                <Image
                  src={imageUrl}
                  alt={`Fotka ${index + 1}`}
                  fill
                  className="object-cover"
                />
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    Hlavná
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {index > 0 && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleMoveImage(index, 0)}
                      title="Nastaviť ako hlavnú"
                    >
                      ⭐
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <Card className="p-8 text-center border-dashed">
          <p className="text-muted-foreground">
            Zatiaľ žiadne fotky. Nahraj prvú fotku pomocou tlačidla vyššie.
          </p>
        </Card>
      )}
    </div>
  )
}
