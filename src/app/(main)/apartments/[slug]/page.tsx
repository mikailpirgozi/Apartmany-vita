import { notFound } from 'next/navigation'
import { ApartmentGallery } from '@/components/apartment/apartment-gallery'
import { ApartmentDetails } from '@/components/apartment/apartment-details'
import { ApartmentAmenities } from '@/components/apartment/apartment-amenities'
import { BookingWidget } from '@/components/booking/booking-widget'
import { getApartmentBySlug } from '@/services/apartments'
import { Metadata } from 'next'

interface ApartmentPageProps {
  params: { slug: string }
  searchParams: { checkIn?: string; checkOut?: string; guests?: string }
}

export async function generateMetadata({ params }: ApartmentPageProps): Promise<Metadata> {
  const { slug } = await params
  const apartment = await getApartmentBySlug(slug)
  
  if (!apartment) {
    return {
      title: 'Apartmán nenájdený'
    }
  }
  
  return {
    title: `${apartment.name} - Apartmány Vita Trenčín`,
    description: `${apartment.description}. ${apartment.size}m², max ${apartment.maxGuests} osôb. Rezervujte si luxusný apartmán v centre Trenčína.`,
    keywords: [
      'apartmán Trenčín',
      'ubytovanie Trenčín centrum',
      apartment.name,
      `apartmán ${apartment.size}m²`,
      'Štúrovo námestie'
    ],
    openGraph: {
      title: `${apartment.name} - Apartmány Vita`,
      description: apartment.description,
      images: apartment.images.map(img => ({
        url: img,
        width: 800,
        height: 600,
        alt: apartment.name
      })),
      type: 'website'
    }
  }
}

export default async function ApartmentPage({ params, searchParams }: ApartmentPageProps) {
  const { slug } = await params
  const apartment = await getApartmentBySlug(slug)
  
  if (!apartment) {
    notFound()
  }
  
  return (
    <div className="container py-8">
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
          <BookingWidget apartment={apartment} />
        </div>
      </div>
    </div>
  )
}
