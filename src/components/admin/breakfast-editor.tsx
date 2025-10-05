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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BreakfastImageManager } from './breakfast-image-manager'
import { Loader2, Save, X, Trash2, Coffee } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { BREAKFAST_CATEGORIES, ALLERGEN_LABELS } from '@/types/breakfast'
import type { BreakfastCategory } from '@prisma/client'

interface BreakfastEditorProps {
  breakfast?: {
    id: string
    name: string
    slug: string
    description: string
    price: string
    weight: string | null
    images: string[]
    category: BreakfastCategory
    allergens: string[]
    isActive: boolean
    sortOrder: number
    guestPrice: string | null
  }
  onUpdate?: (breakfast: any) => void
  onDelete?: (id: string) => void
  onSave?: (breakfast: any) => void
  onCancel?: () => void
}

export function BreakfastEditor({ breakfast, onUpdate, onDelete, onSave, onCancel }: BreakfastEditorProps) {
  const { toast } = useToast()
  const isNew = !breakfast
  const [isEditing, setIsEditing] = useState(isNew)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: breakfast?.name || '',
    slug: breakfast?.slug || '',
    description: breakfast?.description || '',
    price: breakfast?.price || '',
    weight: breakfast?.weight || '',
    category: breakfast?.category || 'BREAD_AND_EGGS' as BreakfastCategory,
    allergens: breakfast?.allergens || [],
    isActive: breakfast?.isActive ?? true,
    sortOrder: breakfast?.sortOrder || 0,
    guestPrice: breakfast?.guestPrice || '',
    images: breakfast?.images || []
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const url = isNew ? '/api/breakfast' : `/api/breakfast/${breakfast!.id}`
      const method = isNew ? 'POST' : 'PATCH'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          guestPrice: formData.guestPrice ? parseFloat(formData.guestPrice) : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save breakfast')
      }

      const savedBreakfast = await response.json()

      toast({
        title: 'Úspešne uložené',
        description: isNew ? 'Nová položka bola pridaná' : 'Položka bola aktualizovaná',
      })

      if (isNew && onSave) {
        onSave({
          ...savedBreakfast,
          price: savedBreakfast.price.toString(),
          guestPrice: savedBreakfast.guestPrice?.toString() || null,
        })
      } else if (onUpdate) {
        onUpdate({
          ...savedBreakfast,
          price: savedBreakfast.price.toString(),
          guestPrice: savedBreakfast.guestPrice?.toString() || null,
        })
      }

      setIsEditing(false)
    } catch (error) {
      console.error('Error saving breakfast:', error)
      toast({
        title: 'Chyba',
        description: 'Nepodarilo sa uložiť položku',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!breakfast || !confirm('Naozaj chceš vymazať túto položku?')) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/breakfast/${breakfast.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete breakfast')
      }

      toast({
        title: 'Vymazané',
        description: 'Položka bola vymazaná',
      })

      if (onDelete) {
        onDelete(breakfast.id)
      }
    } catch (error) {
      console.error('Error deleting breakfast:', error)
      toast({
        title: 'Chyba',
        description: 'Nepodarilo sa vymazať položku',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    if (isNew && onCancel) {
      onCancel()
    } else if (breakfast) {
      setFormData({
        name: breakfast.name,
        slug: breakfast.slug,
        description: breakfast.description,
        price: breakfast.price,
        weight: breakfast.weight || '',
        category: breakfast.category,
        allergens: breakfast.allergens,
        isActive: breakfast.isActive,
        sortOrder: breakfast.sortOrder,
        guestPrice: breakfast.guestPrice || '',
        images: breakfast.images
      })
      setIsEditing(false)
    }
  }

  const toggleAllergen = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }))
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  return (
    <Card className={isNew ? '' : 'hover:shadow-md transition-shadow'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <Coffee className="h-5 w-5 text-amber-600" />
            {isNew ? 'Nová položka' : breakfast!.name}
            {!isNew && (
              <Badge variant={breakfast!.isActive ? 'default' : 'secondary'}>
                {breakfast!.isActive ? 'Aktívne' : 'Neaktívne'}
              </Badge>
            )}
          </CardTitle>
          {!isNew && (
            <div className="flex gap-2">
              {!isEditing && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Upraviť
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      {(isEditing || isNew) && (
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Názov *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    name: e.target.value,
                    slug: isNew ? generateSlug(e.target.value) : formData.slug
                  })
                }}
                placeholder="napr. Miešané vajíčka"
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="miesane-vajicka"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Popis *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Vajíčko (3ks), šalátik, domáci chlebík"
              rows={3}
            />
          </div>

          {/* Price & Weight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Cena (€) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="5.58"
              />
            </div>

            <div>
              <Label htmlFor="weight">Hmotnosť</Label>
              <Input
                id="weight"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="200g"
              />
            </div>

            <div>
              <Label htmlFor="guestPrice">Cena pre hostí (€)</Label>
              <Input
                id="guestPrice"
                type="number"
                step="0.01"
                value={formData.guestPrice}
                onChange={(e) => setFormData({ ...formData, guestPrice: e.target.value })}
                placeholder="9.90"
              />
            </div>
          </div>

          {/* Category & Sort Order */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Kategória *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as BreakfastCategory })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(BREAKFAST_CATEGORIES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sortOrder">Poradie</Label>
              <Input
                id="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          </div>

          <Separator />

          {/* Allergens */}
          <div>
            <Label className="mb-3 block">Alergény</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {Object.entries(ALLERGEN_LABELS).map(([code, label]) => (
                <div
                  key={code}
                  onClick={() => toggleAllergen(code)}
                  className={`
                    cursor-pointer p-2 rounded-lg border-2 transition-all text-sm
                    ${formData.allergens.includes(code)
                      ? 'border-primary bg-primary/10 font-medium'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <span className="font-bold">{code}.</span> {label}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Images */}
          <div>
            <Label className="mb-3 block">Fotky</Label>
            <BreakfastImageManager
              images={formData.images}
              onImagesChange={(images) => setFormData({ ...formData, images })}
            />
          </div>

          <Separator />

          {/* Active Status */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isActive">Aktívna položka</Label>
              <p className="text-sm text-muted-foreground">
                Neaktívne položky sa nezobrazia na webe
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-2" />
              Zrušiť
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !formData.name || !formData.slug || !formData.price}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isNew ? 'Vytvoriť' : 'Uložiť'}
            </Button>
          </div>
        </CardContent>
      )}

      {!isEditing && !isNew && breakfast && (
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Popis</p>
              <p>{breakfast.description}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Cena</p>
                <p className="font-bold">{breakfast.price}€</p>
              </div>
              {breakfast.weight && (
                <div>
                  <p className="text-sm text-muted-foreground">Hmotnosť</p>
                  <p className="font-medium">{breakfast.weight}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Kategória</p>
                <p className="font-medium">{BREAKFAST_CATEGORIES[breakfast.category]}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Poradie</p>
                <p className="font-medium">{breakfast.sortOrder}</p>
              </div>
            </div>
            {breakfast.allergens.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Alergény</p>
                <div className="flex flex-wrap gap-1">
                  {breakfast.allergens.map(code => (
                    <Badge key={code} variant="outline">
                      {code}. {ALLERGEN_LABELS[code]}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {breakfast.images.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Fotky ({breakfast.images.length})</p>
                <div className="grid grid-cols-4 gap-2">
                  {breakfast.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={breakfast.name}
                      className="w-full h-20 object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
