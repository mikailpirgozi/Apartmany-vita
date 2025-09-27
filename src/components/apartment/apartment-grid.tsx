import { ApartmentCard } from './apartment-card'
import { Apartment } from '@/types'
import { gridResponsive } from '@/lib/responsive'

interface ApartmentGridProps {
  apartments: Apartment[]
  startDate?: Date
  endDate?: Date
  guests?: number
  className?: string
  variant?: 'default' | 'large'
}

export function ApartmentGrid({ 
  apartments, 
  startDate, 
  endDate, 
  guests, 
  className,
  variant = 'default'
}: ApartmentGridProps) {
  const gridClass = variant === 'large' ? gridResponsive.apartmentsLarge : gridResponsive.apartments
  if (apartments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">Žiadne apartmány neboli nájdené.</p>
      </div>
    )
  }

  return (
    <div className={className || gridClass}>
      {apartments.map((apartment) => (
        <ApartmentCard
          key={apartment.id}
          apartment={apartment}
          startDate={startDate}
          endDate={endDate}
          guests={guests}
        />
      ))}
    </div>
  )
}