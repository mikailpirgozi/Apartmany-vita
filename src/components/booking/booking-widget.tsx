"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { format, differenceInDays } from "date-fns";
import { Calendar, Users, Minus, Plus, Info, ArrowRight, Euro, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { OptimizedAvailabilityCalendar } from "@/components/booking/optimized-availability-calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getNextDiscountTier } from "@/lib/discounts";
import { calculateClientPricing } from "@/lib/pricing-utils";
import { LoyaltyTier } from "@/lib/loyalty";
import type { Apartment, Beds24AvailabilityResponse } from "@/types";

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
  childrenCount: number;
  onAdultsChange: (count: number) => void;
  onChildrenChange: (count: number) => void;
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

  // 🚀 HYBRID APPROACH: Fetch base Beds24 prices (only when dates change, NOT guests!)
  const { data: basePricing, isLoading: isAvailabilityLoading, error: availabilityError } = useQuery<Beds24AvailabilityResponse | null>({
    queryKey: ['booking-base-pricing', apartment.slug, checkIn, checkOut, session?.user?.id],
    // ↑ NO guests/children in queryKey = no API call when guests change!
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
      
      // Fetch with base 2 guests (default) - we'll adjust locally
      const userIdParam = session?.user?.id ? `&userId=${session.user.id}` : '';
      const url = `/api/beds24/availability?apartment=${apartment.slug}&checkIn=${checkInStr}&checkOut=${checkOutStr}&guests=2&children=0${userIdParam}`;
      console.log('🔍 Fetching base pricing from:', url);
      
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
      console.log('✅ Base pricing data received:', data);
      return data;
    },
    enabled: !!(checkIn && checkOut && checkIn < checkOut),
    placeholderData: (previousData) => previousData, // 🎯 Smooth transition - keep old data while loading
    staleTime: 10 * 60 * 1000,        // 10 minutes
    gcTime: 30 * 60 * 1000,           // 30 minutes garbage collection
    refetchOnWindowFocus: false,      // No automatic refresh
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const totalGuests = guests + children;
  
  // 🎯 HYBRID PRICING: Calculate locally for instant updates when guests change
  const pricing = useMemo(() => {
    if (!basePricing?.pricingInfo?.basePrice || nights === 0) return null;
    
    // Get user's loyalty tier (default Bronze for all registered users)
    const userLoyaltyTier = session?.user ? LoyaltyTier.BRONZE : null;
    
    // Calculate complete pricing locally (instant!)
    return calculateClientPricing({
      basePrice: basePricing.pricingInfo.basePrice,
      nights,
      guests,
      children,
      loyaltyTier: userLoyaltyTier
    });
  }, [basePricing?.pricingInfo?.basePrice, nights, guests, children, session?.user]);
  
  // Check if selected dates are available based on API response
  const isDateRangeAvailable = basePricing ? basePricing.isAvailable : true;
  
  const isValidBooking = checkIn && checkOut && nights > 0 && totalGuests <= apartment.maxGuests && isDateRangeAvailable && pricing?.finalPrice;
  
  // Debug logging
  console.log('Booking widget state (HYBRID):', {
    apartment: apartment.slug,
    checkIn,
    checkOut,
    basePricingFromAPI: basePricing?.pricingInfo?.basePrice,
    localCalculatedPricing: pricing,
    guests,
    children,
    isAvailabilityLoading,
    availabilityError
  });


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
    <Card className={cn("sticky top-8", className)} data-testid="booking-widget">
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
                type="button"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !checkIn && "text-muted-foreground"
                )}
                onClick={() => setShowCalendar(showCalendar === 'enhanced' ? null : 'enhanced')}
                suppressHydrationWarning
              >
                <Calendar className="mr-2 h-4 w-4" />
                {checkIn ? format(checkIn, "dd.MM.yyyy") : "Vyberte dátum"}
              </Button>
            </div>

            <div>
              <Label className="text-sm font-medium">Odchod</Label>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !checkOut && "text-muted-foreground"
                )}
                onClick={() => setShowCalendar(showCalendar === 'enhanced' ? null : 'enhanced')}
                suppressHydrationWarning
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
                childrenCount={children}
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
            childrenCount={children}
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
          />
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
            ) : pricing?.finalPrice ? (
              <div className="space-y-4">
                {/* Cenový súhrn - HYBRID calculation (instant updates!) */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <Euro className="h-4 w-4" />
                    Cenový súhrn
                  </h4>
                  
                  {/* Základná cena */}
                  <div className="flex justify-between text-sm">
                    <span>{nights} nocí × €{(pricing.basePrice / nights).toFixed(2)}</span>
                    <span>€{pricing.basePrice.toFixed(2)}</span>
                  </div>
                  
                  {/* Extra hostia - calculated locally, updates instantly! */}
                  {pricing.additionalGuestFee > 0 && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span className="text-xs">
                        ↳ Extra hostia 
                        {pricing.additionalAdults > 0 && ` (${pricing.additionalAdults} × €20/noc)`}
                        {pricing.additionalAdults > 0 && pricing.additionalChildren > 0 && ` +`}
                        {pricing.additionalChildren > 0 && ` (${pricing.additionalChildren} dieťa × €10/noc)`}
                      </span>
                      <span className="text-xs">€{pricing.additionalGuestFee.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  {/* Medzisúčet */}
                  <div className="flex justify-between font-medium">
                    <span>Pôvodná cena</span>
                    <span>€{pricing.subtotal.toFixed(2)}</span>
                  </div>
                  
                  {/* Stay discount - calculated locally, updates instantly! */}
                  {pricing.stayDiscount > 0 && pricing.stayDiscountInfo && (
                    <div className="flex justify-between text-blue-600">
                      <span className="flex items-center gap-1 text-sm">
                        <Percent className="w-3 h-3" />
                        Zľava za pobyt ({pricing.stayDiscountInfo.label}) - {Math.round(pricing.stayDiscountPercent * 100)}%
                      </span>
                      <span className="font-semibold">-€{pricing.stayDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {/* Loyalty discount - calculated locally, updates instantly! */}
                  {pricing.loyaltyDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-1 text-sm">
                        <Percent className="w-3 h-3" />
                        Loyalty zľava ({pricing.loyaltyTier}) - {Math.round(pricing.loyaltyDiscountPercent * 100)}%
                      </span>
                      <span className="font-semibold">-€{pricing.loyaltyDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  {/* Celková cena */}
                  <div className="flex justify-between text-lg font-bold text-primary">
                    <span>Celková cena</span>
                    <span>€{pricing.finalPrice.toFixed(2)}</span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    €{pricing.pricePerNight.toFixed(2)}/noc priemerne
                  </div>
                  
                  {/* Úspory */}
                  {pricing.totalDiscount > 0 && (
                    <div className="text-xs text-green-600 space-y-0.5 pt-2">
                      {pricing.stayDiscount > 0 && (
                        <p>✓ Zahŕňa zľavu za pobyt €{pricing.stayDiscount.toFixed(2)}</p>
                      )}
                      {pricing.loyaltyDiscount > 0 && (
                        <p>✓ Zahŕňa loyalty zľavu €{pricing.loyaltyDiscount.toFixed(2)}</p>
                      )}
                      <p className="font-medium pt-1">💰 Celková úspora: €{pricing.totalDiscount.toFixed(2)} ({Math.round((pricing.totalDiscount / pricing.subtotal) * 100)}%)</p>
                    </div>
                  )}
                </div>
                
                {/* Discount opportunity info */}
                {pricing.stayDiscount === 0 && (() => {
                  const nextTier = getNextDiscountTier(nights);
                  return nextTier.nextTier ? (
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-800">
                          Predĺžte pobyt o {nextTier.nightsNeeded} {nextTier.nightsNeeded === 1 ? 'noc' : nextTier.nightsNeeded < 5 ? 'noci' : 'nocí'} a získajte {nextTier.nextTier.discountPercent}% zľavu!
                        </span>
                      </div>
                      <p className="text-xs text-amber-600 mt-1">
                        Ušetríte až €{Math.round(pricing.subtotal * nextTier.nextTier.discount * 100) / 100}
                      </p>
                    </div>
                  ) : null;
                })()}

                {/* Info for non-logged users about registration discount */}
                {!session?.user && pricing.loyaltyDiscount === 0 && (
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-800">
                          Registrujte sa a získajte 5% zľavu!
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                          Všetci registrovaní používatelia automaticky dostávajú 5% zľavu na všetky rezervácie. Ušetrili by ste €{(pricing.subtotal * 0.05).toFixed(2)}
                        </p>
                        <div className="flex gap-2 mt-3">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-xs bg-white hover:bg-amber-100 border-amber-300"
                            onClick={() => window.location.href = '/auth/signin'}
                          >
                            Prihlásiť sa
                          </Button>
                          <Button 
                            size="sm" 
                            className="text-xs bg-amber-600 hover:bg-amber-700"
                            onClick={() => window.location.href = '/auth/signin?tab=register'}
                          >
                            Registrovať sa
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
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
          type="button"
          onClick={handleBookNow}
          disabled={!isValidBooking || isAvailabilityLoading}
          className="w-full"
          size="lg"
          suppressHydrationWarning
        >
          {isAvailabilityLoading ? (
            "Kontrolujem dostupnosť..."
          ) : !isDateRangeAvailable ? (
            "Vybrané dátumy nie sú dostupné"
          ) : pricing?.finalPrice ? (
            <>
              Rezervovať za €{pricing.finalPrice.toFixed(0)}
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
            <p>• Registrujte sa a získajte zľavu na rezerváciu</p>
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
  childrenCount,
  onAdultsChange,
  onChildrenChange
}: GuestSelectorProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="w-full justify-between" suppressHydrationWarning>
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
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onAdultsChange(Math.max(1, adults - 1))}
                disabled={adults <= 1}
                suppressHydrationWarning
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center">{adults}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onAdultsChange(adults + 1)}
                disabled={adults + Number(childrenCount) >= maxGuests}
                suppressHydrationWarning
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
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChildrenChange(Math.max(0, Number(childrenCount) - 1))}
                disabled={Number(childrenCount) <= 0}
                suppressHydrationWarning
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center">{childrenCount}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChildrenChange(Number(childrenCount) + 1)}
                disabled={Number(childrenCount) >= maxChildren || adults + Number(childrenCount) >= maxGuests}
                suppressHydrationWarning
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