"use client";

import { useState, useEffect } from "react";
import { useStripe, useElements, PaymentElement, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CreditCard, Shield, Lock, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { STRIPE_PUBLISHABLE_KEY } from "@/lib/stripe";
import type { Apartment } from "@/types";

// Initialize Stripe
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

interface PaymentFormProps {
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
  };
  availability?: {
    success: boolean;
    isAvailable: boolean;
    totalPrice: number;
    pricePerNight: number;
    nights: number;
  };
  extrasTotal: number;
  totalPrice: number;
  onSuccess?: (bookingId: string) => void;
  onBack?: () => void;
}

interface PaymentElementFormProps {
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
  };
  extrasTotal: number;
  totalPrice: number;
  clientSecret: string;
  onPaymentSuccess: (bookingId: string) => void;
  onPaymentError: (error: string) => void;
  onBack?: () => void;
}

// Main payment wrapper component
export function PaymentForm(props: PaymentFormProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create Stripe Checkout Session and redirect
  useEffect(() => {
    const createCheckoutSession = async () => {
      try {
        setLoading(true);
        setError(null);

        const paymentData = {
            amount: props.totalPrice,
            apartmentId: props.apartment.slug, // Use slug instead of ID (works with both static and DB apartments)
            guestEmail: props.guestInfo.email,
            guestName: `${props.guestInfo.firstName} ${props.guestInfo.lastName}`,
            checkIn: format(props.bookingData.checkIn, 'yyyy-MM-dd'),
            checkOut: format(props.bookingData.checkOut, 'yyyy-MM-dd'),
            bookingData: props.bookingData,
            guestInfo: props.guestInfo,
            pricing: {
              total: props.totalPrice,
              subtotal: (props.availability?.pricePerNight && props.availability?.nights) 
                ? props.availability.pricePerNight * props.availability.nights 
                : props.totalPrice,
              loyaltyDiscount: 0,
              cleaningFee: 0,
              cityTax: 0,
              nights: props.availability?.nights || 1
            },
            extrasTotal: props.extrasTotal
        };

        console.log('📤 Sending payment data:', JSON.stringify(paymentData, null, 2));

        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentData),
        });

        if (!response.ok) {
          // Get detailed error from API
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('❌ Payment API Error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          throw new Error(errorData.error || `Failed to create checkout session (${response.status})`);
        }

        const { url, bookingId } = await response.json();
        
        // Store booking ID for later use
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('pendingBookingId', bookingId);
        }
        
        // Redirect to Stripe Checkout
        if (url) {
          window.location.href = url;
        } else {
          throw new Error('No checkout URL received');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Nepodarilo sa inicializovať platbu');
        setLoading(false);
      }
    };

    createCheckoutSession();
  }, [props]);

  if (loading) {
    return <PaymentLoadingSkeleton />;
  }

  if (error) {
    return (
      <PaymentErrorState 
        error={error} 
        onRetry={() => window.location.reload()} 
        onBack={props.onBack}
      />
    );
  }

  return null; // Payment form redirects to Stripe Checkout, no inline form needed
}

