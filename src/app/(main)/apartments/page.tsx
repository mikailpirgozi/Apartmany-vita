import { ApartmentGrid } from '@/components/apartment/apartment-grid'
import { ApartmentSearch } from '@/components/search/apartment-search'
import { getApartments } from '@/services/apartments'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Všetky apartmány - Apartmány Vita Trenčín',
  description: 'Prezrite si všetky naše luxusné apartmány v centre Trenčína. Vyberte si z 4 krásne zariadených apartmánov na Štúrovom námestí.',
  keywords: [
    'apartmány Trenčín',
    'ubytovanie Trenčín centrum',
    'apartmány Štúrovo námestie',
    'luxusné ubytovanie Trenčín'
  ]
}

interface ApartmentsPageProps {
  searchParams: Promise<{ 
    checkIn?: string
    checkOut?: string
    guests?: string
    children?: string
  }>
}

export default async function ApartmentsPage({ searchParams }: ApartmentsPageProps) {
  const apartments = await getApartments()
  const params = await searchParams
  
  // Parse search params
  const checkIn = params.checkIn ? new Date(params.checkIn) : undefined
  const checkOut = params.checkOut ? new Date(params.checkOut) : undefined
  const guests = params.guests ? parseInt(params.guests) : undefined
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Naše apartmány</h1>
        <p className="text-muted-foreground max-w-2xl">
          Vyberte si z našich krásne zariadených apartmánov v historickom centre Trenčína. 
          Každý apartmán ponúka jedinečné vybavenie a komfort pre váš pobyt.
        </p>
      </div>

      {/* Search Form */}
      <div className="mb-8">
        <ApartmentSearch 
          initialValues={{
            checkIn,
            checkOut,
            guests,
            children: params.children ? parseInt(params.children) : 0
          }}
        />
      </div>
      
      {/* Search Results Info */}
      {(checkIn || checkOut || guests) && (
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-medium mb-2">Výsledky vyhľadávania:</h3>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {checkIn && <span>Príchod: {checkIn.toLocaleDateString('sk-SK')}</span>}
            {checkOut && <span>Odchod: {checkOut.toLocaleDateString('sk-SK')}</span>}
            {guests && <span>Hostia: {guests}</span>}
          </div>
        </div>
      )}
      
      <ApartmentGrid 
        apartments={apartments}
        startDate={checkIn}
        endDate={checkOut}
        guests={guests}
        variant="large"
      />
      
      {apartments.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Žiadne apartmány neboli nájdené</h3>
          <p className="text-muted-foreground">
            Skúste zmeniť parametre vyhľadávania alebo sa vráťte neskôr.
          </p>
        </div>
      )}
    </div>
  )
}
