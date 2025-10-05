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

// Helper function to safely convert to number (handles already-converted values)
const toNumber = (value: number | Decimal): number => {
  if (typeof value === 'number') return value;
  // If it's a Decimal object with toNumber method
  if (value && typeof value === 'object' && 'toNumber' in value && typeof value.toNumber === 'function') {
    return value.toNumber();
  }
  // If it's already serialized (plain object or string), parse it
  return typeof value === 'string' ? parseFloat(value) : Number(value);
}

export function ApartmentCard({ apartment, startDate, endDate, guests, childrenCount, variant = 'default', priority = false }: ApartmentCardProps) {
  return (
    <Card className={`overflow-hidden transition-all hover:shadow-xl rounded-xl py-0 gap-0 ${variant === 'compact' ? 'compact' : ''}`} data-testid="apartment-card">
      <div className="relative w-full">
        {apartment.images.length > 0 && apartment.images[0] ? (
          <Image
            src={apartment.images[0]}
            alt={`${apartment.name} Trenčín – moderný apartmán s kompletným vybavením, WiFi a parkovaním zadarmo`}
            width={400}
            height={225}
            className="aspect-[16/9] object-cover w-full"
            priority={priority}
          />
        ) : (
          <div className="aspect-[16/9] bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <span className="text-muted-foreground">Foto nie je dostupné</span>
          </div>
        )}
      </div>
      
      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold text-lg leading-tight">{apartment.name}</h3>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>Max {apartment.maxGuests} osôb</span>
            <span className="mx-1">•</span>
            <span data-testid="apartment-size">{apartment.size}m²</span>
          </div>
          <div>{apartment.floor}. poschodie</div>
        </div>
        
        <div className="flex items-center gap-2.5">
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