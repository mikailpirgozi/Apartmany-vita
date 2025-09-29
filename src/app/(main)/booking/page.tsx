import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import { format } from 'date-fns'
import { BookingFlow2Step } from '@/components/booking/booking-flow-2step'
import { getApartmentBySlug } from '@/services/apartments'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

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

  // Get apartment data
  const apartment = await getApartmentBySlug(apartmentSlug)
  
  if (!apartment) {
    notFound()
  }

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

  // Get pricing from Beds24 API instead of local calculation
  let availability
  try {
    const checkInStr = format(checkInDate, 'yyyy-MM-dd');
    const checkOutStr = format(checkOutDate, 'yyyy-MM-dd');
    
    // Use internal API call instead of external fetch
    const { getBeds24Service } = await import('@/services/beds24');
    const beds24Service = getBeds24Service();
    
    if (!beds24Service) {
      // No fallback - Beds24 service is required for real availability data
      console.error('❌ Beds24Service not available - cannot get real availability data');
      redirect(`/apartments/${apartmentSlug}?error=beds24-unavailable`);
    } else {
      // Use Beds24 API
      const apartmentMapping: Record<string, { propId: string; roomId: string }> = {
        'design-apartman': { propId: '227484', roomId: '483027' },
        'lite-apartman': { propId: '168900', roomId: '357932' },
        'deluxe-apartman': { propId: '161445', roomId: '357931' },
        'maly-apartman': { propId: '161445', roomId: '357931' }
      };
      
      const apartmentConfig = apartmentMapping[apartmentSlug];
      if (!apartmentConfig) {
        throw new Error(`Unknown apartment: ${apartmentSlug}`);
      }
      
      availability = await beds24Service.getInventoryCalendar({
        propId: apartmentConfig.propId,
        roomId: apartmentConfig.roomId,
        startDate: checkInStr,
        endDate: checkOutStr
      });
      
      // Convert to expected format with internal pricing
      const beds24Availability = availability;
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Use internal pricing instead of Beds24 prices
      const internalPricePerNight = Number(apartment.basePrice);
      const totalPrice = internalPricePerNight * nights;
      
      availability = {
        success: true,
        isAvailable: beds24Availability.available.length > 0, // Check if dates are available
        totalPrice,
        pricePerNight: internalPricePerNight,
        nights
      };
    }
    
    if (!availability.success || !availability.isAvailable) {
      redirect(`/apartments/${apartmentSlug}?error=unavailable`)
    }
  } catch (error) {
    console.error('Failed to get availability:', error)
    redirect(`/apartments/${apartmentSlug}?error=pricing`)
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container">
        <BookingFlow2Step
          apartment={apartment}
          bookingData={bookingData}
          availability={availability.isAvailable}
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
