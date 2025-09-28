import { ApartmentCard } from './apartment-card'
import { Apartment } from '@/types'
import { gridResponsive } from '@/lib/responsive'

interface ApartmentGridProps {
  apartments: Apartment[]
  startDate?: Date
  endDate?: Date
  guests?: number
  childrenCount?: number
  className?: string
  variant?: 'default' | 'large'
}

export function ApartmentGrid({ 
  apartments, 
  startDate, 
  endDate, 
  guests, 
  childrenCount,
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
      {apartments.map((apartment, index) => (
        <ApartmentCard
          key={apartment.id}
          apartment={apartment}
          startDate={startDate}
          endDate={endDate}
          guests={guests}
          childrenCount={childrenCount}
          priority={index === 0} // Prvý apartmán má priority pre LCP
        />
      ))}
    </div>
  )
}