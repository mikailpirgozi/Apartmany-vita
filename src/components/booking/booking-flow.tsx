"use client";

import { useState, useEffect } from "react";
import { useSessionHydrationSafe } from "@/hooks/use-session-hydration-safe";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Check, ChevronLeft, ChevronRight, User, CreditCard, Calendar, Star, Shield, Euro, Percent } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentForm, PaymentSuccessState } from "@/components/booking/payment-form";
import { getLoyaltyTierInfo, formatLoyaltyDiscount } from "@/lib/loyalty";
import type { Apartment } from "@/types";

// Booking steps configuration
const BOOKING_STEPS = [
  { id: 'details', title: 'Detaily rezervácie', icon: Calendar },
  { id: 'guest-info', title: 'Informácie o hosťovi', icon: User },
  { id: 'extras', title: 'Extra služby', icon: Star },
  { id: 'payment', title: 'Platba', icon: CreditCard },
  { id: 'confirmation', title: 'Potvrdenie', icon: Shield }
] as const;

type BookingStep = typeof BOOKING_STEPS[number]['id'];

// Form schemas for each step
const guestInfoSchema = z.object({
  firstName: z.string().min(2, "Meno musí mať aspoň 2 znaky"),
  lastName: z.string().min(2, "Priezvisko musí mať aspoň 2 znaky"),
  email: z.string().email("Neplatný email"),
  phone: z.string().min(9, "Neplatné telefónne číslo"),
  country: z.string().min(2, "Vyberte krajinu"),
  city: z.string().min(2, "Zadajte mesto"),
  specialRequests: z.string().optional(),
  arrivalTime: z.string().optional(),
  marketingConsent: z.boolean(),
  // Company information
  needsInvoice: z.boolean(),
  companyName: z.string().optional(),
  companyId: z.string().optional(),
  companyVat: z.string().optional(),
  companyAddress: z.string().optional()
}).refine((data) => {
  if (data.needsInvoice) {
    return (
      data.companyName && data.companyName.length >= 2 &&
      data.companyId && /^\d{8}$/.test(data.companyId) &&
      data.companyAddress && data.companyAddress.length >= 5
    );
  }
  return true;
}, {
  message: "Pri faktúre na firmu sú povinné: Názov firmy, IČO a Adresa firmy",
  path: ["needsInvoice"]
}).refine((data) => {
  if (data.needsInvoice && data.companyVat && data.companyVat.length > 0) {
    return /^SK\d{10}$/.test(data.companyVat);
  }
  return true;
}, {
  message: "DIČ musí byť vo formáte SK1234567890",
  path: ["companyVat"]
});

const extrasSchema = z.object({
  extraBed: z.boolean().default(false),
  lateCheckout: z.boolean().default(false),
  earlyCheckin: z.boolean().default(false),
  airportTransfer: z.boolean().default(false),
  groceryShopping: z.boolean().default(false),
  tourBooking: z.boolean().default(false)
});

// Updated with company information
type GuestInfoFormData = z.infer<typeof guestInfoSchema>;
type ExtrasFormData = z.infer<typeof extrasSchema>;

// Export for use in other files if needed
export { extrasSchema };

interface BookingFlowProps {
  apartment: Apartment;
  bookingData: {
    checkIn: Date;
    checkOut: Date;
    guests: number;
    children: number;
  };
  availability?: {
    success: boolean;
    isAvailable: boolean;
    totalPrice: number;
    pricePerNight: number;
    nights: number;
    pricingInfo?: {
      guestCount: number;
      childrenCount: number;
      source: string;
      totalDays: number;
      averagePricePerNight: number;
      basePrice: number;
      additionalGuestFee: number;
      additionalGuestFeePerNight: number;
      additionalAdults: number;
      additionalChildren: number;
    };
  };
  onComplete?: (bookingId: string) => void;
}

interface ExtraService {
  id: keyof ExtrasFormData;
  name: string;
  description: string;
  price: number;
  icon: React.ComponentType<{ className?: string }>;
}

