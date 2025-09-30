import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Users, Baby, Home, MapPin } from 'lucide-react'
import { Apartment } from '@/types'

interface ApartmentDetailsProps {
  apartment: Apartment
}

export function ApartmentDetails({ apartment }: ApartmentDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span data-testid="apartment-name">{apartment.name}</span>
            <Badge variant="outline">{apartment.floor}. poschodie</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed" data-testid="apartment-description">
            {apartment.description}
          </p>
          
          <Separator />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{apartment.size}m²</p>
                <p className="text-xs text-muted-foreground">Rozloha</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Max {apartment.maxGuests}</p>
                <p className="text-xs text-muted-foreground">Dospelí</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Baby className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Max {apartment.maxChildren}</p>
                <p className="text-xs text-muted-foreground">Deti</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{apartment.floor}. poschodie</p>
                <p className="text-xs text-muted-foreground">Umiestnenie</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Info */}
      <Card>
        <CardHeader>
          <CardTitle>Poloha</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Štúrovo námestie 132/16</p>
                <p className="text-sm text-muted-foreground">911 01 Trenčín, Slovensko</p>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Priamo v historickom centre Trenčína</p>
              <p>• 2 minúty pešo od Trenčianskeho hradu</p>
              <p>• 5 minút pešo od hlavnej železničnej stanice</p>
              <p>• Reštaurácie a obchody v bezprostrednej blízkosti</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* House Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Pravidlá ubytovania</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium mb-2">Check-in / Check-out</p>
              <p className="text-muted-foreground">Príchod: 15:00 - 22:00</p>
              <p className="text-muted-foreground">Odchod: do 11:00</p>
            </div>
            
            <div>
              <p className="font-medium mb-2">Všeobecné pravidlá</p>
              <p className="text-muted-foreground">• Zákaz fajčenia v apartmáne</p>
              <p className="text-muted-foreground">• Tiché hodiny: 22:00 - 07:00</p>
              <p className="text-muted-foreground">• Maximálny počet hostí: {apartment.maxGuests}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
