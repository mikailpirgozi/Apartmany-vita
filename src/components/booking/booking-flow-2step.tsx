"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Check, ChevronLeft, ChevronRight, User, CreditCard, Calendar, Euro, Percent, Building, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Skeleton } from "@/components/ui/skeleton"; // Currently unused
import { PaymentForm } from "@/components/booking/payment-form";
import { BookingPricing } from "@/services/pricing";
import type { Apartment } from "@/types";

// Booking steps - 2-step flow
const BOOKING_STEPS = [
  { id: 'details', title: 'Detaily & Extra služby', icon: Calendar, description: 'Rezervácia a dodatočné služby' },
  { id: 'payment', title: 'Kontakt & Platba', icon: CreditCard, description: 'Údaje a dokončenie' }
] as const;

type BookingStep = typeof BOOKING_STEPS[number]['id'];

// Payment state type
interface PaymentState {
  success: boolean;
  bookingId: string;
}

// Form schemas
const contactFormSchema = z.object({
  firstName: z.string().min(1, "Meno je povinné"),
  lastName: z.string().min(1, "Priezvisko je povinné"),
  email: z.string().email("Neplatný email"),
  phone: z.string().min(1, "Telefón je povinný"),
  country: z.string().min(1, "Krajina je povinná"),
  city: z.string().min(1, "Mesto je povinné"),
  
  // Invoice fields
  needsInvoice: z.boolean(),
  companyName: z.string().optional(),
  companyId: z.string().optional(),
  companyVat: z.string().optional(),
  companyAddress: z.string().optional(),
  
  // Special requests
  specialRequests: z.string().optional()
});

type ContactFormData = z.infer<typeof contactFormSchema>;
type ExtrasFormData = {
  extraBed: boolean;
  earlyCheckin: boolean;
  lateCheckout: boolean;
  airportTransfer: boolean;
  groceryShopping: boolean;
  tourBooking: boolean;
};

interface BookingFlowProps {
  apartment: Apartment;
  bookingData: {
    checkIn: Date;
    checkOut: Date;
    guests: number;
    children: number;
  };
  availability: boolean;
  initialPricing: BookingPricing; // Pre-calculated pricing from server
}

// Extra services configuration
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
    id: 'earlyCheckin',
    name: 'Skorý príchod',
    description: 'Príchod už od 12:00 (štandardne 15:00)',
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

