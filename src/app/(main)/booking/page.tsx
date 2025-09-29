import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import { format } from 'date-fns'
import { BookingFlow } from '@/components/booking/booking-flow'
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/beds24/availability?apartment=${apartmentSlug}&checkIn=${checkInStr}&checkOut=${checkOutStr}&guests=${guestCount}&children=${childrenCount}`, {
      cache: 'no-store' // Always get fresh data
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch availability');
    }
    
    availability = await response.json();
    
    if (!availability.success) {
      redirect(`/apartments/${apartmentSlug}?error=pricing`)
    }
    
    // Note: We continue with booking even if isAvailable is false
    // This handles cases where Beds24 API is not working but we still want to allow booking
  } catch (error) {
    console.error('Failed to get availability:', error)
    redirect(`/apartments/${apartmentSlug}?error=pricing`)
  }

  return (
    <div className="min-h-screen bg-background">
      <BookingFlow
        apartment={apartment}
        bookingData={bookingData}
        availability={availability}
      />
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
