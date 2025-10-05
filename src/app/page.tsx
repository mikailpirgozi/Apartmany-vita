import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { ApartmentGrid } from '@/components/apartment/apartment-grid'
import { ApartmentSearch } from '@/components/search/apartment-search'
import { HeroSection } from '@/components/sections/hero-section'
import { FeaturesSection } from '@/components/sections/features-section'
import { getApartments } from '@/services/apartments'
import { getSeoMetadata } from '@/services/seo'
import { seoDataToMetadata } from '@/lib/seo-helpers'
import Link from 'next/link'

// Revalidate every 60 seconds (ISR)
export const revalidate = 60

/**
 * Generate SEO metadata for homepage
 */
export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getSeoMetadata('home', 'sk')
  return seoDataToMetadata(seoData)
}

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

      {/* Breakfast Section */}
      <section className="py-16">
        <div className="container">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl p-8 md:p-12 border-2 border-amber-300 dark:border-amber-700">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4 text-amber-900 dark:text-amber-100">
                  ☕ Ranajky v Pražiarničke
                </h2>
                <p className="text-lg text-amber-800 dark:text-amber-200">
                  Brutálne naložené ranajky priamo v budove! V papučkách si môžete zájsť na čerstvo praženú kávu, 
                  domáce koláčiky a výborné raňajky.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 text-center">
                  <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">Pre hostí apartmánov</p>
                  <p className="text-4xl font-bold text-amber-900 dark:text-amber-100">9,90€</p>
                  <p className="text-sm text-amber-800 dark:text-amber-200">dospelý</p>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 text-center">
                  <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">Pre hostí apartmánov</p>
                  <p className="text-4xl font-bold text-amber-900 dark:text-amber-100">5,90€</p>
                  <p className="text-sm text-amber-800 dark:text-amber-200">dieťa</p>
                </div>
              </div>

              <div className="text-center space-y-4">
                <p className="text-amber-800 dark:text-amber-200 font-medium">
                  ✨ Možnosť donášky priamo do apartmánu!
                </p>
                <div className="flex justify-center gap-4 flex-wrap">
                  <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700">
                    <Link href="/ranajky">Zobraziť menu</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-amber-600 text-amber-900 dark:text-amber-100">
                    <Link href="https://www.praziarnicka.sk" target="_blank" rel="noopener noreferrer">
                      Navštíviť Pražiarničku
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
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