// Payment form with Stripe Elements
function PaymentElementForm({
  apartment,
  guestInfo,
  onPaymentSuccess,
  onBack,
  totalPrice,
  bookingData
}: PaymentElementFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [cancellationAccepted, setCancellationAccepted] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const canProceed = stripe && elements && termsAccepted && cancellationAccepted && !isProcessing;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!canProceed) return;

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // First create booking in Beds24
      console.log('🏨 Creating booking in Beds24...');
      const bookingResponse = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apartment: apartment.slug,
          arrival: bookingData.checkIn.toISOString().split('T')[0],
          departure: bookingData.checkOut.toISOString().split('T')[0],
          numAdult: bookingData.guests,
          numChild: bookingData.children,
          firstName: guestInfo.firstName,
          lastName: guestInfo.lastName,
          email: guestInfo.email,
          phone: guestInfo.phone,
          city: guestInfo.city,
          country: guestInfo.country,
          price: totalPrice,
          comments: `Online booking via apartmanvita.sk`
        })
      });

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json();
        throw new Error(errorData.error || 'Booking creation failed');
      }

      const bookingResult = await bookingResponse.json();
      console.log('✅ Booking created:', bookingResult);

      if (!bookingResult.success || !bookingResult.bookingId) {
        throw new Error('Invalid booking response');
      }

      // For now, simulate successful payment and return booking ID
      // In production, you would process payment here with Stripe
      console.log('💳 Simulating payment success...');
      
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onPaymentSuccess(bookingResult.bookingId);

    } catch (error) {
      console.error('❌ Booking/Payment error:', error);
      setPaymentError(error instanceof Error ? error.message : 'Nastala chyba pri spracovaní rezervácie');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Platba
        </h2>
        <p className="text-muted-foreground">
          Bezpečná platba kartou. Vaša karta bude zatiaľ len autorizovaná, peniaze sa stiahnú 7 dní pred príchodom.
        </p>
      </div>

      {/* Payment Summary */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Celková suma</span>
              <span className="text-2xl font-bold">€{totalPrice}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Platba bude spracovaná 7 dní pred príchodom ({format(bookingData.checkIn, 'd.M.yyyy')})
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Badges */}
      <div className="flex items-center justify-center gap-6 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-green-600" />
          <span>SSL šifrovanie</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4 text-green-600" />
          <span>Stripe zabezpečenie</span>
        </div>
        <Badge variant="outline" className="text-xs">
          PCI DSS Level 1
        </Badge>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Element */}
        <Card>
          <CardContent className="p-6">
            <PaymentElement 
              options={{
                layout: 'tabs',
                paymentMethodOrder: ['card']
              }}
            />
          </CardContent>
        </Card>

        {/* Error Display */}
        {paymentError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{paymentError}</AlertDescription>
          </Alert>
        )}

        {/* Terms and Conditions */}
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              className="mt-1"
            />
            <Label htmlFor="terms" className="text-sm leading-relaxed">
              Súhlasím s{' '}
              <a href="/terms" target="_blank" className="text-primary hover:underline">
                obchodnými podmienkami
              </a>{' '}
              a{' '}
              <a href="/privacy" target="_blank" className="text-primary hover:underline">
                zásadami ochrany osobných údajov
              </a>
            </Label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="cancellation"
              checked={cancellationAccepted}
              onCheckedChange={(checked) => setCancellationAccepted(checked === true)}
              className="mt-1"
            />
            <Label htmlFor="cancellation" className="text-sm leading-relaxed">
              Súhlasím s{' '}
              <a href="/cancellation" target="_blank" className="text-primary hover:underline">
                stornovacími podmienkami
              </a>
              . Rezerváciu môžem zrušiť bezplatne do 7 dní pred príchodom.
            </Label>
          </div>
        </div>

        {/* Payment Info */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Bezpečná platba:</strong> Vaša karta bude len autorizovaná. Skutočná platba prebehne 7 dní pred príchodom. 
            Ak rezerváciu zrušíte včas, autorizácia sa automaticky zruší.
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack} disabled={isProcessing} suppressHydrationWarning>
            Späť
          </Button>
          
          <Button 
            type="submit" 
            disabled={!canProceed}
            className="min-w-[200px]"
            size="lg"
            suppressHydrationWarning
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Spracovávam platbu...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Potvrdiť rezerváciu
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Payment Methods Info */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-2">Akceptujeme</p>
        <div className="flex justify-center items-center gap-2">
          <Badge variant="outline" className="text-xs">Visa</Badge>
          <Badge variant="outline" className="text-xs">Mastercard</Badge>
          <Badge variant="outline" className="text-xs">American Express</Badge>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton
function PaymentLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <h2 className="text-xl font-semibold mb-2">Pripravujem platbu...</h2>
        <p className="text-muted-foreground mb-4">
          O chvíľu vás presmerujeme na bezpečnú Stripe platobnú bránu.
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span>SSL šifrovanie</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-green-600" />
            <span>PCI DSS certifikované</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Error state component
function PaymentErrorState({ 
  error, 
  onRetry, 
  onBack 
}: { 
  error: string; 
  onRetry: () => void; 
  onBack?: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Chyba pri inicializácii platby</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        
        <div className="flex justify-center gap-4">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              Späť
            </Button>
          )}
          <Button onClick={onRetry}>
            Skúsiť znovu
          </Button>
        </div>
      </div>
    </div>
  );
}

// Success state component
export function PaymentSuccessState({ 
  bookingId, 
  apartment, 
  bookingData 
}: { 
  bookingId: string; 
  apartment: Apartment;
  bookingData: {
    checkIn: Date;
    checkOut: Date;
    guests: number;
    children: number;
  };
}) {
  const router = useRouter();

  return (
    <div className="text-center py-12">
      <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
      
      <h2 className="text-2xl font-bold mb-4">Rezervácia potvrdená!</h2>
      
      <div className="max-w-md mx-auto space-y-4 mb-8">
        <p className="text-muted-foreground">
          Vaša rezervácia bola úspešne vytvorená. Potvrdenie sme vám poslali na email.
        </p>
        
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Rezervácia:</span>
                <span className="font-mono">{bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span>Apartmán:</span>
                <span>{apartment.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Dátum:</span>
                <span>
                  {format(bookingData.checkIn, 'd.M.yyyy')} - {format(bookingData.checkOut, 'd.M.yyyy')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={() => router.push('/')}>
          Späť na hlavnú stránku
        </Button>
        <Button onClick={() => router.push(`/booking/confirmation/${bookingId}`)}>
          Zobraziť rezerváciu
        </Button>
      </div>
    </div>
  );
}
