import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container flex items-center justify-center min-h-[60vh] py-8">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            404 - Stránka nenájdená
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            Ospravedlňujeme sa, ale stránka ktorú hľadáte neexistuje alebo bola presunutá.
          </p>
          
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Späť na domovskú stránku
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link href="/apartments">
                <Search className="mr-2 h-4 w-4" />
                Prezrieť apartmány
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

