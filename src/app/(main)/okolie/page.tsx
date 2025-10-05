import type { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  MapPin, 
  Clock, 
  Euro, 
  ShoppingBag, 
  Train,
  Car,
  Castle,
  Church,
  Mountain,
  Camera,
  Coffee
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Okolie a atrakcie Trenčína – Apartmány Vita',
  description: 'Objavte Trenčín a okolie. Trenčiansky hrad, centrum mesta, najlepšie reštaurácie, obchody a atrakcie v blízkosti Apartmánov Vita. Kompletný sprievodca mestom.',
  keywords: [
    'atrakcie Trenčín',
    'čo robiť v Trenčíne',
    'Trenčiansky hrad',
    'centrum Trenčína',
    'reštaurácie Trenčín',
    'obchody Trenčín',
    'okolie Trenčína',
    'návšteva Trenčína',
  ],
  openGraph: {
    title: 'Okolie a atrakcie Trenčína – Apartmány Vita',
    description: 'Objavte Trenčín a okolie. Trenčiansky hrad, centrum mesta, reštaurácie a atrakcie.',
    url: 'https://apartmanvita.sk/okolie',
    type: 'website',
  },
}

const attractions = [
  {
    icon: Castle,
    name: 'Trenčiansky hrad',
    category: 'Pamiatka',
    distance: '5 min pešo',
    description: 'Jeden z najväčších hradných komplexov v strednej Európe s úchvatným výhľadom na mesto. História siaha až do 11. storočia.',
    openingHours: 'Máj-September: 9:00-18:00, Október-Apríl: 9:00-16:00',
    price: '8-10 €',
    highlight: true,
  },
  {
    icon: Church,
    name: 'Mestská veža',
    category: 'Pamiatka',
    distance: '2 min pešo',
    description: 'Historická veža z 16. storočia s vyhliadkovou plošinou. Výborný výhľad na Štúrovo námestie a okolie.',
    openingHours: 'Máj-September: 10:00-17:00',
    price: '3 €',
    highlight: false,
  },
  {
    icon: Church,
    name: 'Farský kostol sv. Františka Xaverského',
    category: 'Pamiatka',
    distance: '3 min pešo',
    description: 'Barokový kostol s krásnymi freskami a interiérom. Dominanta Štúrovho námestia.',
    openingHours: 'Denne počas omší',
    price: 'Zadarmo',
    highlight: false,
  },
  {
    icon: Mountain,
    name: 'Brezina',
    category: 'Príroda',
    distance: '15 min autom',
    description: 'Obľúbené miesto na prechádzky a turistiku s výhľadom na Trenčín. Ideálne pre rodinné výlety.',
    openingHours: 'Celoročne',
    price: 'Zadarmo',
    highlight: false,
  },
  {
    icon: Camera,
    name: 'Galéria Miloša Alexandra Bazovského',
    category: 'Kultúra',
    distance: '8 min pešo',
    description: 'Moderná galéria s dielami slovenských výtvarníkov. Pravidelné výstavy a kultúrne podujatia.',
    openingHours: 'Utorok-Nedeľa: 10:00-17:00',
    price: '5 €',
    highlight: false,
  },
]

const restaurants: Array<{
  name: string
  type: string
  distance: string
  priceRange: string
  description: string
  highlight: boolean
  link?: string
  specialNote?: string
}> = [
  {
    name: 'Pražiarnička by Caffe Vita',
    type: 'Prémiová kaviareň',
    distance: 'Priamo v budove! 🏠',
    priceRange: '€€',
    description: 'Naša vlastná prémiová kaviareň priamo v prízemí budovy apartmánov! V papučkách si môžete zájsť na čerstvo praženú kávu, domáce koláčiky, kvalitné drinky a brutálne naložené ranajky. Perfektné miesto na ranné prebudenie alebo popoludňajšiu kávu s výhľadom na námestie.',
    highlight: true,
    link: 'https://www.praziarnicka.sk',
    specialNote: '⭐ Exkluzívna výhoda pre hostí apartmánov - káva na dosah ruky!',
  },
  {
    name: 'Speranza',
    type: 'Talianska reštaurácia',
    distance: '3 min pešo',
    priceRange: '€€',
    description: 'Autentická talianska kuchyňa s čerstvými ingredienciami. Pizza, pasta a talianske víno.',
    highlight: false,
  },
  {
    name: 'Fellini Shisha & Cocktail Bar',
    type: 'Cocktail bar',
    distance: '4 min pešo',
    priceRange: '€€',
    description: 'Moderný bar s širokým výberom koktailov a shishy. Ideálne pre večerné posedenie.',
    highlight: false,
  },
  {
    name: 'Atrio',
    type: 'Reštaurácia & Café',
    distance: '3 min pešo',
    priceRange: '€€',
    description: 'Štýlová reštaurácia s medzinárodnou kuchyňou. Denné menu a à la carte.',
    highlight: false,
  },
  {
    name: 'Steps',
    type: 'Reštaurácia & Bar',
    distance: '2 min pešo',
    priceRange: '€€',
    description: 'Moderná reštaurácia v centre s výbornou kuchyňou a príjemnou atmosférou.',
    highlight: false,
  },
]

