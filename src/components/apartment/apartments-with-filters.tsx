'use client'

import { useState } from 'react'
import { ApartmentFilters } from '@/components/search/apartment-filters'
import { ApartmentSearchResults } from '@/components/apartment/apartment-search-results'
import type { Apartment, SearchFilters } from '@/types'

interface ApartmentsWithFiltersProps {
  initialApartments: Apartment[]
  hasSearchParams: boolean
}

export function ApartmentsWithFilters({ 
  initialApartments, 
  hasSearchParams 
}: ApartmentsWithFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters | null>(null)
  
  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters)
    console.log('Filters changed:', newFilters)
    // TODO: Implement actual filtering logic here
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Filters Sidebar */}
      <div className="lg:col-span-1">
        <ApartmentFilters onFilterChange={handleFilterChange} />
      </div>
      
      {/* Search Results */}
      <div className="lg:col-span-3">
        <ApartmentSearchResults 
          initialApartments={initialApartments}
          hasSearchParams={hasSearchParams}
        />
      </div>
    </div>
  )
}

