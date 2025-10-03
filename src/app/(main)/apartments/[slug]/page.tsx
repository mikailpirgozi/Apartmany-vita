import { notFound } from 'next/navigation'
import { ApartmentGallery } from '@/components/apartment/apartment-gallery'
import { ApartmentDetails } from '@/components/apartment/apartment-details'
import { ApartmentAmenities } from '@/components/apartment/apartment-amenities'
import { BookingWidget } from '@/components/booking/booking-widget'
import { getApartmentBySlug } from '@/services/apartments'
import { getApartmentSeo } from '@/services/seo'
import { apartmentSeoToMetadata } from '@/lib/seo-helpers'
import type { Metadata } from 'next'

interface ApartmentPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    checkIn?: string
    checkOut?: string
    guests?: string
    children?: string
  }>
}

/**
 * Generate dynamic SEO metadata for apartment detail page
 */
export async function generateMetadata({ params }: ApartmentPageProps): Promise<Metadata> {
  const { slug } = await params
  const apartmentSeo = await getApartmentSeo(slug, 'sk')
  
  if (!apartmentSeo) {
    return {
      title: 'Apartmán nenájdený'
    }
  }
  
  return apartmentSeoToMetadata(apartmentSeo)
}

export default async function ApartmentPage({ params, searchParams }: ApartmentPageProps) {
  const { slug } = await params
  const searchParamsData = await searchParams
  const apartment = await getApartmentBySlug(slug)
  
  if (!apartment) {
    notFound()
  }
  
  // Parse search params for booking widget
  const checkIn = searchParamsData.checkIn ? new Date(searchParamsData.checkIn) : undefined
  const checkOut = searchParamsData.checkOut ? new Date(searchParamsData.checkOut) : undefined
  const guests = searchParamsData.guests ? parseInt(searchParamsData.guests) : undefined
  const children = searchParamsData.children ? parseInt(searchParamsData.children) : undefined
  
  return (
    <div className="container py-8">
      {/* H1 heading for SEO */}
      <h1 className="sr-only">{apartment.name} - Apartmány Vita Lučenec</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Images & Details */}
        <div className="lg:col-span-2 space-y-8">
          <ApartmentGallery 
            images={apartment.images} 
            apartmentName={apartment.name}
          />
          
          <ApartmentDetails apartment={apartment} />
          
          <ApartmentAmenities amenities={apartment.amenities} />
        </div>
        
        {/* Right Column - Booking Widget */}
        <div className="lg:col-span-1">
          <BookingWidget 
            apartment={apartment}
            initialCheckIn={checkIn}
            initialCheckOut={checkOut}
            initialGuests={guests || 2}
            initialChildren={children || 0}
          />
        </div>
      </div>
    </div>
  )
}
