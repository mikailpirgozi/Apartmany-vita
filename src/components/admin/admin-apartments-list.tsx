'use client'

import { ApartmentEditor } from './apartment-editor'

interface Apartment {
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

interface AdminApartmentsListProps {
  apartments: Apartment[]
}

export function AdminApartmentsList({ apartments }: AdminApartmentsListProps) {
  return (
    <div className="space-y-6">
      {apartments.map((apartment) => (
        <ApartmentEditor
          key={apartment.id}
          apartment={apartment}
        />
      ))}
    </div>
  )
}

