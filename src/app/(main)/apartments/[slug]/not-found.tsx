import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Home, Search } from 'lucide-react'
import Link from 'next/link'

export default function ApartmentNotFound() {
  return (
    <div className="container py-16">
      <div className="max-w-md mx-auto text-center">
        <Card>
          <CardContent className="pt-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            
            <h1 className="text-2xl font-bold mb-2">Apartmán nenájdený</h1>
            <p className="text-muted-foreground mb-6">
              Apartmán, ktorý hľadáte, neexistuje alebo bol odstránený.
            </p>
            
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/apartments">
                  <Search className="mr-2 h-4 w-4" />
                  Zobraziť všetky apartmány
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Späť na hlavnú stránku
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