const EXTRA_SERVICES: ExtraService[] = [
  {
    id: 'extraBed',
    name: 'Prístelka',
    description: 'Dodatočná posteľ pre ďalšiu osobu',
    price: 15,
    icon: ({ className }) => <div className={cn("w-4 h-4 bg-current rounded", className)} />
  },
  {
    id: 'lateCheckout',
    name: 'Neskorý odchod',
    description: 'Odchod až do 16:00 (štandardne 11:00)',
    price: 20,
    icon: ({ className }) => <div className={cn("w-4 h-4 bg-current rounded", className)} />
  },
  {
    id: 'earlyCheckin',
    name: 'Skorý príchod',
    description: 'Príchod už od 12:00 (štandardne 15:00)',
    price: 15,
    icon: ({ className }) => <div className={cn("w-4 h-4 bg-current rounded", className)} />
  },
  {
    id: 'airportTransfer',
    name: 'Transfer z letiska',
    description: 'Odvoz z/na letisko Bratislava',
    price: 45,
    icon: ({ className }) => <div className={cn("w-4 h-4 bg-current rounded", className)} />
  },
  {
    id: 'groceryShopping',
    name: 'Nákup potravín',
    description: 'Pripravíme základné potraviny pred príchodom',
    price: 25,
    icon: ({ className }) => <div className={cn("w-4 h-4 bg-current rounded", className)} />
  },
  {
    id: 'tourBooking',
    name: 'Rezervácia výletov',
    description: 'Pomôžeme s rezerváciou výletov po okolí',
    price: 10,
    icon: ({ className }) => <div className={cn("w-4 h-4 bg-current rounded", className)} />
  }
];

