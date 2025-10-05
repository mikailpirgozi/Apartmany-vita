'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { SearchFilters } from '@/types'
import { AMENITIES } from '@/constants'
import { X, ChevronDown, ChevronUp } from 'lucide-react'

interface ApartmentFiltersProps {
  onFilterChange: (filters: SearchFilters) => void
  className?: string
}

export function ApartmentFilters({ onFilterChange, className }: ApartmentFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    priceRange: [0, 200],
    size: [0, 150],
    floor: [],
    amenities: []
  })

  // State for collapsible sections
  const [expandedSections, setExpandedSections] = useState<{
    price: boolean
    size: boolean
    floor: boolean
    amenities: boolean
  }>({
    price: false,
    size: false,
    floor: false,
    amenities: false
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const toggleArrayFilter = <K extends keyof Pick<SearchFilters, 'floor' | 'amenities'>>(
    key: K,
    value: SearchFilters[K] extends (infer U)[] ? U : never
  ) => {
    const currentArray = filters[key] as unknown[]
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    
    updateFilter(key, newArray as SearchFilters[K])
  }

  const clearFilters = () => {
    const defaultFilters: SearchFilters = {
      priceRange: [0, 200],
      size: [0, 150],
      floor: [],
      amenities: []
    }
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }

  const hasActiveFilters = 
    filters.priceRange[0] > 0 || 
    filters.priceRange[1] < 200 ||
    filters.size[0] > 0 ||
    filters.size[1] < 150 ||
    filters.floor.length > 0 ||
    filters.amenities.length > 0

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filtre</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-auto p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Price Range */}
        <div className="border-b border-border pb-4">
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto font-medium"
            onClick={() => toggleSection('price')}
          >
            <span>Cenové rozpätie (€/noc)</span>
            {expandedSections.price ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          
          {expandedSections.price && (
            <div className="mt-3 space-y-3">
              <div className="text-sm text-muted-foreground">
                Cena: €{filters.priceRange[0]} - €{filters.priceRange[1]}
              </div>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="price-min" className="text-xs">Min cena</Label>
                  <input
                    id="price-min"
                    data-testid="price-min"
                    type="number"
                    value={filters.priceRange[0]}
                    onChange={(e) => updateFilter('priceRange', [parseInt(e.target.value) || 0, filters.priceRange[1]])}
                    className="w-full p-2 border rounded text-sm"
                    min="0"
                    max="200"
                  />
                </div>
                <div>
                  <Label htmlFor="price-max" className="text-xs">Max cena</Label>
                  <input
                    id="price-max"
                    data-testid="price-max"
                    type="number"
                    value={filters.priceRange[1]}
                    onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], parseInt(e.target.value) || 200])}
                    className="w-full p-2 border rounded text-sm"
                    min="0"
                    max="200"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Size Range */}
        <div className="border-b border-border pb-4">
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto font-medium"
            onClick={() => toggleSection('size')}
          >
            <span>Rozloha (m²)</span>
            {expandedSections.size ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          
          {expandedSections.size && (
            <div className="mt-3">
              <Slider
                value={filters.size}
                onValueChange={(value) => updateFilter('size', value as [number, number])}
                max={150}
                min={0}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>{filters.size[0]}m²</span>
                <span>{filters.size[1]}m²</span>
              </div>
            </div>
          )}
        </div>

        {/* Floor Selection */}
        <div className="border-b border-border pb-4">
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto font-medium"
            onClick={() => toggleSection('floor')}
          >
            <span>Poschodie</span>
            {expandedSections.floor ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          
          {expandedSections.floor && (
            <div className="mt-3">
              <div className="flex gap-2">
                {[1, 2].map(floor => (
                  <Button
                    key={floor}
                    variant={filters.floor.includes(floor) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleArrayFilter('floor', floor)}
                    className="flex-1"
                  >
                    {floor}. poschodie
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Amenities */}
        <div className="border-b border-border pb-4">
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto font-medium"
            onClick={() => toggleSection('amenities')}
          >
            <span>Vybavenie</span>
            {expandedSections.amenities ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          
          {expandedSections.amenities && (
            <div className="mt-3">
              <div className="space-y-3">
                {AMENITIES.slice(0, 8).map(amenity => (
                  <div key={amenity.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity.id}
                      checked={filters.amenities.includes(amenity.id)}
                      onCheckedChange={() => toggleArrayFilter('amenities', amenity.id)}
                    />
                    <Label htmlFor={amenity.id} className="text-sm font-normal cursor-pointer">
                      {amenity.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Apply Filters Button */}
        <div className="pt-4">
          <Button
            variant="default"
            size="sm"
            className="w-full"
            data-testid="apply-filters"
            onClick={() => {/* Apply filters */}}
          >
            Aplikovať filtre
          </Button>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="pt-2">
            <Label className="text-sm font-medium mb-2 block">Aktívne filtre</Label>
            <div className="flex flex-wrap gap-1">
              {filters.priceRange[0] > 0 && (
                <Badge variant="secondary" className="text-xs">
                  Min €{filters.priceRange[0]}
                </Badge>
              )}
              {filters.priceRange[1] < 200 && (
                <Badge variant="secondary" className="text-xs">
                  Max €{filters.priceRange[1]}
                </Badge>
              )}
              {filters.size[0] > 0 && (
                <Badge variant="secondary" className="text-xs">
                  Min {filters.size[0]}m²
                </Badge>
              )}
              {filters.size[1] < 150 && (
                <Badge variant="secondary" className="text-xs">
                  Max {filters.size[1]}m²
                </Badge>
              )}
              {filters.floor.map(floor => (
                <Badge key={floor} variant="secondary" className="text-xs">
                  {floor}. poschodie
                </Badge>
              ))}
              {filters.amenities.map(amenityId => {
                const amenity = AMENITIES.find(a => a.id === amenityId)
                return amenity ? (
                  <Badge key={amenityId} variant="secondary" className="text-xs">
                    {amenity.name}
                  </Badge>
                ) : null
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
