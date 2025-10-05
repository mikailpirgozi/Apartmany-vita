import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import { BookingFlow2Step } from '@/components/booking/booking-flow-2step'
// TEMPORARY: Commented out to avoid Prisma engine issue on Vercel
// import { getApartmentBySlug } from '@/services/apartments'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import type { Apartment } from '@/types'

// WORKAROUND: Static apartment data to bypass Prisma on Vercel
const STATIC_APARTMENTS: Apartment[] = [
  {
    id: '4',
    slug: 'deluxe-apartman',
    name: 'Deluxe Apartmán',
    description: 'Najluxusnejší apartmán s krásnym výhľadom a kompletným vybavením pre až 6 hostí.',
    size: 70,
    maxGuests: 6,
    maxChildren: 4,
    floor: 2,
    basePrice: 100,
    amenities: ['wifi', 'kitchen', 'tv', 'heating', 'washer', 'dishwasher', 'balcony', 'elevator', 'parking'],
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop&crop=center'
    ],
    isActive: true,
    seoKeywords: ['deluxe', 'apartmán', 'lučenec', 'luxusné', 'ubytovanie'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    slug: 'lite-apartman',
    name: 'Lite Apartmán',
    description: 'Priestranný apartmán na druhom poschodí s balkónom a krásnym výhľadom na mesto.',
    size: 55,
    maxGuests: 2,
    maxChildren: 1,
    floor: 2,
    basePrice: 75,
    amenities: ['wifi', 'kitchen', 'tv', 'heating', 'washer', 'dishwasher', 'balcony', 'elevator'],
    images: [
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop&crop=center'
    ],
    isActive: true,
    seoKeywords: ['lite', 'apartmán', 'lučenec', 'balkón', 'ubytovanie'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    slug: 'design-apartman',
    name: 'Design Apartmán',
    description: 'Štýlovo zariadený apartmán s moderným dizajnom. Perfektný pre páry.',
    size: 45,
    maxGuests: 6,
    maxChildren: 4,
    floor: 1,
    basePrice: 105,
    amenities: ['wifi', 'kitchen', 'tv', 'heating', 'washer', 'elevator'],
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&crop=center'
    ],
    isActive: true,
    seoKeywords: ['design', 'apartmán', 'lučenec', 'moderný', 'dizajn'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

interface BookingPageProps {
  searchParams: Promise<{
    apartment?: string
    checkin?: string
    checkout?: string
    guests?: string
    children?: string
  }>
}

export default async function BookingPage({ searchParams }: BookingPageProps) {
  return (
    <Suspense fallback={<BookingPageSkeleton />}>
      <BookingContent searchParams={searchParams} />
    </Suspense>
  )
}

async function BookingContent({ searchParams }: BookingPageProps) {
  // CRITICAL: Validate database connection FIRST
  const { validateDatabaseUrl, getDatabaseInfo } = await import('@/lib/db-check');
  const dbValidation = validateDatabaseUrl();
  
  if (!dbValidation.valid) {
    console.error('❌ DATABASE ERROR:', {
      error: dbValidation.error,
      info: getDatabaseInfo()
    });
    // TEMPORARY: Log error but don't redirect (for debugging)
    console.warn('⚠️ Database validation failed but continuing anyway for debugging...');
    // redirect('/apartments?error=database-config'); // TEMPORARILY DISABLED
  }
  
  const { apartment: apartmentSlug, checkin, checkout, guests, children } = await searchParams

  // Validate required parameters
  if (!apartmentSlug || !checkin || !checkout || !guests) {
    redirect('/apartments')
  }

  // Parse and validate dates
  const checkInDate = new Date(checkin)
  const checkOutDate = new Date(checkout)
  
  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime()) || checkInDate >= checkOutDate) {
    redirect(`/apartments/${apartmentSlug}`)
  }

  // Parse guest counts
  const guestCount = parseInt(guests) || 2
  const childrenCount = parseInt(children || '0') || 0

  // WORKAROUND: Use static data directly - bypass Prisma completely on Vercel
  console.log('🔍 Getting apartment data for slug:', apartmentSlug);
  const apartment = STATIC_APARTMENTS.find(apt => apt.slug === apartmentSlug);
  
  if (!apartment) {
    console.error('❌ Apartment not found:', apartmentSlug);
    notFound()
  }
  
  console.log('✅ Using static apartment data:', apartment.name);

  // Validate guest capacity
  if (guestCount + childrenCount > apartment.maxGuests) {
    redirect(`/apartments/${apartmentSlug}?error=capacity`)
  }

  // Calculate pricing
  const bookingData = {
    checkIn: checkInDate,
    checkOut: checkOutDate,
    guests: guestCount,
    children: childrenCount
  }

  // Calculate comprehensive pricing using pricing service (server-side)
  let availability;
  let pricingData;
  
  try {
    
    // Import pricing service
    const { calculateBookingPrice } = await import('@/services/pricing');
    
    // Calculate pricing server-side (includes Beds24 API calls)
    pricingData = await calculateBookingPrice({
      apartmentId: apartment.id,
      apartmentSlug: apartment.slug,
      basePrice: Number(apartment.basePrice),
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: guestCount,
      children: childrenCount
      // No userId here - loyalty discount will be calculated in client component if user is logged in
    });
    
    console.log('✅ Pricing calculated successfully:', {
      total: pricingData.total,
      nights: pricingData.nights,
      hasBreakdown: !!pricingData.breakdown,
      breakdownLength: pricingData.breakdown?.length
    });
    
    // Availability is determined by successful pricing calculation
    availability = {
      success: true,
      isAvailable: true, // If pricing succeeds, dates are available
      totalPrice: pricingData.total,
      pricePerNight: pricingData.pricePerNight,
      nights: pricingData.nights
    };
  } catch (error) {
    console.error('❌ Failed to calculate pricing:', {
      error,
      apartmentId: apartment.id,
      slug: apartmentSlug,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: guestCount,
      children: childrenCount,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined
    })
    
    // Redirect with detailed error info
    redirect(`/apartments/${apartmentSlug}?error=pricing&details=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown')}`)
  }

  // TypeScript safety: This should never happen because redirect() would have been called in catch
  if (!pricingData || !availability) {
    console.error('❌ Pricing data or availability is undefined after calculation');
    redirect(`/apartments/${apartmentSlug}?error=pricing`);
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container">
        <BookingFlow2Step
          apartment={apartment}
          bookingData={bookingData}
          availability={availability.isAvailable}
          initialPricing={pricingData}
        />
      </div>
    </div>
  )
}

function BookingPageSkeleton() {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-2 w-full mb-6" />
        
        <div className="flex items-center justify-between">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <Skeleton className="w-8 h-8 rounded-full mb-2" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-6" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end">
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  )
}
