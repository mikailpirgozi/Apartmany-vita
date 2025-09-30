'use client'

import { ApartmentImageManager } from './apartment-image-manager'

interface Apartment {
  id: string
  name: string
  images: string[]
}

interface AdminApartmentsListProps {
  apartments: Apartment[]
}

export function AdminApartmentsList({ apartments }: AdminApartmentsListProps) {
  return (
    <div className="space-y-6">
      {apartments.map((apartment) => (
        <ApartmentImageManager
          key={apartment.id}
          apartmentId={apartment.id}
          apartmentName={apartment.name}
          currentImages={apartment.images}
          onUpdate={(images) => {
            console.log('Updated images for', apartment.name, ':', images)
          }}
        />
      ))}
    </div>
  )
}

