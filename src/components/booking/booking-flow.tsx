"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { Check, ChevronLeft, ChevronRight, User, CreditCard, Mail, Phone, MapPin, Calendar, Users, Star, Shield } from "lucide-react";
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
import { PaymentForm, PaymentSuccessState } from "@/components/booking/payment-form";
import type { Apartment } from "@/types";
import type { BookingPricing } from "@/services/pricing";

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
  marketingConsent: z.boolean()
});

const extrasSchema = z.object({
  extraBed: z.boolean().default(false),
  lateCheckout: z.boolean().default(false),
  earlyCheckin: z.boolean().default(false),
  airportTransfer: z.boolean().default(false),
  groceryShopping: z.boolean().default(false),
  tourBooking: z.boolean().default(false)
});

type GuestInfoFormData = z.infer<typeof guestInfoSchema>;
type ExtrasFormData = z.infer<typeof extrasSchema>;

interface BookingFlowProps {
  apartment: Apartment;
  bookingData: {
    checkIn: Date;
    checkOut: Date;
    guests: number;
    children: number;
  };
  pricing: BookingPricing;
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

export function BookingFlow({ apartment, bookingData, pricing, onComplete }: BookingFlowProps) {
  const { data: session } = useSession();
  const router = useRouter();
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
        marketingConsent: false
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
      return total + (selectedExtras[service.id] ? service.price : 0);
    }, 0);
  };

  const totalPrice = pricing.total + calculateExtrasTotal();

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
            const Icon = step.icon;
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
                    <Icon className="h-4 w-4" />
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
                  pricing={pricing}
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
                  pricing={pricing}
                  selectedExtras={selectedExtras}
                  totalPrice={totalPrice}
                  onBack={goToPrevStep}
                  onComplete={onComplete}
                />
              )}
              
              {currentStep === 'confirmation' && (
                <ConfirmationStep
                  bookingId="TEMP_ID"
                  apartment={apartment}
                  bookingData={bookingData}
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
            pricing={pricing}
            selectedExtras={selectedExtras}
            extrasTotal={calculateExtrasTotal()}
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
  pricing,
  onNext
}: {
  apartment: Apartment;
  bookingData: any;
  pricing: BookingPricing;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Detaily rezervácie</h2>
        <p className="text-muted-foreground">
          Skontrolujte si detaily vašej rezervácie pred pokračovaním.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Apartmán</Label>
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium">{apartment.name}</p>
            <p className="text-sm text-muted-foreground">{apartment.size}m²</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Hostia</Label>
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium">
              {bookingData.guests} dospalý{bookingData.guests !== 1 ? 'ch' : ''}
              {bookingData.children > 0 && `, ${bookingData.children} dieťa${bookingData.children > 1 ? 'ť' : ''}`}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Príchod</Label>
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium">
              {format(bookingData.checkIn, 'EEEE, d. MMMM yyyy', { locale: sk })}
            </p>
            <p className="text-sm text-muted-foreground">od 15:00</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Odchod</Label>
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium">
              {format(bookingData.checkOut, 'EEEE, d. MMMM yyyy', { locale: sk })}
            </p>
            <p className="text-sm text-muted-foreground">do 11:00</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext}>
          Pokračovať
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
      marketingConsent: false
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
          const Icon = service.icon;
          const isSelected = selectedExtras[service.id];
          
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
  pricing,
  selectedExtras, 
  totalPrice, 
  onBack, 
  onComplete 
}: { 
  apartment: Apartment;
  bookingData: any;
  guestInfo: any;
  pricing: BookingPricing;
  selectedExtras: ExtrasFormData;
  totalPrice: number;
  onBack: () => void; 
  onComplete?: (bookingId: string) => void; 
}) {
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [completedBookingId, setCompletedBookingId] = useState<string | null>(null);

  const calculateExtrasTotal = () => {
    return EXTRA_SERVICES.reduce((total, service) => {
      return total + (selectedExtras[service.id] ? service.price : 0);
    }, 0);
  };

  const handlePaymentSuccess = (bookingId: string) => {
    setCompletedBookingId(bookingId);
    setPaymentCompleted(true);
    onComplete?.(bookingId);
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
      pricing={pricing}
      extrasTotal={calculateExtrasTotal()}
      totalPrice={totalPrice}
      onSuccess={handlePaymentSuccess}
      onBack={onBack}
    />
  );
}

function ConfirmationStep({ bookingId }: { bookingId: string; [key: string]: any }) {
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
  pricing,
  selectedExtras,
  extrasTotal,
  totalPrice
}: {
  apartment: Apartment;
  bookingData: any;
  pricing: BookingPricing;
  selectedExtras: ExtrasFormData;
  extrasTotal: number;
  totalPrice: number;
}) {
  const selectedExtrasList = EXTRA_SERVICES.filter(service => selectedExtras[service.id]);

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
            {bookingData.guests} hosť{bookingData.guests > 1 ? 'ia' : ''} • {pricing.nights} noc{pricing.nights > 1 ? 'í' : ''}
          </p>
        </div>

        <Separator />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Ubytovanie ({pricing.nights} noc{pricing.nights > 1 ? 'í' : ''})</span>
            <span>€{pricing.subtotal}</span>
          </div>
          
          {pricing.loyaltyDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Loyalty zľava</span>
              <span>-€{pricing.loyaltyDiscount}</span>
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

          {selectedExtrasList.map(service => (
            <div key={service.id} className="flex justify-between">
              <span>{service.name}</span>
              <span>€{service.price}</span>
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex justify-between font-semibold text-lg">
          <span>Celkom</span>
          <span>€{totalPrice}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper component for labels
function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium">{children}</label>;
}
