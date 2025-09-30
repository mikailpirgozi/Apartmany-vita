'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ApartmentImageManager } from './apartment-image-manager'
import { Loader2, Save, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ApartmentEditorProps {
  apartment: {
    id: string
    name: string
    slug: string
    description: string
    floor: number
    size: number
    maxGuests: number
    maxChildren: number
    images: string[]
    amenities: string[]
    basePrice: string
    isActive: boolean
    beds24Id: string | null
  }
}

const DEFAULT_AMENITIES = [
  'WiFi',
  'TV',
  'Kuchyňa',
  'Práčka',
  'Klimatizácia',
  'Kúrenie',
  'Chladnička',
  'Mikrovlnka',
  'Riad a príbory',
  'Sušič vlasov',
  'Žehlička',
  'Parkovanie',
  'Výťah',
  'Balkón',
  'Terasa'
]

export function ApartmentEditor({ apartment }: ApartmentEditorProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: apartment.name,
    slug: apartment.slug,
    description: apartment.description,
    floor: apartment.floor,
    size: apartment.size,
    maxGuests: apartment.maxGuests,
    maxChildren: apartment.maxChildren,
    basePrice: apartment.basePrice,
    isActive: apartment.isActive,
    beds24Id: apartment.beds24Id || '',
    amenities: apartment.amenities,
    images: apartment.images
  })
  const [newAmenity, setNewAmenity] = useState('')

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/apartments/${apartment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update apartment')
      }

      toast({
        title: 'Úspešne uložené',
        description: 'Apartmán bol úspešne aktualizovaný',
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating apartment:', error)
      toast({
        title: 'Chyba',
        description: 'Nepodarilo sa aktualizovať apartmán',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: apartment.name,
      slug: apartment.slug,
      description: apartment.description,
      floor: apartment.floor,
      size: apartment.size,
      maxGuests: apartment.maxGuests,
      maxChildren: apartment.maxChildren,
      basePrice: apartment.basePrice,
      isActive: apartment.isActive,
      beds24Id: apartment.beds24Id || '',
      amenities: apartment.amenities,
      images: apartment.images
    })
    setIsEditing(false)
  }

  const addAmenity = (amenity: string) => {
    if (amenity && !formData.amenities.includes(amenity)) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity]
      })
    }
  }

  const removeAmenity = (amenity: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter(a => a !== amenity)
    })
  }

  const addCustomAmenity = () => {
    if (newAmenity.trim()) {
      addAmenity(newAmenity.trim())
      setNewAmenity('')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            {apartment.name}
            {!formData.isActive && (
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                Neaktívny
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Zrušiť
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Uložiť
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Upraviť
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Základné informácie</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`name-${apartment.id}`}>Názov apartmánu</Label>
              <Input
                id={`name-${apartment.id}`}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`slug-${apartment.id}`}>URL slug</Label>
              <Input
                id={`slug-${apartment.id}`}
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`description-${apartment.id}`}>Popis</Label>
            <Textarea
              id={`description-${apartment.id}`}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={!isEditing}
              rows={4}
            />
          </div>
        </div>

        <Separator />

        {/* Numeric Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Detaily apartmánu</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`floor-${apartment.id}`}>Poschodie</Label>
              <Input
                id={`floor-${apartment.id}`}
                type="number"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 0 })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`size-${apartment.id}`}>Rozloha (m²)</Label>
              <Input
                id={`size-${apartment.id}`}
                type="number"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: parseInt(e.target.value) || 0 })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`maxGuests-${apartment.id}`}>Max dospelí</Label>
              <Input
                id={`maxGuests-${apartment.id}`}
                type="number"
                value={formData.maxGuests}
                onChange={(e) => setFormData({ ...formData, maxGuests: parseInt(e.target.value) || 0 })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`maxChildren-${apartment.id}`}>Max deti</Label>
              <Input
                id={`maxChildren-${apartment.id}`}
                type="number"
                value={formData.maxChildren}
                onChange={(e) => setFormData({ ...formData, maxChildren: parseInt(e.target.value) || 0 })}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`basePrice-${apartment.id}`}>Základná cena (€/noc)</Label>
              <Input
                id={`basePrice-${apartment.id}`}
                type="number"
                step="0.01"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`beds24Id-${apartment.id}`}>Beds24 Property ID</Label>
              <Input
                id={`beds24Id-${apartment.id}`}
                value={formData.beds24Id}
                onChange={(e) => setFormData({ ...formData, beds24Id: e.target.value })}
                disabled={!isEditing}
                placeholder="Voliteľné"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Amenities */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Vybavenie</h3>
          
          {isEditing && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {DEFAULT_AMENITIES.filter(a => !formData.amenities.includes(a)).map((amenity) => (
                  <Badge
                    key={amenity}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => addAmenity(amenity)}
                  >
                    {amenity} +
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder="Vlastné vybavenie..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addCustomAmenity()
                    }
                  }}
                />
                <Button onClick={addCustomAmenity} variant="outline">
                  Pridať
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {formData.amenities.map((amenity) => (
              <Badge
                key={amenity}
                variant="secondary"
                className={isEditing ? 'cursor-pointer pr-1' : ''}
              >
                {amenity}
                {isEditing && (
                  <button
                    onClick={() => removeAmenity(amenity)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Active Status */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor={`isActive-${apartment.id}`}>Stav apartmánu</Label>
            <p className="text-sm text-muted-foreground">
              {formData.isActive 
                ? 'Apartmán je aktívny a dostupný na rezerváciu' 
                : 'Apartmán je neaktívny a nedostupný na rezerváciu'}
            </p>
          </div>
          <Switch
            id={`isActive-${apartment.id}`}
            checked={formData.isActive}
            onCheckedChange={(checked: boolean) => setFormData({ ...formData, isActive: checked })}
            disabled={!isEditing}
          />
        </div>

        <Separator />

        {/* Images */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Fotky apartmánu</h3>
          <ApartmentImageManager
            apartmentId={apartment.id}
            apartmentName={apartment.name}
            currentImages={formData.images}
            onUpdate={(images) => {
              setFormData({ ...formData, images })
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