export function BookingFlow({ apartment, bookingData, availability, onComplete }: BookingFlowProps) {
  const { data: session } = useSessionHydrationSafe();
  const [currentStep, setCurrentStep] = useState<BookingStep>('details');
  const [completedSteps, setCompletedSteps] = useState<Set<BookingStep>>(new Set());
  const [guestInfo, setGuestInfo] = useState<GuestInfoFormData | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<ExtrasFormData>({
    extraBed: false,
    lateCheckout: false,
    earlyCheckin: false,
    airportTransfer: false,
    groceryShopping: false,
    tourBooking: false
  });

  const currentStepIndex = BOOKING_STEPS.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / BOOKING_STEPS.length) * 100;

  // Pre-fill guest info if user is logged in
  useEffect(() => {
    if (session?.user && !guestInfo) {
      setGuestInfo({
        firstName: session.user.name?.split(' ')[0] || '',
        lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
        email: session.user.email || '',
        phone: '',
        country: 'SK',
        city: '',
        specialRequests: '',
        arrivalTime: '',
        marketingConsent: false,
        needsInvoice: false,
        companyName: '',
        companyId: '',
        companyVat: '',
        companyAddress: ''
      });
    }
  }, [session, guestInfo]);

  const goToStep = (step: BookingStep) => {
    setCurrentStep(step);
  };

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < BOOKING_STEPS.length) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(BOOKING_STEPS[nextIndex].id);
    }
  };

  const goToPrevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(BOOKING_STEPS[prevIndex].id);
    }
  };

  const calculateExtrasTotal = () => {
    return EXTRA_SERVICES.reduce((total, service) => {
      return total + (selectedExtras[service.id as keyof ExtrasFormData] ? service.price : 0);
    }, 0);
  };

  // Calculate total price with loyalty discounts if available
  const calculateTotalPrice = () => {
    const extrasTotal = calculateExtrasTotal();
    // This will be calculated in BookingSummary with loyalty pricing
    return (availability?.totalPrice || 0) + extrasTotal;
  };
  
  const totalPrice = calculateTotalPrice();


  // Show loading state if availability is not yet loaded
  if (!availability) {
    return <BookingFlowSkeleton />;
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Rezervácia apartmánu</h1>
          <Badge variant="outline">{apartment.name}</Badge>
        </div>
        
        <Progress value={progress} className="mb-6" />
        
        {/* Step Navigation */}
        <div className="flex items-center justify-between">
          {BOOKING_STEPS.map((step, index) => {
            const isCompleted = completedSteps.has(step.id);
            const isCurrent = currentStep === step.id;
            const isAccessible = index === 0 || completedSteps.has(BOOKING_STEPS[index - 1].id);
            
            return (
              <button
                key={step.id}
                onClick={() => isAccessible && goToStep(step.id)}
                disabled={!isAccessible}
                className={cn(
                  "flex flex-col items-center p-2 rounded-lg transition-all",
                  "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary",
                  {
                    "text-primary bg-primary/10": isCurrent,
                    "text-green-600": isCompleted,
                    "text-muted-foreground cursor-not-allowed": !isAccessible,
                    "cursor-pointer": isAccessible
                  }
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2",
                  {
                    "border-primary bg-primary text-primary-foreground": isCurrent,
                    "border-green-600 bg-green-600 text-white": isCompleted,
                    "border-muted-foreground": !isAccessible && !isCurrent && !isCompleted
                  }
                )}>
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                </div>
                <span className="text-xs font-medium text-center hidden sm:block">
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              {currentStep === 'details' && (
                <BookingDetailsStep
                  apartment={apartment}
                  bookingData={bookingData}
                  availability={availability}
                  onNext={goToNextStep}
                />
              )}
              
              {currentStep === 'guest-info' && (
                <GuestInfoStep
                  initialData={guestInfo}
                  onNext={(data) => {
                    setGuestInfo(data);
                    goToNextStep();
                  }}
                  onBack={goToPrevStep}
                />
              )}
              
              {currentStep === 'extras' && (
                <ExtrasStep
                  selectedExtras={selectedExtras}
                  onExtrasChange={setSelectedExtras}
                  onNext={goToNextStep}
                  onBack={goToPrevStep}
                />
              )}
              
              {currentStep === 'payment' && (
                <PaymentStep
                  apartment={apartment}
                  bookingData={bookingData}
                  guestInfo={guestInfo!}
                  availability={availability}
                  selectedExtras={selectedExtras}
                  totalPrice={totalPrice}
                  onBack={goToPrevStep}
                  onComplete={onComplete}
                />
              )}
              
              {currentStep === 'confirmation' && (
                <ConfirmationStep
                  bookingId="TEMP_ID"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Booking Summary Sidebar */}
        <div className="lg:col-span-1">
          <BookingSummary
            apartment={apartment}
            bookingData={bookingData}
            availability={availability}
            selectedExtras={selectedExtras}
            totalPrice={totalPrice}
          />
        </div>
      </div>
      </div>
    </div>
  );
}

function BookingDetailsStep({
  apartment,
  bookingData,
  availability,
  onNext
}: {
  apartment: Apartment;
  bookingData: {
    checkIn: Date;
    checkOut: Date;
    guests: number;
    children: number;
  };
  availability?: {
    success: boolean;
    isAvailable: boolean;
    totalPrice: number;
    pricePerNight: number;
    nights: number;
  };
  onNext: () => void;
}) {
  const { data: session } = useSessionHydrationSafe();

  // Calculate comprehensive pricing with loyalty and long stay discounts
  const { data: loyaltyPricing } = useQuery({
    queryKey: ['booking-pricing-details', apartment.slug, bookingData.checkIn, bookingData.checkOut, bookingData.guests, bookingData.children, session?.user?.email],
    queryFn: async () => {
      const response = await fetch('/api/pricing/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apartmentId: apartment.id,
          checkIn: bookingData.checkIn.toISOString(),
          checkOut: bookingData.checkOut.toISOString(),
          guests: bookingData.guests,
          children: bookingData.children,
          userId: session?.user?.email || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to calculate pricing');
      }

      return response.json();
    },
    enabled: typeof window !== 'undefined',
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });

  const nights = availability?.nights || 0;
  const finalPrice = loyaltyPricing?.total || availability?.totalPrice || 0;
  const originalPrice = loyaltyPricing ? 
    (loyaltyPricing.subtotal + loyaltyPricing.seasonalAdjustment + loyaltyPricing.cleaningFee + loyaltyPricing.cityTax) : 
    (availability?.totalPrice || 0);
  const hasDiscount = loyaltyPricing && (loyaltyPricing.loyaltyDiscount > 0 || loyaltyPricing.stayDiscount > 0 || loyaltyPricing.longStayDiscount > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Detaily rezervácie</h2>
        <p className="text-muted-foreground">
          Skontrolujte si detaily vašej rezervácie a dostupnosť apartmánu.
        </p>
      </div>

      {/* Booking Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="font-medium">{apartment.name}</span>
          </div>
          <p className="text-sm text-muted-foreground">{apartment.size}m² • {apartment.maxGuests} hostí max</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="font-medium">
              {bookingData.guests} dospalý{bookingData.guests !== 1 ? 'ch' : ''}
              {bookingData.children > 0 && `, ${bookingData.children} dieťa${bookingData.children > 1 ? 'ť' : ''}`}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">
              {format(bookingData.checkIn, 'dd.MM.yyyy')} - {format(bookingData.checkOut, 'dd.MM.yyyy')}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Príchod od 16:00 • Odchod do 10:00
          </p>
        </div>
      </div>

      {/* Booking Summary - nahradenie kalendára */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Potvrdenie rezervácie
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium text-green-700">Dostupné</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Apartmán je dostupný pre vybrané dátumy
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Euro className="h-4 w-4 text-primary" />
              <span className="font-medium">€{finalPrice}</span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  €{originalPrice}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {nights} nocí • €{Math.round(finalPrice / nights)}/noc
              {hasDiscount && (
                <span className="ml-2 text-green-600 font-medium">
                  Ušetríte €{originalPrice - finalPrice}!
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={onNext} size="lg">
          Pokračovať k údajom hosťa
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function GuestInfoStep({
  initialData,
  onNext,
  onBack
}: {
  initialData: GuestInfoFormData | null;
  onNext: (data: GuestInfoFormData) => void;
  onBack: () => void;
}) {
  const form = useForm<GuestInfoFormData>({
    resolver: zodResolver(guestInfoSchema),
    defaultValues: initialData || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: 'SK',
      city: '',
      specialRequests: '',
      arrivalTime: '',
      marketingConsent: false,
      needsInvoice: false,
      companyName: '',
      companyId: '',
      companyVat: '',
      companyAddress: ''
    }
  });

  const handleSubmit = (data: GuestInfoFormData) => {
    onNext(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Informácie o hosťovi</h2>
        <p className="text-muted-foreground">
          Zadajte kontaktné informácie hlavného hosťa.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meno *</FormLabel>
                  <FormControl>
                    <Input placeholder="Vaše meno" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priezvisko *</FormLabel>
                  <FormControl>
                    <Input placeholder="Vaše priezvisko" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="vas@email.sk" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefón *</FormLabel>
                  <FormControl>
                    <Input placeholder="+421 900 123 456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Krajina *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte krajinu" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SK">Slovensko</SelectItem>
                      <SelectItem value="CZ">Česká republika</SelectItem>
                      <SelectItem value="HU">Maďarsko</SelectItem>
                      <SelectItem value="PL">Poľsko</SelectItem>
                      <SelectItem value="AT">Rakúsko</SelectItem>
                      <SelectItem value="DE">Nemecko</SelectItem>
                      <SelectItem value="OTHER">Iná krajina</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mesto *</FormLabel>
                  <FormControl>
                    <Input placeholder="Vaše mesto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="arrivalTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Očakávaný čas príchodu</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte čas príchodu" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="15:00-17:00">15:00 - 17:00</SelectItem>
                    <SelectItem value="17:00-19:00">17:00 - 19:00</SelectItem>
                    <SelectItem value="19:00-21:00">19:00 - 21:00</SelectItem>
                    <SelectItem value="21:00+">Po 21:00</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Pomôže nám pripraviť sa na váš príchod
                </FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="specialRequests"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Špeciálne požiadavky</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Napríklad: potrebujem detskú postieľku, som alergický na..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Pokúsime sa vyhovieť vašim požiadavkám
                </FormDescription>
              </FormItem>
            )}
          />

          {/* Company Information Section */}
          <FormField
            control={form.control}
            name="needsInvoice"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Chcem faktúru na firmu
                  </FormLabel>
                  <FormDescription>
                    Vyplňte firemné údaje pre vystavenie faktúry
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {form.watch('needsInvoice') && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <h3 className="font-medium text-sm">Firemné údaje</h3>
              
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Názov firmy *</FormLabel>
                    <FormControl>
                      <Input placeholder="Názov vašej firmy" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IČO *</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678" {...field} />
                      </FormControl>
                      <FormDescription>
                        8-miestne identifikačné číslo organizácie
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyVat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DIČ</FormLabel>
                      <FormControl>
                        <Input placeholder="SK1234567890" {...field} />
                      </FormControl>
                      <FormDescription>
                        Daňové identifikačné číslo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="companyAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresa firmy *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ulica a číslo&#10;PSČ Mesto&#10;Krajina"
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Úplná adresa sídla firmy
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <FormField
            control={form.control}
            name="marketingConsent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Súhlasím s posielaním marketingových emailov
                  </FormLabel>
                  <FormDescription>
                    Budeme vám posielať informácie o akciách a novinkách
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onBack}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Späť
            </Button>
            <Button type="submit">
              Pokračovať
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function ExtrasStep({
  selectedExtras,
  onExtrasChange,
  onNext,
  onBack
}: {
  selectedExtras: ExtrasFormData;
  onExtrasChange: (extras: ExtrasFormData) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const handleExtraToggle = (extraId: keyof ExtrasFormData) => {
    onExtrasChange({
      ...selectedExtras,
      [extraId]: !selectedExtras[extraId]
    });
  };

  const selectedCount = Object.values(selectedExtras).filter(Boolean).length;
  const extrasTotal = EXTRA_SERVICES.reduce((total, service) => {
    return total + (selectedExtras[service.id] ? service.price : 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Extra služby</h2>
        <p className="text-muted-foreground">
          Vyberte si dodatočné služby pre pohodlnejší pobyt.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EXTRA_SERVICES.map((service) => {
          const isSelected = selectedExtras[service.id as keyof ExtrasFormData];
          
          return (
            <Card
              key={service.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                isSelected && "ring-2 ring-primary bg-primary/5"
              )}
              onClick={() => handleExtraToggle(service.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={isSelected}
                    onChange={() => handleExtraToggle(service.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{service.name}</h3>
                      <Badge variant="outline">€{service.price}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {service.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedCount > 0 && (
        <Alert>
          <Star className="h-4 w-4" />
          <AlertDescription>
            Vybrali ste {selectedCount} extra služb{selectedCount > 1 ? 'y' : 'u'} za celkom €{extrasTotal}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Späť
        </Button>
        <Button onClick={onNext}>
          Pokračovať na platbu
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function PaymentStep({ 
  apartment, 
  bookingData, 
  guestInfo, 
  availability,
  selectedExtras, 
  totalPrice, 
  onBack, 
  onComplete 
}: { 
  apartment: Apartment;
  bookingData: {
    checkIn: Date;
    checkOut: Date;
    guests: number;
    children: number;
  };
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    city: string;
    specialRequests?: string;
    arrivalTime?: string;
    marketingConsent: boolean;
  };
  availability?: {
    success: boolean;
    isAvailable: boolean;
    totalPrice: number;
    pricePerNight: number;
    nights: number;
    pricingInfo?: {
      guestCount: number;
      childrenCount: number;
      source: string;
      totalDays: number;
      averagePricePerNight: number;
      basePrice: number;
      additionalGuestFee: number;
      additionalGuestFeePerNight: number;
      additionalAdults: number;
      additionalChildren: number;
    };
  };
  selectedExtras: ExtrasFormData;
  totalPrice: number;
  onBack: () => void; 
  onComplete?: (bookingId: string) => void;
}) {
  const router = useRouter();
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [completedBookingId, setCompletedBookingId] = useState<string | null>(null);

  const calculateExtrasTotal = () => {
    return EXTRA_SERVICES.reduce((total, service) => {
      return total + (selectedExtras[service.id as keyof ExtrasFormData] ? service.price : 0);
    }, 0);
  };

  const handlePaymentSuccess = (bookingId: string) => {
    setCompletedBookingId(bookingId);
    setPaymentCompleted(true);
    
    // Use onComplete if provided, otherwise redirect to confirmation page
    if (onComplete) {
      onComplete(bookingId);
    } else {
      router.push(`/booking/confirmation/${bookingId}`);
    }
  };

  if (paymentCompleted && completedBookingId) {
    return (
      <PaymentSuccessState
        bookingId={completedBookingId}
        apartment={apartment}
        bookingData={bookingData}
      />
    );
  }

  return (
    <PaymentForm
      apartment={apartment}
      bookingData={bookingData}
      guestInfo={guestInfo}
      availability={availability}
      extrasTotal={calculateExtrasTotal()}
      totalPrice={totalPrice}
      onSuccess={handlePaymentSuccess}
      onBack={onBack}
    />
  );
}

function ConfirmationStep({ bookingId }: { bookingId: string }) {
  return (
    <div className="text-center space-y-4">
      <h2 className="text-xl font-semibold">Rezervácia potvrdená!</h2>
      <p>Booking ID: {bookingId}</p>
    </div>
  );
}

function BookingSummary({
  apartment,
  bookingData,
  availability,
  selectedExtras,
  totalPrice
}: {
  apartment: Apartment;
  bookingData: {
    checkIn: Date;
    checkOut: Date;
    guests: number;
    children: number;
  };
  availability?: {
    success: boolean;
    isAvailable: boolean;
    totalPrice: number;
    pricePerNight: number;
    nights: number;
    pricingInfo?: {
      guestCount: number;
      childrenCount: number;
      source: string;
      totalDays: number;
      averagePricePerNight: number;
      basePrice: number;
      additionalGuestFee: number;
      additionalGuestFeePerNight: number;
      additionalAdults: number;
      additionalChildren: number;
    };
  };
  selectedExtras: ExtrasFormData;
  totalPrice: number;
}) {
  const { data: session } = useSessionHydrationSafe();
  const selectedExtrasList = EXTRA_SERVICES.filter(service => selectedExtras[service.id]);

  // Calculate comprehensive pricing with loyalty and long stay discounts
  const { data: loyaltyPricing, isLoading } = useQuery({
    queryKey: ['booking-pricing', apartment.slug, bookingData.checkIn, bookingData.checkOut, bookingData.guests, bookingData.children, session?.user?.email],
    queryFn: async () => {
      if (!availability?.success) return null;
      
      const response = await fetch('/api/pricing/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apartmentId: apartment.id,
          checkIn: bookingData.checkIn.toISOString(),
          checkOut: bookingData.checkOut.toISOString(),
          guests: bookingData.guests,
          children: bookingData.children,
          userId: session?.user?.email || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to calculate pricing');
      }

      return response.json();
    },
    enabled: !!availability?.success && typeof window !== 'undefined' && !!session
  });

  const nights = availability?.nights || 0;


  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle>Súhrn rezervácie</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">{apartment.name}</h3>
          <p className="text-sm text-muted-foreground">
            {format(bookingData.checkIn, 'd.M.yyyy')} - {format(bookingData.checkOut, 'd.M.yyyy')}
          </p>
          <p className="text-sm text-muted-foreground">
            {bookingData.guests} hosť{bookingData.guests > 1 ? 'ia' : ''}{bookingData.children > 0 && `, ${bookingData.children} dieťa${bookingData.children > 1 ? 'ť' : ''}`} • {nights} noc{nights > 1 ? 'í' : ''}
          </p>
        </div>

        <Separator />

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : loyaltyPricing ? (
          <div className="space-y-4">
            {/* Detailný cenový súhrn */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Euro className="h-4 w-4" />
                <span className="font-semibold">Cenový súhrn</span>
              </div>
              
              {/* Pôvodná cena (pred zľavami) */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700">Základná cena ({nights} noc{nights > 1 ? 'í' : ''})</span>
                  <span className="font-semibold">€{loyaltyPricing.baseSubtotal}</span>
                </div>
                
                {/* Dodatočné poplatky za hostí */}
                {loyaltyPricing.additionalGuestFee > 0 && (
                  <div className="flex justify-between items-center text-blue-700 text-sm">
                    <span>
                      Úprava pre hostí
                      {loyaltyPricing.additionalAdults > 0 && (
                        <span className="text-gray-500 ml-1">
                          ({loyaltyPricing.additionalAdults} dospelý × €20/noc
                        </span>
                      )}
                      {loyaltyPricing.additionalAdults > 0 && loyaltyPricing.additionalChildren > 0 && <span className="text-gray-500"> + </span>}
                      {loyaltyPricing.additionalChildren > 0 && (
                        <span className="text-gray-500">
                          {loyaltyPricing.additionalChildren} dieťa × €10/noc
                        </span>
                      )}
                      <span className="text-gray-500">)</span>
                    </span>
                    <span className="font-semibold">+€{loyaltyPricing.additionalGuestFee}</span>
                  </div>
                )}
                
                {/* Sezónne úpravy */}
                {loyaltyPricing.seasonalAdjustment !== 0 && (
                  <div className="flex justify-between items-center text-orange-700 text-sm">
                    <span>Sezónna úprava</span>
                    <span className="font-semibold">{loyaltyPricing.seasonalAdjustment > 0 ? '+' : ''}€{loyaltyPricing.seasonalAdjustment}</span>
                  </div>
                )}
                
                {/* Cleaning fee */}
                {loyaltyPricing.cleaningFee > 0 && (
                  <div className="flex justify-between items-center text-gray-600 text-sm">
                    <span>Úklid</span>
                    <span className="font-semibold">€{loyaltyPricing.cleaningFee}</span>
                  </div>
                )}
                
                {/* City tax */}
                {loyaltyPricing.cityTax > 0 && (
                  <div className="flex justify-between items-center text-gray-600 text-sm">
                    <span>Mestská daň</span>
                    <span className="font-semibold">€{loyaltyPricing.cityTax}</span>
                  </div>
                )}

                {/* Extra služby */}
                {selectedExtrasList.map((service, index) => (
                  <div key={index} className="flex justify-between items-center text-gray-600 text-sm">
                    <span>{service.name}</span>
                    <span className="font-semibold">€{service.price}</span>
                  </div>
                ))}
                
                <Separator />
                
                {/* Pôvodná celková cena */}
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Pôvodná cena</span>
                  <span className="text-lg font-bold text-gray-900">€{loyaltyPricing.subtotal + loyaltyPricing.seasonalAdjustment + loyaltyPricing.cleaningFee + loyaltyPricing.cityTax + selectedExtrasList.reduce((sum, service) => sum + service.price, 0)}</span>
                </div>
              </div>
              
              {/* Zľavy */}
              <div className="space-y-2">
                {/* Loyalty zľava */}
                {loyaltyPricing.loyaltyDiscount > 0 && (
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          Zľava - {loyaltyPricing.loyaltyTier && getLoyaltyTierInfo(loyaltyPricing.loyaltyTier).displayName}
                        </span>
                      </div>
                      <span className="font-bold text-green-600">-€{loyaltyPricing.loyaltyDiscount}</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      {formatLoyaltyDiscount(loyaltyPricing.loyaltyTier!)} zľava pre {getLoyaltyTierInfo(loyaltyPricing.loyaltyTier!).displayName} členov
                    </p>
                  </div>
                )}
                
                {/* Long stay zľava */}
                {loyaltyPricing.longStayDiscount > 0 && (
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          Zľava za dlhší pobyt
                        </span>
                      </div>
                      <span className="font-bold text-blue-600">-€{loyaltyPricing.longStayDiscount}</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      10% zľava pre pobyty 7+ nocí
                    </p>
                  </div>
                )}
              </div>
              
              {/* Finálna cena */}
              <div className="bg-primary/5 rounded-lg p-3 border-2 border-primary/20">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-primary">Celková cena</span>
                  <span className="text-xl font-bold text-primary">
                    €{loyaltyPricing.total + selectedExtrasList.reduce((sum, service) => sum + service.price, 0)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  €{Math.round((loyaltyPricing.total + selectedExtrasList.reduce((sum, service) => sum + service.price, 0)) / nights)}/noc priemerne
                </p>
              </div>
              
              {/* Loyalty badge */}
              {session?.user && loyaltyPricing?.loyaltyTier && (
                <div className="flex justify-center">
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-200">
                    {getLoyaltyTierInfo(loyaltyPricing.loyaltyTier).icon} {getLoyaltyTierInfo(loyaltyPricing.loyaltyTier).displayName} člen
                  </Badge>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Fallback pre prípad, že loyaltyPricing nie je k dispozícii
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Ubytovanie ({nights} noc{nights > 1 ? 'í' : ''})</span>
              <span>€{availability?.totalPrice || 0}</span>
            </div>

            {selectedExtrasList.map((service, index) => (
              <div key={index} className="flex justify-between">
                <span>{service.name}</span>
                <span>€{service.price}</span>
              </div>
            ))}

            <Separator />

            <div className="flex justify-between font-semibold text-lg">
              <span>Celkom</span>
              <span>€{totalPrice}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper component for labels

// Loading skeleton for BookingFlow
function BookingFlowSkeleton() {
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
  );
}