const shops: Array<{
  name: string
  type: string
  distance: string
  openingHours: string
  description: string
}> = [
  {
    name: 'Coop Jednota (Prior)',
    type: 'Supermarket',
    distance: '2 min pešo',
    openingHours: '7:00-20:00',
    description: 'Supermarket v obchodnom centre Prior. Kompletný sortiment potravín.',
  },
  {
    name: 'Tesco',
    type: 'Supermarket',
    distance: '3 min pešo',
    openingHours: '7:00-21:00',
    description: 'Veľký supermarket s широkým výberom potravín a drogérie.',
  },
  {
    name: 'Billa',
    type: 'Supermarket',
    distance: '5 min pešo',
    openingHours: '7:00-20:00',
    description: 'Kvalitný supermarket s čerstvými potravinami.',
  },
  {
    name: 'Lekáreň Dr.Max',
    type: 'Lekáreň',
    distance: '2 min pešo',
    openingHours: '8:00-19:00',
    description: 'Lekáreň v centre s широkým sortimentom liekov a drogérie.',
  },
]

const transport: Array<{
  icon: typeof Train
  name: string
  distance: string
  description: string
  highlight: boolean
  link?: string
}> = [
  {
    icon: Train,
    name: 'Vlakové nádražie',
    distance: '10 min pešo',
    description: 'Priame spojenia do Bratislavy, Žiliny a ďalších miest.',
    highlight: false,
  },
  {
    icon: Car,
    name: 'Autobusová stanica',
    distance: '8 min pešo',
    description: 'Regionálne a medzinárodné autobusové spojenia.',
    highlight: false,
  },
  {
    icon: Car,
    name: 'Parkovanie',
    distance: 'Pri apartmánoch',
    description: 'Bezplatné parkovanie pre hostí priamo pri budove.',
    highlight: false,
  },
  {
    icon: Car,
    name: 'BlackRent - Autopožičovňa',
    distance: '5 min pešo',
    description: 'Profesionálna autopožičovňa s moderným vozovým parkom. Online rezervácia na blackrent.sk.',
    highlight: true,
    link: 'https://www.blackrent.sk',
  },
]

