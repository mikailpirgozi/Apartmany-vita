import { Button } from '@/components/ui/button'
import { ApartmentGrid } from '@/components/apartment/apartment-grid'
import { ApartmentSearch } from '@/components/search/apartment-search'
import { HeroSection } from '@/components/sections/hero-section'
import { FeaturesSection } from '@/components/sections/features-section'
import { getApartments } from '@/services/apartments'
import Link from 'next/link'

// Revalidate every 60 seconds (ISR)
export const revalidate = 60

export default async function HomePage() {
  const apartments = await getApartments()
  
  return (
    <div className="flex flex-col">
      <HeroSection />
      
      {/* Search Section */}
      <section className="py-8 -mt-10 relative z-10">
        <div className="container">
          <ApartmentSearch className="shadow-lg" />
        </div>
      </section>
      
      <FeaturesSection />

      {/* Apartments Section */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Naše apartmány</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Vyberte si z našich krásne zariadených apartmánov v centre Trenčína
            </p>
          </div>
          
          <ApartmentGrid apartments={apartments} />
          
          <div className="text-center mt-8">
            <Button asChild size="lg" data-testid="view-all-apartments">
              <Link href="/apartments">Zobraziť všetky apartmány</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container">
          <div className="bg-primary/5 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Pripravení na nezabudnuteľný pobyt?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Rezervujte si svoj apartmán už dnes a užite si komfort v srdci Trenčína. 
              Registrovaní zákazníci získajú 5% zľavu na všetky rezervácie.
            </p>
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/booking">Rezervovať apartmán</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
