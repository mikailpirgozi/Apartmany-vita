'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ApartmentGrid } from './apartment-grid'
import { Apartment } from '@/types'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ApartmentSearchResultsProps {
  initialApartments: Apartment[]
  hasSearchParams: boolean
}

export function ApartmentSearchResults({ 
  initialApartments, 
  hasSearchParams 
}: ApartmentSearchResultsProps) {
  const [apartments, setApartments] = useState<Apartment[]>(initialApartments)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const checkIn = searchParams.get('checkIn')
  const checkOut = searchParams.get('checkOut')
  const guests = searchParams.get('guests')
  const children = searchParams.get('children')
  
  const loadAvailableApartments = useCallback(async () => {
    if (!checkIn || !checkOut || !guests) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(
        `/api/apartments/available?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}${children ? `&children=${children}` : ''}`,
        {
          headers: {
            'Cache-Control': 'public, max-age=300',
          }
        }
      )
      
      if (!response.ok) {
        throw new Error(`Failed to load apartments: ${response.status}`)
      }
      
      const data = await response.json()
      setApartments(data.apartments || [])
      
    } catch (err) {
      console.error('Error loading available apartments:', err)
      setError(err instanceof Error ? err.message : 'Nepodarilo sa načítať apartmány')
    } finally {
      setIsLoading(false)
    }
  }, [checkIn, checkOut, guests, children])
  
  // Reload availability when search params change
  useEffect(() => {
    if (hasSearchParams && checkIn && checkOut && guests) {
      loadAvailableApartments()
    }
  }, [checkIn, checkOut, guests, children, hasSearchParams, loadAvailableApartments])
  
  const retry = () => {
    loadAvailableApartments()
  }
  
  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={retry}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Skúsiť znovu
            </Button>
          </AlertDescription>
        </Alert>
        
        {/* Show initial apartments as fallback */}
        <div className="opacity-50">
          <p className="text-sm text-muted-foreground mb-4">
            Zobrazujú sa všetky apartmány (bez kontroly dostupnosti):
          </p>
          <ApartmentGrid 
            apartments={initialApartments}
            startDate={checkIn ? new Date(checkIn) : undefined}
            endDate={checkOut ? new Date(checkOut) : undefined}
            guests={guests ? parseInt(guests) : undefined}
            childrenCount={children ? parseInt(children) : undefined}
            variant="large"
          />
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Search Results Info */}
      {hasSearchParams && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Kontrolujem dostupnosť...
              </>
            ) : (
              `Dostupné apartmány (${apartments.length} nájdených)`
            )}
          </h3>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {checkIn && <span>Príchod: {new Date(checkIn).toLocaleDateString('sk-SK')}</span>}
            {checkOut && <span>Odchod: {new Date(checkOut).toLocaleDateString('sk-SK')}</span>}
            {guests && <span>Hostia: {guests}</span>}
          </div>
          {!isLoading && hasSearchParams && apartments.length === 0 && (
            <p className="mt-2 text-sm text-amber-600">
              Žiadne apartmány nie sú dostupné pre zadaný termín. Skúste zmeniť dátumy.
            </p>
          )}
        </div>
      )}
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Kontrolujem dostupnosť apartmánov...</p>
            <p className="text-sm text-muted-foreground mt-1">
              Toto môže trvať niekoľko sekúnd
            </p>
          </div>
        </div>
      )}
      
      {/* Results */}
      {!isLoading && (
        <ApartmentGrid 
          apartments={apartments}
          startDate={checkIn ? new Date(checkIn) : undefined}
          endDate={checkOut ? new Date(checkOut) : undefined}
          guests={guests ? parseInt(guests) : undefined}
          childrenCount={children ? parseInt(children) : undefined}
          variant="large"
        />
      )}
      
      {/* No Results */}
      {!isLoading && apartments.length === 0 && hasSearchParams && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Žiadne apartmány neboli nájdené</h3>
          <p className="text-muted-foreground mb-4">
            Pre zadané dátumy nie sú dostupné žiadne apartmány.
          </p>
          <Button 
            variant="outline" 
            onClick={() => router.push('/apartments')}
          >
            Zobraziť všetky apartmány
          </Button>
        </div>
      )}
    </div>
  )
}