export default function OkoliePage() {
  return (
    <div className="container py-12">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Okolie a atrakcie Trenčína
        </h1>
        <p className="text-lg text-muted-foreground">
          Apartmány Vita sa nachádzajú v srdci historického centra Trenčína. 
          Všetky hlavné atrakcie, reštaurácie a obchody máte na dosah ruky.
        </p>
      </div>

      {/* Location Highlight */}
      <Card className="max-w-4xl mx-auto mb-12 bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Naša poloha
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-lg mb-2">
              <strong>Štúrovo námestie 132/16, 911 01 Trenčín</strong>
            </p>
            <p className="text-muted-foreground">
              Nachádzame sa priamo na Štúrovom námestí v historickom centre mesta. 
              Trenčiansky hrad je vzdialený len 5 minút pešo, hlavné námestie 2 minúty. 
              V okolí je množstvo reštaurácií, kaviarní a obchodov.
            </p>
          </div>
          
          {/* Pražiarnička Highlight */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-2 border-amber-300 dark:border-amber-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Coffee className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2 text-amber-900 dark:text-amber-100">
                  ☕ Pražiarnička by Caffe Vita - priamo v budove!
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                  Exkluzívna výhoda pre našich hostí: V prízemí budovy sa nachádza naša vlastná prémiová kaviareň. 
                  V papučkách si môžete zájsť na čerstvo praženú kávu, domáce koláčiky, kvalitné drinky a brutálne naložené ranajky!
                </p>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-3">
                  Pre hostí apartmánov: 9,90€ dospelý / 5,90€ dieťa
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Button asChild size="sm" variant="default" className="bg-amber-600 hover:bg-amber-700">
                    <Link href="/ranajky">
                      Zobraziť menu ranajok
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="border-amber-600">
                    <Link href="https://www.praziarnicka.sk" target="_blank" rel="noopener noreferrer">
                      Navštíviť web
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attractions */}
      <section className="max-w-6xl mx-auto mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Top atrakcie v Trenčíne
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attractions.map((attraction, index) => (
            <Card 
              key={index} 
              className={attraction.highlight ? 'border-primary shadow-lg' : ''}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <attraction.icon className="h-8 w-8 text-primary" />
                  {attraction.highlight && (
                    <Badge variant="default">Top atrakcia</Badge>
                  )}
                </div>
                <CardTitle className="text-xl">{attraction.name}</CardTitle>
                <CardDescription>
                  <Badge variant="secondary" className="mr-2">
                    {attraction.category}
                  </Badge>
                  <span className="text-sm">{attraction.distance}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {attraction.description}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{attraction.openingHours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-muted-foreground" />
                    <span>{attraction.price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Restaurants */}
      <section className="max-w-6xl mx-auto mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Reštaurácie a kaviarne
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {restaurants.map((restaurant, index) => (
            <Card 
              key={index}
              className={restaurant.highlight ? 'border-primary shadow-md' : ''}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{restaurant.name}</CardTitle>
                    <CardDescription>{restaurant.type}</CardDescription>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge variant="outline">{restaurant.priceRange}</Badge>
                    {restaurant.highlight && (
                      <Badge variant="default" className="text-xs">Odporúčame</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {restaurant.description}
                </p>
                {restaurant.specialNote && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                    <p className="text-sm font-medium text-primary">
                      {restaurant.specialNote}
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{restaurant.distance}</span>
                </div>
                {restaurant.link && (
                  <Button asChild size="sm" className="w-full">
                    <Link href={restaurant.link} target="_blank" rel="noopener noreferrer">
                      Navštíviť web
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Shops */}
      <section className="max-w-6xl mx-auto mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Obchody v okolí
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {shops.map((shop, index) => (
            <Card key={index}>
              <CardHeader>
                <ShoppingBag className="h-6 w-6 text-primary mb-2" />
                <CardTitle className="text-lg">{shop.name}</CardTitle>
                <CardDescription>{shop.type}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {shop.description && (
                  <p className="text-muted-foreground mb-2">{shop.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{shop.distance}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{shop.openingHours}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Transport */}
      <section className="max-w-6xl mx-auto mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Doprava a dostupnosť
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {transport.map((item, index) => (
            <Card 
              key={index}
              className={item.highlight ? 'border-primary shadow-lg bg-primary/5' : ''}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <item.icon className="h-8 w-8 text-primary mb-2" />
                  {item.highlight && (
                    <Badge variant="default">Odporúčame</Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <CardDescription>{item.distance}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
                {item.link && (
                  <Button asChild size="sm" className="w-full">
                    <Link href={item.link} target="_blank" rel="noopener noreferrer">
                      Navštíviť web
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <div className="max-w-3xl mx-auto">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Pripravení objaviť Trenčín?
            </CardTitle>
            <CardDescription className="text-center text-base">
              Rezervujte si apartmán v centre mesta a užite si všetky atrakcie na dosah ruky.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/apartments">Naše apartmány</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/booking">Rezervovať</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tips Section */}
      <section className="max-w-4xl mx-auto mt-16">
        <Card>
          <CardHeader>
            <CardTitle>💡 Tipy pre návštevníkov</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Najlepší čas na návštevu</h3>
              <p className="text-sm text-muted-foreground">
                Jar a leto (máj-september) sú ideálne pre návštevu hradu a prechádzky mestom. 
                V zime je Trenčín kúzelný s vianočnými trhmi na námestí.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Ako sa dostať na hrad</h3>
              <p className="text-sm text-muted-foreground">
                Z Apartmánov Vita je to 5 minút pešo cez historické centrum. 
                Cesta vedie cez Štúrovo námestie a potom po schodoch hore k hradu.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Parkovanie</h3>
              <p className="text-sm text-muted-foreground">
                Naši hostia majú bezplatné parkovanie priamo pri apartmánoch. 
                Verejné parkovanie je dostupné na Štúrovom námestí (platené).
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Víkendový tip</h3>
              <p className="text-sm text-muted-foreground">
                Sobota ráno: návšteva hradu → obed v centre → popoludní prechádzka po Brezine → 
                večer v reštaurácii na námestí.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
