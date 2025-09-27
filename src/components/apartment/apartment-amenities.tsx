import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AMENITIES } from '@/constants'
import { 
  Wifi, 
  ChefHat, 
  Car, 
  Tv, 
  Snowflake, 
  Thermometer, 
  Shirt, 
  Utensils, 
  Trees, 
  ArrowUp, 
  Heart, 
  Cigarette 
} from 'lucide-react'

const iconMap = {
  Wifi,
  ChefHat,
  Car,
  Tv,
  Snowflake,
  Thermometer,
  Shirt,
  Utensils,
  Trees,
  ArrowUp,
  Heart,
  Cigarette
}

interface ApartmentAmenitiesProps {
  amenities: string[]
}

export function ApartmentAmenities({ amenities }: ApartmentAmenitiesProps) {
  const availableAmenities = AMENITIES.filter(amenity => 
    amenities.includes(amenity.id)
  )

  if (availableAmenities.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vybavenie apartmánu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {availableAmenities.map((amenity) => {
            const IconComponent = iconMap[amenity.icon as keyof typeof iconMap]
            
            return (
              <div key={amenity.id} className="flex items-center gap-3">
                {IconComponent && (
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <IconComponent className="h-4 w-4 text-primary" />
                  </div>
                )}
                <span className="text-sm font-medium">{amenity.name}</span>
              </div>
            )
          })}
        </div>
        
        {/* Additional amenities as badges */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-sm font-medium mb-3">Všetko vybavenie:</h4>
          <div className="flex flex-wrap gap-2">
            {availableAmenities.map((amenity) => (
              <Badge key={amenity.id} variant="secondary">
                {amenity.name}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
