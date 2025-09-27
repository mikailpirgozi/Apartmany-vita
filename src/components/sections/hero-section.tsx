import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-primary/10 to-accent/10 py-20">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Luxusné apartmány v{' '}
            <span className="text-primary">centre Trenčína</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Vyberte si z našich 4 krásne zariadených apartmánov na Štúrovom námestí. 
            Dokonalé ubytovanie pre váš pobyt v historickom centre mesta.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/apartments">Zobraziť apartmány</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link href="/booking">Rezervovať teraz</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}