import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'
import { Users, Square } from 'lucide-react'
import type { Apartment } from '@/types'

interface RelatedApartmentsProps {
  currentApartmentSlug: string
  apartments: Apartment[]
}

/**
 * Related Apartments component - shows other apartments as suggestions
 * Improves internal linking and helps users discover other options
 */
export function RelatedApartments({ currentApartmentSlug, apartments }: RelatedApartmentsProps) {
  // Filter out current apartment and show max 2 others
  const relatedApartments = apartments
    .filter(apt => apt.slug !== currentApartmentSlug)
    .slice(0, 2)

  if (relatedApartments.length === 0) {
    return null
  }

  return (
    <section className="mt-12 pt-12 border-t">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Pozrite si aj ďalšie apartmány</h2>
        <p className="text-muted-foreground">
          Možno vás zaujmú aj naše ďalšie apartmány v centre Trenčína
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {relatedApartments.map((apartment) => {
          const basePrice = typeof apartment.basePrice === 'number' 
            ? apartment.basePrice 
            : apartment.basePrice.toNumber()

          return (
            <Card key={apartment.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative w-full aspect-[16/9]">
                {apartment.images[0] ? (
                  <Image
                    src={apartment.images[0]}
                    alt={`${apartment.name} Trenčín – moderný apartmán v centre mesta`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <span className="text-muted-foreground">Foto nie je dostupné</span>
                  </div>
                )}
              </div>

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{apartment.name}</CardTitle>
                    <CardDescription className="mt-2">
                      {apartment.description.substring(0, 100)}...
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span>Max {apartment.maxGuests} osôb</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Square className="h-4 w-4" />
                    <span>{apartment.size}m²</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {apartment.maxGuests < 4 && (
                    <Badge variant="secondary">Pre páry</Badge>
                  )}
                  {apartment.maxGuests >= 6 && (
                    <Badge variant="secondary">Pre rodiny</Badge>
                  )}
                  {apartment.size > 60 && (
                    <Badge variant="secondary">Priestranný</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <div className="text-sm text-muted-foreground">Od:</div>
                    <div className="text-2xl font-bold">{basePrice} €</div>
                    <div className="text-xs text-muted-foreground">za noc</div>
                  </div>

                  <Button asChild>
                    <Link href={`/apartments/${apartment.slug}`}>
                      Pozrieť detail
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="text-center mt-8">
        <Button asChild variant="outline" size="lg">
          <Link href="/apartments">
            Zobraziť všetky apartmány
          </Link>
        </Button>
      </div>
    </section>
  )
}
