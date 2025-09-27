"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { format, addDays, differenceInDays } from "date-fns";
import { Calendar, Users, Minus, Plus, Star, Info, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { calculateBookingPrice, BookingPricing, LoyaltyTier } from "@/services/pricing";
import type { Apartment } from "@/types";

interface BookingWidgetProps {
  apartment: Apartment;
  initialCheckIn?: Date;
  initialCheckOut?: Date;
  initialGuests?: number;
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
  onBookingStart,
  className
}: BookingWidgetProps) {
  const { data: session } = useSession();
  const [checkIn, setCheckIn] = useState<Date | undefined>(initialCheckIn);
  const [checkOut, setCheckOut] = useState<Date | undefined>(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);
  const [children, setChildren] = useState(0);
  const [showCalendar, setShowCalendar] = useState<'checkin' | 'checkout' | null>(null);

  // Calculate pricing when dates and guests are selected
  const { data: pricing, isLoading: isPricingLoading, error: pricingError } = useQuery({
    queryKey: ['booking-pricing', apartment.id, checkIn, checkOut, guests, children, (session?.user as any)?.id],
    queryFn: async () => {
      if (!checkIn || !checkOut) return null;
      
      return calculateBookingPrice({
        apartmentId: apartment.id,
        checkIn,
        checkOut,
        guests,
        children,
        userId: (session?.user as any)?.id
      });
    },
    enabled: !!(checkIn && checkOut && checkIn < checkOut),
    staleTime: 2 * 60 * 1000 // 2 minutes
  });

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const totalGuests = guests + children;
  const isValidBooking = checkIn && checkOut && nights > 0 && totalGuests <= apartment.maxGuests;

  const handleCheckInSelect = (date: Date | undefined) => {
    setCheckIn(date);
    if (date && checkOut && date >= checkOut) {
      setCheckOut(addDays(date, 1));
    }
    setShowCalendar(null);
  };

  const handleCheckOutSelect = (date: Date | undefined) => {
    setCheckOut(date);
    setShowCalendar(null);
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
            <CardTitle className="text-2xl">€{apartment.basePrice.toString()}</CardTitle>
            <p className="text-muted-foreground">za noc</p>
          </div>
          
          {session?.user && pricing?.loyaltyTier && (
            <LoyaltyBadge tier={pricing.loyaltyTier} discount={pricing.loyaltyDiscountPercent} />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date Selection */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-sm font-medium">Príchod</Label>
            <Popover open={showCalendar === 'checkin'} onOpenChange={(open) => setShowCalendar(open ? 'checkin' : null)}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !checkIn && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {checkIn ? format(checkIn, "dd.MM.yyyy") : "Vyberte dátum"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={checkIn}
                  onSelect={handleCheckInSelect}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label className="text-sm font-medium">Odchod</Label>
            <Popover open={showCalendar === 'checkout'} onOpenChange={(open) => setShowCalendar(open ? 'checkout' : null)}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !checkOut && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {checkOut ? format(checkOut, "dd.MM.yyyy") : "Vyberte dátum"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={checkOut}
                  onSelect={handleCheckOutSelect}
                  disabled={(date) => !checkIn || date <= checkIn}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Guest Selection */}
        <div>
          <Label className="text-sm font-medium">Hostia</Label>
          <GuestSelector
            adults={guests}
            maxGuests={apartment.maxGuests}
            maxChildren={apartment.maxChildren}
            onAdultsChange={setGuests}
            onChildrenChange={setChildren}
          >
            {children}
          </GuestSelector>
        </div>

        {/* Pricing Display */}
        {checkIn && checkOut && (
          <div className="space-y-3">
            <Separator />
            
            {isPricingLoading ? (
              <PricingSkeleton />
            ) : pricingError ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Nepodarilo sa načítať cenu. Skúste to znovu.
                </AlertDescription>
              </Alert>
            ) : pricing ? (
              <PricingBreakdown pricing={pricing} nights={nights} />
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

        {/* Book Now Button */}
        <Button 
          onClick={handleBookNow}
          disabled={!isValidBooking || isPricingLoading}
          className="w-full"
          size="lg"
        >
          {isPricingLoading ? (
            "Počítam cenu..."
          ) : pricing ? (
            <>
              Rezervovať za €{pricing.total}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            "Vyberte dátumy"
          )}
        </Button>

        {/* Additional Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Bezplatné zrušenie do 24 hodín pred príchodom</p>
          <p>• Platba kartou alebo v hotovosti pri príchode</p>
          {!session?.user && (
            <p>• Prihláste sa a získajte 5% zľavu na rezerváciu</p>
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

function PricingBreakdown({ pricing, nights }: { pricing: BookingPricing; nights: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>€{pricing.basePrice} × {nights} noc{nights > 1 ? 'í' : ''}</span>
        <span>€{pricing.subtotal}</span>
      </div>

      {pricing.loyaltyDiscount > 0 && (
        <div className="flex justify-between text-green-600">
          <span>Loyalty zľava ({Math.round(pricing.loyaltyDiscountPercent * 100)}%)</span>
          <span>-€{pricing.loyaltyDiscount}</span>
        </div>
      )}

      {pricing.seasonalAdjustment > 0 && (
        <div className="flex justify-between">
          <span>Sezónny príplatok</span>
          <span>€{pricing.seasonalAdjustment}</span>
        </div>
      )}

      <div className="flex justify-between">
        <span>Upratovací poplatok</span>
        <span>€{pricing.cleaningFee}</span>
      </div>

      <div className="flex justify-between">
        <span>Mestská daň</span>
        <span>€{pricing.cityTax}</span>
      </div>

      <Separator />

      <div className="flex justify-between font-semibold text-lg">
        <span>Celkom</span>
        <span>€{pricing.total}</span>
      </div>
    </div>
  );
}

function LoyaltyBadge({ tier, discount }: { tier: LoyaltyTier; discount: number }) {
  const tierColors = {
    [LoyaltyTier.BRONZE]: "bg-amber-100 text-amber-800",
    [LoyaltyTier.SILVER]: "bg-gray-100 text-gray-800", 
    [LoyaltyTier.GOLD]: "bg-yellow-100 text-yellow-800"
  };

  return (
    <Badge className={cn("flex items-center gap-1", tierColors[tier])}>
      <Star className="h-3 w-3" />
      {tier} -{Math.round(discount * 100)}%
    </Badge>
  );
}

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