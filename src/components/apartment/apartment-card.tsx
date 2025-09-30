import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Wifi, ChefHat, Car, Percent } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Apartment } from '@/types'
import { Decimal } from '@prisma/client/runtime/library'
import { calculateStayDiscount } from '@/lib/discounts'
import { differenceInDays } from 'date-fns'

interface ApartmentCardProps {
  apartment: Apartment
  startDate?: Date
  endDate?: Date
  guests?: number
  childrenCount?: number
  variant?: 'default' | 'compact'
  priority?: boolean // Pre LCP optimization
}

// Helper function to convert Decimal to number
const toNumber = (value: number | Decimal): number => {
  return typeof value === 'number' ? value : value.toNumber()
}

export function ApartmentCard({ apartment, startDate, endDate, guests, childrenCount, variant = 'default', priority = false }: ApartmentCardProps) {
  return (
    <Card className={`overflow-hidden transition-all hover:shadow-lg ${variant === 'compact' ? 'compact' : ''}`} data-testid="apartment-card">
      <div className="relative">
        {apartment.images.length > 0 ? (
          <Image
            src={apartment.images[0]}
            alt={apartment.name}
            width={400}
            height={250}
            className="aspect-[16/10] object-cover"
            priority={priority}
          />
        ) : (
          <div className="aspect-[16/10] bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <span className="text-muted-foreground">Foto nie je dostupné</span>
          </div>
        )}
        <Badge variant="secondary" className="absolute top-2 right-2" data-testid="apartment-size">
          {apartment.size}m²
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2">{apartment.name}</h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Max {apartment.maxGuests} osôb</span>
          </div>
          <div>{apartment.floor}. poschodie</div>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <Wifi className="h-4 w-4 text-muted-foreground" />
          <ChefHat className="h-4 w-4 text-muted-foreground" />
          <Car className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Od:</div>
            {startDate && endDate && (() => {
              const nights = differenceInDays(endDate, startDate);
              const basePrice = toNumber(apartment.basePrice);
              const stayDiscount = calculateStayDiscount(nights, basePrice * nights);
              
              if (stayDiscount) {
                const discountedPrice = basePrice - (stayDiscount.discountAmount / nights);
                return (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg line-through text-muted-foreground">{basePrice} eur</span>
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                        <Percent className="h-3 w-3 mr-1" />
                        -{stayDiscount.discountPercent}%
                      </Badge>
                    </div>
                    <span className="text-2xl font-bold text-blue-600" data-testid="apartment-price">{Math.round(discountedPrice)} eur</span>
                    <div className="text-xs text-blue-600">po zľave za {stayDiscount.label}</div>
                  </div>
                );
              }
              
              return <span className="text-2xl font-bold" data-testid="apartment-price">{basePrice} eur</span>;
            })() || <span className="text-2xl font-bold" data-testid="apartment-price">{toNumber(apartment.basePrice)} eur</span>}
          </div>
          
          <Button asChild>
            <Link 
              href={`/apartments/${apartment.slug}${
                startDate && endDate && guests 
                  ? `?checkIn=${startDate.toISOString().split('T')[0]}&checkOut=${endDate.toISOString().split('T')[0]}&guests=${guests}${childrenCount ? `&children=${childrenCount}` : ''}`
                  : ''
              }`}
            >
              Rezervovať
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}