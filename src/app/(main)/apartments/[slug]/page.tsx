import { notFound } from 'next/navigation'
import { ApartmentGallery } from '@/components/apartment/apartment-gallery'
import { ApartmentDetails } from '@/components/apartment/apartment-details'
import { ApartmentAmenities } from '@/components/apartment/apartment-amenities'
import { BookingWidget } from '@/components/booking/booking-widget'
import { RoomStructuredData } from '@/components/seo/room-structured-data'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
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
  
  // Convert Decimal to number for Room schema
  const apartmentForSchema = {
    name: apartment.name,
    slug: apartment.slug,
    description: apartment.description,
    size: apartment.size,
    maxGuests: apartment.maxGuests,
    basePrice: typeof apartment.basePrice === 'number' ? apartment.basePrice : apartment.basePrice.toNumber(),
    images: apartment.images,
    amenities: apartment.amenities
  }

  return (
    <div className="container py-8">
      {/* Room Structured Data for SEO */}
      <RoomStructuredData apartment={apartmentForSchema} />
      
      {/* Breadcrumbs for navigation and SEO */}
      <Breadcrumbs 
        items={[
          { name: 'Apartmány', url: 'https://apartmanvita.sk/apartments' },
          { name: apartment.name, url: `https://apartmanvita.sk/apartments/${apartment.slug}` },
        ]} 
      />
      
      {/* H1 heading for SEO - visible and optimized */}
      <h1 className="text-3xl font-bold mb-6">{apartment.name} - Apartmány Vita Trenčín</h1>
      
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
