import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { Coffee, Clock, MapPin, Phone } from 'lucide-react'
import { ALLERGEN_LABELS, GUEST_PRICING } from '@/types/breakfast'
import type { BreakfastCategory } from '@prisma/client'

export const metadata: Metadata = {
  title: 'Ranajky v Pražiarničke – Apartmány Vita Trenčín',
  description: 'Brutálne naložené ranajky priamo v budove! Čerstvo pražená káva, domáce koláčiky, sladké aj slané raňajky. Pre hostí apartmánov 9,90€ dospelý / 5,90€ dieťa.',
  keywords: [
    'ranajky trenčín',
    'pražiarnička trenčín',
    'raňajky apartmány vita',
    'raňajky v centre trenčína',
    'brutálne naložené ranajky',
    'čerstvo pražená káva trenčín',
    'ranajky donáška apartmán',
    'raňajky štúrovo námestie',
  ],
}

export default async function RanajkyPage() {
  // Fetch all active breakfasts grouped by category
  const breakfasts = await prisma.breakfast.findMany({
    where: { isActive: true },
    orderBy: [
      { sortOrder: 'asc' },
      { name: 'asc' },
    ],
  })

  // Group by category
  const categories = [
    { key: 'BREAD_AND_EGGS' as BreakfastCategory, label: 'Chlieb a vajíčka', icon: '🍳' },
    { key: 'SWEET' as BreakfastCategory, label: 'Sladké raňajky', icon: '🥞' },
    { key: 'SAVORY' as BreakfastCategory, label: 'Slané raňajky', icon: '🥓' },
    { key: 'DRINKS' as BreakfastCategory, label: 'Drinky', icon: '🥤' },
    { key: 'SNACKS' as BreakfastCategory, label: 'Celodenné snacky', icon: '🥐' },
  ]

  const breakfastsByCategory = categories.map(cat => ({
    ...cat,
    items: breakfasts.filter(b => b.category === cat.key)
  })).filter(cat => cat.items.length > 0)

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Ranajky v Pražiarničke
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          Brutálne naložené ranajky priamo v budove apartmánov! V papučkách si môžete zájsť na čerstvo praženú kávu, 
          domáce koláčiky a výborné raňajky.
        </p>

        {/* Special Offer for Guests */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-2 border-amber-300 dark:border-amber-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="text-center">
                <p className="text-sm text-amber-800 dark:text-amber-200 mb-1">Pre hostí apartmánov</p>
                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                  {GUEST_PRICING.ADULT}€ <span className="text-lg">dospelý</span>
                </p>
              </div>
              <div className="text-4xl">|</div>
              <div className="text-center">
                <p className="text-sm text-amber-800 dark:text-amber-200 mb-1">&nbsp;</p>
                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                  {GUEST_PRICING.CHILD}€ <span className="text-lg">dieťa</span>
                </p>
              </div>
            </div>
            <p className="text-sm text-amber-800 dark:text-amber-200 mt-4">
              Možnosť donášky priamo do apartmánu!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Opening Hours & Contact */}
      <div className="max-w-4xl mx-auto mb-12 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Otváracie hodiny
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Pondelok - Piatok</span>
              <span>7:30 - 13:00</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Sobota</span>
              <span>8:00 - 13:00</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Nedeľa</span>
              <span>9:00 - 13:00</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Kontakt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
              <span className="text-sm">Štúrovo námestie 132/16, Trenčín</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href="tel:+421940728676" className="text-sm hover:text-primary">
                +421 940 728 676
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Coffee className="h-4 w-4 text-muted-foreground" />
              <a href="https://www.praziarnicka.sk" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary">
                www.praziarnicka.sk
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Menu by Category */}
      <div className="max-w-6xl mx-auto space-y-12">
        {breakfastsByCategory.map((category) => (
          <section key={category.key} id={category.key.toLowerCase()}>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <span className="text-4xl">{category.icon}</span>
              {category.label}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.items.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  {item.images.length > 0 && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={item.images[0]}
                        alt={item.name}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-xl">{item.name}</CardTitle>
                      <Badge variant="default" className="text-lg font-bold">
                        {item.price.toString()}€
                      </Badge>
                    </div>
                    {item.weight && (
                      <CardDescription>{item.weight}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>

                    {item.allergens.length > 0 && (
                      <div>
                        <p className="text-xs font-medium mb-1">Alergény:</p>
                        <div className="flex flex-wrap gap-1">
                          {item.allergens.map(code => (
                            <Badge key={code} variant="outline" className="text-xs">
                              {code}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Allergen Legend */}
      <div className="max-w-6xl mx-auto mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Legenda alergénov</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
              {Object.entries(ALLERGEN_LABELS).map(([code, label]) => (
                <div key={code} className="flex gap-2">
                  <span className="font-bold">{code}.</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="max-w-3xl mx-auto mt-12">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Chceš ranajky priamo do apartmánu?</CardTitle>
            <CardDescription className="text-base">
              Pri rezervácii apartmánu si môžeš objednať ranajky s donáškou priamo k tebe!
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/booking">Rezervovať apartmán</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="https://www.praziarnicka.sk" target="_blank" rel="noopener noreferrer">
                Navštíviť Pražiarničku
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