export function BookingFlow2Step({ apartment, bookingData, availability, initialPricing }: BookingFlowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<BookingStep>('details');
  const [selectedExtras, setSelectedExtras] = useState<ExtrasFormData>({
    extraBed: false,
    earlyCheckin: false,
    lateCheckout: false,
    airportTransfer: false,
    groceryShopping: false,
    tourBooking: false
  });
  const [paymentState, setPaymentState] = useState<PaymentState | null>(null);
  const [pricing] = useState<BookingPricing>(initialPricing);

  // Contact form - use consistent default values to prevent hydration mismatch
  const contactForm = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: 'Slovakia',
      city: '',
      needsInvoice: false
    }
  });

  // Note: Session handling removed to prevent SSR errors
  // Pricing is pre-calculated on server and passed as initialPricing
  // User can manually fill contact form (or we can add session prefill later with proper client-side handling)

  // Calculate extras total
  const extrasTotal = EXTRA_SERVICES.reduce((total, service) => {
    return total + (selectedExtras[service.id] ? service.price : 0);
  }, 0);

  // Total price = subtotal - discounts + extras (NO cleaning fee, NO city tax)
  const totalPrice = pricing 
    ? (pricing.subtotal - pricing.stayDiscount - pricing.loyaltyDiscount + extrasTotal)
    : 0;

  const handleNextStep = () => {
    console.log('🚀 handleNextStep called, current step:', currentStep);
    if (currentStep === 'details') {
      console.log('✅ Moving to payment step');
      setCurrentStep('payment');
      // Scroll to top when changing steps
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    console.log('⬅️ handlePrevStep called, current step:', currentStep);
    if (currentStep === 'payment') {
      console.log('✅ Moving back to details step');
      setCurrentStep('details');
      // Scroll to top when changing steps
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const currentStepIndex = BOOKING_STEPS.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / BOOKING_STEPS.length) * 100;

  if (paymentState?.success) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Rezervácia úspešne vytvorená!
        </h2>
        <p className="text-gray-600 mb-6">
          Potvrdenie sme poslali na email {contactForm.getValues('email')}
        </p>
        <Button type="button" onClick={() => router.push(`/account/bookings/${paymentState.bookingId}`)} suppressHydrationWarning>
          Zobraziť rezerváciu
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {BOOKING_STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                currentStepIndex >= index 
                  ? "bg-blue-600 border-blue-600 text-white" 
                  : "border-gray-300 text-gray-400"
              )}>
                <step.icon className="w-5 h-5" />
              </div>
              <div className="ml-3 hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{step.title}</p>
                <p className="text-sm text-gray-500">{step.description}</p>
              </div>
              {index < BOOKING_STEPS.length - 1 && (
                <div className={cn(
                  "hidden sm:block w-16 h-0.5 mx-4 transition-colors",
                  currentStepIndex > index ? "bg-blue-600" : "bg-gray-300"
                )} />
              )}
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {currentStep === 'details' && (
          <>
            {/* Left Side - Booking Details */}
            <div className="lg:col-span-3 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Detaily rezervácie
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Príchod</p>
                      <p className="font-medium">{format(bookingData.checkIn, 'dd.MM.yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Odchod</p>
                      <p className="font-medium">{format(bookingData.checkOut, 'dd.MM.yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Hostia</p>
                      <p className="font-medium">{bookingData.guests} dospelí</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Deti</p>
                      <p className="font-medium">{bookingData.children} detí</p>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Euro className="w-4 h-4" />
                      Prehľad ceny
                    </h4>
                    
                    {pricing && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>{pricing.nights} nocí × {(pricing.baseSubtotal / pricing.nights).toFixed(2)}€</span>
                          <span>{pricing.baseSubtotal.toFixed(2)}€</span>
                        </div>
                        
                        {(bookingData.guests > 2) && (
                          <div className="flex justify-between text-gray-600">
                            <span className="text-xs">↳ Extra hostia ({bookingData.guests - 2} × 20€/noc)</span>
                            <span className="text-xs">{((bookingData.guests - 2) * 20 * pricing.nights).toFixed(2)}€</span>
                          </div>
                        )}
                        
                        {bookingData.children > 0 && (
                          <div className="flex justify-between text-gray-600">
                            <span className="text-xs">↳ Deti ({bookingData.children} × 10€/noc)</span>
                            <span className="text-xs">{(bookingData.children * 10 * pricing.nights).toFixed(2)}€</span>
                          </div>
                        )}
                        
                        <Separator />
                        
                        <div className="flex justify-between">
                          <span>Medzisúčet</span>
                          <span>{pricing.subtotal.toFixed(2)}€</span>
                        </div>
                        
                        {pricing.stayDiscount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span className="flex items-center gap-1">
                              <Percent className="w-3 h-3" />
                              Zľava za pobyt ({pricing.stayDiscountPercent}%)
                            </span>
                            <span>-{pricing.stayDiscount.toFixed(2)}€</span>
                          </div>
                        )}
                        
                        {pricing.loyaltyDiscount > 0 && (
                          <div className="flex justify-between text-blue-600">
                            <span className="flex items-center gap-1">
                              <Badge variant="secondary" className="text-xs">LOYALTY</Badge>
                              Zľava ({pricing.loyaltyDiscountPercent}%)
                            </span>
                            <span>-{pricing.loyaltyDiscount.toFixed(2)}€</span>
                          </div>
                        )}
                        
                        {extrasTotal > 0 && (
                          <div className="flex justify-between text-blue-600">
                            <span>Extra služby</span>
                            <span>+{extrasTotal.toFixed(2)}€</span>
                          </div>
                        )}
                        
                        <Separator />
                        
                        <div className="flex justify-between text-lg font-bold text-green-600">
                          <span>CELKOM na platbu</span>
                          <span>{totalPrice.toFixed(2)}€</span>
                        </div>
                        
                        <Separator className="my-3" />
                        
                        {/* Informačná sekcia - platba na mieste */}
                        <div className="bg-blue-50 p-3 rounded-md">
                          <p className="text-xs font-medium text-blue-900 mb-2">💡 Platba v hotovosti na mieste:</p>
                          <div className="flex justify-between text-xs text-blue-800">
                            <span>Mestská daň ({bookingData.guests + bookingData.children} osôb × 2€ × {pricing.nights} nocí)</span>
                            <span className="font-medium">{pricing.cityTax.toFixed(2)}€</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Extra Services */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Extra služby</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {EXTRA_SERVICES.map((service) => (
                      <div key={service.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={service.id}
                          checked={selectedExtras[service.id]}
                          onCheckedChange={(checked) =>
                            setSelectedExtras(prev => ({
                              ...prev,
                              [service.id]: checked === true
                            }))
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <label htmlFor={service.id} className="cursor-pointer">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{service.name}</span>
                              <span className="text-blue-600 font-medium">+{service.price}€</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{service.description}</p>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Continue Button */}
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  console.log('📌 Continue button clicked');
                  handleNextStep();
                }} 
                className="w-full" 
                size="lg"
                type="button"
                suppressHydrationWarning
              >
                Pokračovať na platbu
                <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </>
        )}

        {currentStep === 'payment' && (
          <>
            {/* Left Side - Contact Form */}
            <div className="lg:col-span-3 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Kontaktné údaje
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...contactForm}>
                    <form className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={contactForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meno *</FormLabel>
                              <FormControl>
                                <Input placeholder="Janko" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={contactForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priezvisko *</FormLabel>
                              <FormControl>
                                <Input placeholder="Novák" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={contactForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="janko@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={contactForm.control}
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
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Invoice Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Fakturačné údaje
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...contactForm}>
                    <form className="space-y-4">
                      <FormField
                        control={contactForm.control}
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
                              <FormLabel>Potrebujem faktúru</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      {contactForm.watch('needsInvoice') && (
                        <div className="space-y-4 pt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={contactForm.control}
                              name="companyName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Názov firmy</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Firma s.r.o." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={contactForm.control}
                              name="companyId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>IČO</FormLabel>
                                  <FormControl>
                                    <Input placeholder="12345678" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={contactForm.control}
                            name="companyVat"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>DIČ</FormLabel>
                                <FormControl>
                                  <Input placeholder="SK1234567890" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={contactForm.control}
                            name="companyAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Adresa</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ulica 123, 911 01 Trenčín" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Special Requests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Špeciálne požiadavky
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...contactForm}>
                    <form>
                      <FormField
                        control={contactForm.control}
                        name="specialRequests"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea 
                                placeholder="Napíšte nám svoje požiadavky alebo poznámky k rezervácii..."
                                className="min-h-[80px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Order Summary & Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Summary - Sticky */}
              <div className="sticky top-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Súhrn objednávky</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between font-medium">
                        <span>{apartment.name}</span>
                        <span>{pricing?.nights} nocí</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>{format(bookingData.checkIn, 'dd.MM')} - {format(bookingData.checkOut, 'dd.MM.yyyy')}</span>
                        <span>{bookingData.guests + bookingData.children} osôb</span>
                      </div>
                      
                      <Separator className="my-3" />
                      
                      <div className="flex justify-between">
                        <span>Apartmán + poplatky</span>
                        <span>{pricing?.total.toFixed(2)}€</span>
                      </div>
                      
                      {extrasTotal > 0 && (
                        <div className="flex justify-between text-blue-600">
                          <span>Extra služby</span>
                          <span>+{extrasTotal.toFixed(2)}€</span>
                        </div>
                      )}
                      
                      <Separator className="my-3" />
                      
                      <div className="flex justify-between text-lg font-bold">
                        <span>CELKOM</span>
                        <span>{totalPrice.toFixed(2)}€</span>
                      </div>
                    </div>

                    <Alert>
                      <AlertDescription>
                        💳 Platba sa autorizuje teraz, ale zúčtuje sa až 7 dní pred príchodom.
                      </AlertDescription>
                    </Alert>

                    {/* Payment Form */}
                    <PaymentForm
                      apartment={apartment}
                      bookingData={bookingData}
                      guestInfo={contactForm.getValues()}
                      availability={{
                        success: true,
                        isAvailable: availability,
                        totalPrice: pricing?.total || 0,
                        pricePerNight: pricing?.basePrice || 0,
                        nights: pricing?.nights || 0
                      }}
                      extrasTotal={extrasTotal}
                      totalPrice={totalPrice}
                      onSuccess={(bookingId) => setPaymentState({ success: true, bookingId })}
                    />
                  </CardContent>
                </Card>

                {/* Back Button */}
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handlePrevStep} 
                  className="w-full mt-4"
                  suppressHydrationWarning
                >
                  <ChevronLeft className="mr-2 w-4 h-4" />
                  Späť na detaily
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Loading skeleton for booking flow (currently unused)
/*
function _BookingFlowSkeleton() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="ml-3 hidden sm:block">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
              {i < 1 && (
                <Skeleton className="hidden sm:block w-16 h-0.5 mx-4" />
              )}
            </div>
          ))}
        </div>
        <Skeleton className="h-2 w-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <Skeleton className="w-4 h-4 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
*/
