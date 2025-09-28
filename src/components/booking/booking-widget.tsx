"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { format, differenceInDays } from "date-fns";
import { Calendar, Users, Minus, Plus, Info, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge"; // Removed - not using loyalty badges
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { OptimizedAvailabilityCalendar } from "@/components/booking/optimized-availability-calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
// import { calculateBookingPrice, BookingPricing, LoyaltyTier } from "@/services/pricing"; // Now using Beds24 API pricing
import type { Apartment } from "@/types";

interface BookingWidgetProps {
  apartment: Apartment;
  initialCheckIn?: Date;
  initialCheckOut?: Date;
  initialGuests?: number;
  initialChildren?: number;
  onBookingStart?: (data: BookingData) => void;
  className?: string;
}

interface BookingData {
  apartmentId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  children: number;
}

interface GuestSelectorProps {
  adults: number;
  maxGuests: number;
  maxChildren: number;
  onAdultsChange: (count: number) => void;
  onChildrenChange: (count: number) => void;
  children: React.ReactNode;
}

export function BookingWidget({
  apartment,
  initialCheckIn,
  initialCheckOut,
  initialGuests = 2,
  initialChildren = 0,
  onBookingStart,
  className
}: BookingWidgetProps) {
  const { data: session } = useSession() as { data: Session | null };
  const [checkIn, setCheckIn] = useState<Date | undefined>(initialCheckIn);
  const [checkOut, setCheckOut] = useState<Date | undefined>(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);
  const [children, setChildren] = useState(initialChildren);
  const [showCalendar, setShowCalendar] = useState<'checkin' | 'checkout' | 'enhanced' | null>(null);

  // Check availability when dates are selected - OPTIMIZED CACHE
  const { data: availability, isLoading: isAvailabilityLoading, error: availabilityError } = useQuery({
    queryKey: ['booking-availability', apartment.slug, checkIn, checkOut, guests, children],
    queryFn: async () => {
      if (!checkIn || !checkOut) return null;
      
      // Format dates in local timezone to avoid UTC conversion issues
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const checkInStr = formatDate(checkIn);
      const checkOutStr = formatDate(checkOut);
      const url = `/api/beds24/availability?apartment=${apartment.slug}&checkIn=${checkInStr}&checkOut=${checkOutStr}&guests=${guests}&children=${children}`;
      console.log('🔍 Fetching booking availability from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'public, max-age=300', // 5 minutes browser cache
        }
      });
      if (!response.ok) {
        console.error('Availability fetch failed:', response.status, response.statusText);
        throw new Error('Failed to fetch availability');
      }
      
      const data = await response.json();
      console.log('✅ Booking availability data received:', data);
      return data;
    },
    enabled: !!(checkIn && checkOut && checkIn < checkOut),
    staleTime: 10 * 60 * 1000,        // 10 minutes (optimized from 2 minutes)
    gcTime: 30 * 60 * 1000,           // 30 minutes garbage collection
    refetchOnWindowFocus: false,      // No automatic refresh
    retry: 2,                         // Less retries
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  // Debug logging
  console.log('Booking widget state:', {
    apartment: apartment.slug,
    checkIn,
    checkOut,
    availability,
    isAvailabilityLoading,
    availabilityError,
    enabled: !!(checkIn && checkOut && checkIn < checkOut)
  });

  // Note: Pricing is now handled by Beds24 API in availability response
  // const { data: pricing, isLoading: isPricingLoading, error: pricingError } = useQuery({
  //   queryKey: ['booking-pricing', apartment.id, checkIn, checkOut, guests, children, session?.user?.id],
  //   queryFn: async () => {
  //     if (!checkIn || !checkOut) return null;
  //     
  //     return calculateBookingPrice({
  //       apartmentId: apartment.id,
  //       checkIn,
  //       checkOut,
  //       guests,
  //       children,
  //       userId: session?.user?.id
  //     });
  //   },
  //   enabled: !!(checkIn && checkOut && checkIn < checkOut),
  //   staleTime: 2 * 60 * 1000 // 2 minutes
  // });

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const totalGuests = guests + children;
  
  // Check if selected dates are available based on API response
  const isDateRangeAvailable = availability ? availability.isAvailable : true;
  
  const isValidBooking = checkIn && checkOut && nights > 0 && totalGuests <= apartment.maxGuests && isDateRangeAvailable && availability?.totalPrice;


  const handleRangeSelect = (range: { from: Date | null; to: Date | null }) => {
    setCheckIn(range.from || undefined);
    setCheckOut(range.to || undefined);
    
    // Nezatvárať kalendár okamžite - nechať zobrazený cenový súhrn
    // Kalendár sa zatvorí automaticky keď používateľ klikne mimo neho
  };

  const handleBookNow = () => {
    if (!isValidBooking || !checkIn || !checkOut) return;

    const bookingData: BookingData = {
      apartmentId: apartment.id,
      checkIn,
      checkOut,
      guests,
      children
    };

    if (onBookingStart) {
      onBookingStart(bookingData);
    } else {
      // Default behavior - redirect to booking flow
      const params = new URLSearchParams({
        apartment: apartment.slug,
        checkin: format(checkIn, 'yyyy-MM-dd'),
        checkout: format(checkOut, 'yyyy-MM-dd'),
        guests: guests.toString(),
        children: children.toString()
      });
      
      window.location.href = `/booking?${params.toString()}`;
    }
  };

  return (
    <Card className={cn("sticky top-8", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-baseline justify-between">
          <div>
            <CardTitle className="text-2xl">Od {apartment.basePrice.toString()} eur</CardTitle>
            <p className="text-muted-foreground">za noc*</p>
            <p className="text-xs text-muted-foreground">*Cena závisí od počtu hostí a dĺžky pobytu</p>
          </div>
          
          {/* Loyalty badge removed - using Beds24 pricing */}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date Selection */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-sm font-medium">Príchod</Label>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !checkIn && "text-muted-foreground"
                )}
                onClick={() => setShowCalendar(showCalendar === 'enhanced' ? null : 'enhanced')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {checkIn ? format(checkIn, "dd.MM.yyyy") : "Vyberte dátum"}
              </Button>
            </div>

            <div>
              <Label className="text-sm font-medium">Odchod</Label>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !checkOut && "text-muted-foreground"
                )}
                onClick={() => setShowCalendar(showCalendar === 'enhanced' ? null : 'enhanced')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {checkOut ? format(checkOut, "dd.MM.yyyy") : "Vyberte dátum"}
              </Button>
            </div>
          </div>

          {/* Optimized Availability Calendar */}
          {showCalendar === 'enhanced' && (
            <div className="mt-4">
              <OptimizedAvailabilityCalendar
                apartmentSlug={apartment.slug}
                selectedRange={{
                  from: checkIn || null,
                  to: checkOut || null
                }}
                onRangeSelect={handleRangeSelect}
                guests={guests}
              />
            </div>
          )}
        </div>

        {/* Guest Selection */}
        <div>
          <Label className="text-sm font-medium">Hostia</Label>
          <GuestSelector
            adults={guests}
            maxGuests={apartment.maxGuests}
            maxChildren={apartment.maxChildren}
            onAdultsChange={(newGuests) => {
              setGuests(newGuests);
              // Force calendar refresh when guest count changes
              if (showCalendar === 'enhanced') {
                setShowCalendar(null);
                setTimeout(() => setShowCalendar('enhanced'), 100);
              }
            }}
            onChildrenChange={(newChildren) => {
              setChildren(newChildren);
              // Force calendar refresh when children count changes
              if (showCalendar === 'enhanced') {
                setShowCalendar(null);
                setTimeout(() => setShowCalendar('enhanced'), 100);
              }
            }}
          >
            {children}
          </GuestSelector>
        </div>

        {/* Pricing Display */}
        {checkIn && checkOut && (
          <div className="space-y-3">
            <Separator />
            
            {isAvailabilityLoading ? (
              <PricingSkeleton />
            ) : availabilityError ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Nepodarilo sa načítať cenu. Skúste to znovu.
                </AlertDescription>
              </Alert>
            ) : availability?.totalPrice ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>€{availability.pricePerNight} × {nights} noc{nights > 1 ? 'í' : ''}</span>
                  <span>€{availability.totalPrice}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Celkom</span>
                  <span>€{availability.totalPrice}</span>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Validation Messages */}
        {checkIn && checkOut && nights <= 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Dátum odchodu musí byť po dátume príchodu.
            </AlertDescription>
          </Alert>
        )}

        {totalGuests > apartment.maxGuests && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Maximálny počet hostí pre tento apartmán je {apartment.maxGuests}.
            </AlertDescription>
          </Alert>
        )}

        {availabilityError && (
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Chyba pri načítavaní dostupnosti: {availabilityError.message}
            </AlertDescription>
          </Alert>
        )}

        {checkIn && checkOut && !isDateRangeAvailable && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Vybrané dátumy nie sú dostupné. Skúste iný termín.
            </AlertDescription>
          </Alert>
        )}

        {/* Book Now Button */}
        <Button 
          onClick={handleBookNow}
          disabled={!isValidBooking || isAvailabilityLoading}
          className="w-full"
          size="lg"
        >
          {isAvailabilityLoading ? (
            "Kontrolujem dostupnosť..."
          ) : !isDateRangeAvailable ? (
            "Vybrané dátumy nie sú dostupné"
          ) : availability?.totalPrice ? (
            <>
              Rezervovať za €{availability.totalPrice}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            "Vyberte dátumy"
          )}
        </Button>

        {/* Additional Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Bezplatné zrušenie do 7 dní pred príchodom</p>
          {!session?.user && (
            <p>• Registrujte sa a získajte 5% zľavu na rezerváciu</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function GuestSelector({
  adults,
  maxGuests,
  maxChildren,
  onAdultsChange,
  onChildrenChange,
  children: childrenCount
}: GuestSelectorProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            <span>
              {adults} dospalý{adults !== 1 ? 'ch' : ''}
              {Number(childrenCount) > 0 && `, ${childrenCount} dieťa${Number(childrenCount) > 1 ? 'ť' : ''}`}
            </span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dospelí</p>
              <p className="text-sm text-muted-foreground">Vek 13+</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAdultsChange(Math.max(1, adults - 1))}
                disabled={adults <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center">{adults}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAdultsChange(adults + 1)}
                disabled={adults + Number(childrenCount) >= maxGuests}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Deti</p>
              <p className="text-sm text-muted-foreground">Vek 2-12</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChildrenChange(Math.max(0, Number(childrenCount) - 1))}
                disabled={Number(childrenCount) <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center">{childrenCount}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChildrenChange(Number(childrenCount) + 1)}
                disabled={Number(childrenCount) >= maxChildren || adults + Number(childrenCount) >= maxGuests}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Maximálne {maxGuests} hostí celkom
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// PricingBreakdown function removed - now using Beds24 API pricing directly

// LoyaltyBadge function removed - now using Beds24 API pricing directly

function PricingSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
      <Separator />
      <div className="flex justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  );
}