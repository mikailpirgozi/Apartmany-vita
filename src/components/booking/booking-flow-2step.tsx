"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronLeft, ChevronRight, User, CreditCard, Calendar, Euro, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Skeleton } from "@/components/ui/skeleton"; // Currently unused
import { PaymentForm } from "@/components/booking/payment-form";
import { BookingPricing } from "@/services/pricing";
import type { Apartment, Beds24AvailabilityResponse } from "@/types";

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

type BreakfastFormData = {
  wantsBreakfast: boolean;
  adults: number;
  children: number;
  delivery: boolean;
  specialRequests: string;
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
  const { data: session } = useSession() as { data: Session | null };
  const [currentStep, setCurrentStep] = useState<BookingStep>('details');
  const [selectedExtras, setSelectedExtras] = useState<ExtrasFormData>({
    extraBed: false,
    earlyCheckin: false,
    lateCheckout: false,
    airportTransfer: false,
    groceryShopping: false,
    tourBooking: false
  });
  const [breakfastData, setBreakfastData] = useState<BreakfastFormData>({
    wantsBreakfast: false,
    adults: bookingData.guests,
    children: bookingData.children,
    delivery: false,
    specialRequests: ''
  });
  const [paymentState, setPaymentState] = useState<PaymentState | null>(null);

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

  // Fetch user profile data if logged in
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const response = await fetch('/api/user/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      const data = await response.json();
      return data.user;
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Auto-fill contact form with user profile data when available
  useEffect(() => {
    if (userProfile && session?.user) {
      // Split name into firstName and lastName if available
      const nameParts = userProfile.name?.split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Pre-fill form with user data
      contactForm.reset({
        firstName: firstName,
        lastName: lastName,
        email: userProfile.email || session.user.email || '',
        phone: userProfile.phone || '',
        country: userProfile.country || 'Slovakia', // Use saved country or default
        city: userProfile.city || '', // Use saved city
        needsInvoice: !!userProfile.companyName, // Auto-check if user has company info
        companyName: userProfile.companyName || '',
        companyId: userProfile.companyId || '',
        companyVat: userProfile.companyVat || '',
        companyAddress: userProfile.companyAddress || '',
        specialRequests: ''
      });
    }
  }, [userProfile, session, contactForm]);

  // Fetch pricing with loyalty discount if user is logged in
  const { data: availabilityWithLoyalty } = useQuery<Beds24AvailabilityResponse | null>({
    queryKey: ['booking-pricing', apartment.slug, bookingData.checkIn, bookingData.checkOut, bookingData.guests, bookingData.children, session?.user?.id],
    queryFn: async () => {
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const checkInStr = formatDate(bookingData.checkIn);
      const checkOutStr = formatDate(bookingData.checkOut);
      
      // Include userId in query for loyalty discount calculation
      const userIdParam = session?.user?.id ? `&userId=${session.user.id}` : '';
      const url = `/api/beds24/availability?apartment=${apartment.slug}&checkIn=${checkInStr}&checkOut=${checkOutStr}&guests=${bookingData.guests}&children=${bookingData.children}${userIdParam}`;
      console.log('🔍 Fetching booking pricing from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'public, max-age=300',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch pricing');
      }
      
      const data = await response.json();
      console.log('✅ Booking pricing data received:', data);
      return data;
    },
    enabled: true,
    staleTime: 10 * 60 * 1000,
  });

  // Use availability data if available, otherwise fallback to initial pricing
  const currentSubtotal = availabilityWithLoyalty?.subtotal || availabilityWithLoyalty?.totalPrice || initialPricing.subtotal;
  const currentStayDiscount = availabilityWithLoyalty?.stayDiscount || 0;
  const currentStayDiscountInfo = availabilityWithLoyalty?.stayDiscountInfo || null;
  const currentLoyaltyDiscount = availabilityWithLoyalty?.loyaltyDiscount || 0;
  const currentLoyaltyTier = availabilityWithLoyalty?.loyaltyTier || null;

  // Calculate extras total
  const extrasTotal = EXTRA_SERVICES.reduce((total, service) => {
    return total + (selectedExtras[service.id] ? service.price : 0);
  }, 0);

  // Calculate breakfast total (per night)
  const BREAKFAST_ADULT_PRICE = 9.90;
  const BREAKFAST_CHILD_PRICE = 5.90;
  const breakfastPerNight = (breakfastData.adults * BREAKFAST_ADULT_PRICE) + (breakfastData.children * BREAKFAST_CHILD_PRICE);
  const breakfastTotal = breakfastData.wantsBreakfast 
    ? breakfastPerNight * initialPricing.nights
    : 0;

  // Total price = subtotal - stay discount - loyalty discount + extras + breakfast
  const totalPrice = currentSubtotal - currentStayDiscount - currentLoyaltyDiscount + extrasTotal + breakfastTotal;

  const handleNextStep = async () => {
    console.log('🚀 handleNextStep called, current step:', currentStep);
    if (currentStep === 'details') {
      // Validate contact form before moving to payment
      const isValid = await contactForm.trigger(['firstName', 'lastName', 'email', 'phone', 'country', 'city']);
      
      if (!isValid) {
        console.error('❌ Form validation failed');
        return;
      }
      
      console.log('✅ Form validated, moving to payment step');
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
                    
                    {initialPricing && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>{initialPricing.nights} nocí × {(initialPricing.baseSubtotal / initialPricing.nights).toFixed(2)}€</span>
                          <span>{initialPricing.baseSubtotal.toFixed(2)}€</span>
                        </div>
                        
                        {(bookingData.guests > 2) && (
                          <div className="flex justify-between text-gray-600">
                            <span className="text-xs">↳ Extra hostia ({bookingData.guests - 2} × 20€/noc)</span>
                            <span className="text-xs">{((bookingData.guests - 2) * 20 * initialPricing.nights).toFixed(2)}€</span>
                          </div>
                        )}
                        
                        {bookingData.children > 0 && (
                          <div className="flex justify-between text-gray-600">
                            <span className="text-xs">↳ Deti ({bookingData.children} × 10€/noc)</span>
                            <span className="text-xs">{(bookingData.children * 10 * initialPricing.nights).toFixed(2)}€</span>
                          </div>
                        )}
                        
                        <Separator />
                        
                        <div className="flex justify-between">
                          <span>Pôvodná cena</span>
                          <span>{currentSubtotal.toFixed(2)}€</span>
                        </div>
                        
                        {currentStayDiscount > 0 && currentStayDiscountInfo && (
                          <div className="flex justify-between text-blue-600">
                            <span className="flex items-center gap-1">
                              <Percent className="w-3 h-3" />
                              Zľava za dlhší pobyt ({currentStayDiscountInfo.label}) - {currentStayDiscountInfo.discountPercent}%
                            </span>
                            <span>-{currentStayDiscount.toFixed(2)}€</span>
                          </div>
                        )}
                        
                        {currentLoyaltyDiscount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span className="flex items-center gap-1">
                              <Percent className="w-3 h-3" />
                              Loyalty zľava {currentLoyaltyTier ? `(${currentLoyaltyTier})` : ''} - {availabilityWithLoyalty?.loyaltyDiscountPercent || 5}%
                            </span>
                            <span>-{currentLoyaltyDiscount.toFixed(2)}€</span>
                          </div>
                        )}
                        
                        {!session?.user && !currentLoyaltyDiscount && (
                          <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                            <p className="text-xs font-medium text-amber-800 mb-1">
                              💡 Registrujte sa a získajte ďalších 5% zľavu!
                            </p>
                            <p className="text-xs text-amber-600">
                              Ušetrili by ste ešte €{(currentSubtotal * 0.05).toFixed(2)}
                            </p>
                          </div>
                        )}
                        
                        {extrasTotal > 0 && (
                          <div className="flex justify-between text-blue-600">
                            <span>Extra služby</span>
                            <span>+{extrasTotal.toFixed(2)}€</span>
                          </div>
                        )}
                        
                        {breakfastTotal > 0 && (
                          <div className="flex justify-between text-amber-600">
                            <span>Ranajky ({breakfastData.adults + breakfastData.children} osôb × {initialPricing.nights} {initialPricing.nights === 1 ? 'noc' : initialPricing.nights < 5 ? 'noci' : 'nocí'})</span>
                            <span>+{breakfastTotal.toFixed(2)}€</span>
                          </div>
                        )}
                        
                        <Separator />
                        
                        <div className="flex justify-between text-lg font-bold text-green-600">
                          <span>CELKOM na platbu</span>
                          <span>{totalPrice.toFixed(2)}€</span>
                        </div>
                        
                        {(currentStayDiscount > 0 || currentLoyaltyDiscount > 0) && (
                          <div className="text-xs text-green-600 mt-1 space-y-0.5">
                            {currentStayDiscount > 0 && (
                              <p>✓ Zahŕňa zľavu za pobyt €{currentStayDiscount.toFixed(2)}</p>
                            )}
                            {currentLoyaltyDiscount > 0 && (
                              <p>✓ Zahŕňa loyalty zľavu €{currentLoyaltyDiscount.toFixed(2)}</p>
                            )}
                          </div>
                        )}
                        
                        <Separator className="my-3" />
                        
                        {/* Informačná sekcia - platba na mieste */}
                        <div className="bg-blue-50 p-3 rounded-md">
                          <p className="text-xs font-medium text-blue-900 mb-2">💡 Platba v hotovosti na mieste:</p>
                          <div className="flex justify-between text-xs text-blue-800">
                            <span>Mestská daň ({bookingData.guests + bookingData.children} osôb × 2€ × {initialPricing.nights} nocí)</span>
                            <span className="font-medium">{initialPricing.cityTax.toFixed(2)}€</span>
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

              {/* Breakfast Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">☕</span>
                    Ranajky v Pražiarničke
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Čerstvo pražená káva a brutálne naložené ranajky priamo v budove
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Main checkbox */}
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="wantsBreakfast"
                      checked={breakfastData.wantsBreakfast}
                      onCheckedChange={(checked) =>
                        setBreakfastData(prev => ({
                          ...prev,
                          wantsBreakfast: checked === true
                        }))
                      }
                    />
                    <div className="flex-1">
                      <label htmlFor="wantsBreakfast" className="cursor-pointer">
                        <div className="font-medium">Chcem ranajky</div>
                        <p className="text-xs text-gray-600 mt-1">
                          Objednajte si ranajky vopred a užite si ich v Pražiarničke alebo s donáškou
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* Breakfast details - shown when checkbox is checked */}
                  {breakfastData.wantsBreakfast && (
                    <div className="pl-7 space-y-4 border-l-2 border-amber-200">
                      {/* Number of people */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Dospelí (9,90€/osoba)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            value={breakfastData.adults}
                            onChange={(e) =>
                              setBreakfastData(prev => ({
                                ...prev,
                                adults: parseInt(e.target.value) || 0
                              }))
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Deti (5,90€/dieťa)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            value={breakfastData.children}
                            onChange={(e) =>
                              setBreakfastData(prev => ({
                                ...prev,
                                children: parseInt(e.target.value) || 0
                              }))
                            }
                          />
                        </div>
                      </div>

                      {/* Delivery option */}
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="breakfastDelivery"
                          checked={breakfastData.delivery}
                          onCheckedChange={(checked) =>
                            setBreakfastData(prev => ({
                              ...prev,
                              delivery: checked === true
                            }))
                          }
                        />
                        <div className="flex-1">
                          <label htmlFor="breakfastDelivery" className="cursor-pointer">
                            <div className="font-medium text-sm">Donáška do apartmánu</div>
                            <p className="text-xs text-gray-600 mt-1">
                              Ranajky vám doručíme priamo do apartmánu (zadarmo)
                            </p>
                          </label>
                        </div>
                      </div>

                      {/* Special requests */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Špeciálne požiadavky (voliteľné)
                        </label>
                        <Input
                          placeholder="Napr. bez laktózy, vegetariánske..."
                          value={breakfastData.specialRequests}
                          onChange={(e) =>
                            setBreakfastData(prev => ({
                              ...prev,
                              specialRequests: e.target.value
                            }))
                          }
                        />
                      </div>

                      {/* Price summary */}
                      <div className="bg-amber-50 p-3 rounded-md">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Dospelí ({breakfastData.adults} × 9,90€)</span>
                          <span className="font-medium">{(breakfastData.adults * BREAKFAST_ADULT_PRICE).toFixed(2)}€</span>
                        </div>
                        {breakfastData.children > 0 && (
                          <div className="flex justify-between text-sm mb-1">
                            <span>Deti ({breakfastData.children} × 5,90€)</span>
                            <span className="font-medium">{(breakfastData.children * BREAKFAST_CHILD_PRICE).toFixed(2)}€</span>
                          </div>
                        )}
                        <div className="text-sm text-amber-700 mb-1">
                          Za 1 noc: {breakfastPerNight.toFixed(2)}€
                        </div>
                        <div className="border-t border-amber-200 mt-2 pt-2 flex justify-between font-bold text-amber-900">
                          <span>Celkom za {initialPricing.nights} {initialPricing.nights === 1 ? 'noc' : initialPricing.nights < 5 ? 'noci' : 'nocí'}</span>
                          <span>{breakfastTotal.toFixed(2)}€</span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>🕐 Čas podávania: 7:00 - 13:00</p>
                        <p>📍 Pražiarnička by Caffe Vita - priamo v budove</p>
                        <p>🔗 <a href="/ranajky" target="_blank" className="text-blue-600 hover:underline">Zobraziť celé menu</a></p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Form in Step 1 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Kontaktné údaje
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Info banner when user is logged in and data is pre-filled */}
                  {session?.user && userProfile && (
                    <Alert className="mb-4 bg-green-50 border-green-200">
                      <Check className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Vaše údaje boli automaticky predvyplnené z profilu. Môžete ich upraviť podľa potreby.
                      </AlertDescription>
                    </Alert>
                  )}
                  
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
                              <Input placeholder="+421 940 728 676" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={contactForm.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Krajina *</FormLabel>
                              <FormControl>
                                <Input placeholder="Slovakia" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={contactForm.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mesto *</FormLabel>
                              <FormControl>
                                <Input placeholder="Bratislava" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </form>
                  </Form>
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
            {/* Payment Step - Only show payment */}
            <div className="lg:col-span-5">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Platba
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-6">
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
                      totalPrice: totalPrice,
                      pricePerNight: currentSubtotal / initialPricing.nights,
                      nights: initialPricing.nights
                    }}
                    extrasTotal={extrasTotal}
                    breakfastData={breakfastData.wantsBreakfast ? breakfastData : undefined}
                    totalPrice={totalPrice}
                    onSuccess={(bookingId) => setPaymentState({ success: true, bookingId })}
                    onBack={handlePrevStep}
                  />
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* OLD PAYMENT STEP CONTENT REMOVED - keeping only the essential parts above */}
        {false && currentStep === 'payment' && (
          <>
            {/* REMOVED DUPLICATE CONTENT */}
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
                        <span>{initialPricing.nights} nocí</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>{format(bookingData.checkIn, 'dd.MM')} - {format(bookingData.checkOut, 'dd.MM.yyyy')}</span>
                        <span>{bookingData.guests + bookingData.children} osôb</span>
                      </div>
                      
                      <Separator className="my-3" />
                      
                      <div className="flex justify-between">
                        <span>Pôvodná cena</span>
                        <span>{currentSubtotal.toFixed(2)}€</span>
                      </div>
                      
                      {currentStayDiscount > 0 && (
                        <div className="flex justify-between text-blue-600">
                          <span>Zľava za pobyt</span>
                          <span>-{currentStayDiscount.toFixed(2)}€</span>
                        </div>
                      )}
                      
                      {currentLoyaltyDiscount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Loyalty zľava</span>
                          <span>-{currentLoyaltyDiscount.toFixed(2)}€</span>
                        </div>
                      )}
                      
                      {extrasTotal > 0 && (
                        <div className="flex justify-between text-blue-600">
                          <span>Extra služby</span>
                          <span>+{extrasTotal.toFixed(2)}€</span>
                        </div>
                      )}
                      
                      {breakfastTotal > 0 && (
                        <div className="flex justify-between text-amber-600">
                          <span>Ranajky ({breakfastData.adults + breakfastData.children} osôb × {initialPricing.nights} {initialPricing.nights === 1 ? 'noc' : initialPricing.nights < 5 ? 'noci' : 'nocí'})</span>
                          <span>+{breakfastTotal.toFixed(2)}€</span>
                        </div>
                      )}
                      
                      <Separator className="my-3" />
                      
                      <div className="flex justify-between text-lg font-bold">
                        <span>CELKOM</span>
                        <span>{totalPrice.toFixed(2)}€</span>
                      </div>
                      
                      {(currentStayDiscount > 0 || currentLoyaltyDiscount > 0) && (
                        <div className="text-xs text-green-600 space-y-0.5">
                          {currentStayDiscount > 0 && (
                            <p>✓ Zahŕňa zľavu za pobyt €{currentStayDiscount.toFixed(2)}</p>
                          )}
                          {currentLoyaltyDiscount > 0 && (
                            <p>✓ Zahŕňa loyalty zľavu €{currentLoyaltyDiscount.toFixed(2)}</p>
                          )}
                        </div>
                      )}
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
                        totalPrice: totalPrice,
                        pricePerNight: currentSubtotal / initialPricing.nights,
                        nights: initialPricing.nights
                      }}
                      extrasTotal={extrasTotal}
                      breakfastData={breakfastData.wantsBreakfast ? breakfastData : undefined}
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
