'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ApartmentImageManagerProps {
  apartmentId: string
  apartmentName: string
  currentImages: string[]
  onUpdate: (images: string[]) => void
}

export function ApartmentImageManager({
  apartmentId,
  apartmentName,
  currentImages,
  onUpdate
}: ApartmentImageManagerProps) {
  const [images, setImages] = useState<string[]>(currentImages)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }

        const data = await response.json()
        return data
      })

      const results = await Promise.all(uploadPromises)
      const uploadedUrls = results.map(r => r.url)
      const newImages = [...images, ...uploadedUrls]
      setImages(newImages)
      
      // Show compression stats
      const totalSavings = results.reduce((acc, r) => {
        if (r.stats?.savings) {
          return acc + parseFloat(r.stats.savings)
        }
        return acc
      }, 0)
      const avgSavings = (totalSavings / results.length).toFixed(0)
      
      toast.success(`Úspešne nahraných ${uploadedUrls.length} fotiek (komprimované o ${avgSavings}%)`)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Chyba pri nahrávaní fotiek')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleRemoveImage = (index: number) => {
    const imageToRemove = images[index]
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    
    // Show which image was removed
    const imageNumber = index + 1
    toast.success(`Fotka #${imageNumber} odstránená${index === 0 ? ' (bola hlavná)' : ''}`)
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/apartments/${apartmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ images })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Save failed')
      }

      const updatedApartment = await response.json()
      onUpdate(updatedApartment.images)
      toast.success('Fotky úspešne uložené!')
    } catch (error) {
      console.error('Save error:', error)
      toast.error(error instanceof Error ? error.message : 'Chyba pri ukladaní fotiek')
    } finally {
      setSaving(false)
    }
  }

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    setImages(newImages)
    
    // Show feedback
    const direction = toIndex < fromIndex ? 'vľavo' : 'vpravo'
    if (toIndex === 0) {
      toast.success('Fotka nastavená ako hlavná')
    } else if (fromIndex === 0) {
      toast.info('Hlavná fotka zmenená')
    } else {
      toast.success(`Fotka posunutá ${direction}`)
    }
  }

  const hasChanges = JSON.stringify(images) !== JSON.stringify(currentImages)

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">{apartmentName}</h3>
          <p className="text-sm text-muted-foreground">
            Spravuj fotky apartmánu. Prvá fotka bude použitá ako hlavný obrázok.
          </p>
        </div>

        {/* Upload Area */}
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <input
            type="file"
            id={`upload-${apartmentId}`}
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
          <label
            htmlFor={`upload-${apartmentId}`}
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Nahrávam a komrimujem...</p>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm font-medium">Klikni pre nahratie fotiek</p>
                <p className="text-xs text-muted-foreground">
                  JPEG, PNG, WebP (max 20MB)
                </p>
                <p className="text-xs text-muted-foreground text-green-600">
                  ✨ Automatická kompresia a optimalizácia
                </p>
              </>
            )}
          </label>
        </div>

        {/* Images Grid */}
        {images.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                {images.length} {images.length === 1 ? 'fotka' : images.length < 5 ? 'fotky' : 'fotiek'} nahraných
              </p>
              {hasChanges && (
                <p className="text-sm text-orange-600 font-medium">
                  ⚠️ Neuložené zmeny
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="relative aspect-video rounded-lg overflow-hidden border-2 bg-muted group hover:border-primary transition-colors"
                >
                  <Image
                    src={url}
                    alt={`${apartmentName} - ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  
                  {/* Image number badge */}
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">
                    #{index + 1}
                  </div>
                  
                  {/* Badge for main image */}
                  {index === 0 && (
                    <div className="absolute top-2 left-12 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded shadow-lg">
                      ⭐ Hlavná
                    </div>
                  )}

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-lg"
                    title="Odstrániť fotku"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  {/* Reorder buttons */}
                  <div className="absolute bottom-2 left-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {index > 0 && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleReorder(index, index - 1)}
                        className="flex-1 h-8 text-sm font-bold shadow-lg"
                        title="Posunúť doľava (k hlavnej)"
                      >
                        ← {index === 1 ? 'Urobiť hlavnou' : ''}
                      </Button>
                    )}
                    {index < images.length - 1 && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleReorder(index, index + 1)}
                        className="flex-1 h-8 text-sm font-bold shadow-lg"
                        title="Posunúť doprava"
                      >
                        →
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        {hasChanges && (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setImages(currentImages)}
            >
              Zrušiť zmeny
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ukladám...
                </>
              ) : (
                'Uložiť fotky'
              )}
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}

