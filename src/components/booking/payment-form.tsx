"use client";

import { useState, useEffect } from "react";
import { useStripe, useElements, PaymentElement, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { CreditCard, Shield, Lock, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { STRIPE_PUBLISHABLE_KEY } from "@/lib/stripe";
import type { Apartment } from "@/types";
import type { BookingPricing } from "@/services/pricing";

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
  pricing: BookingPricing;
  extrasTotal: number;
  totalPrice: number;
  onSuccess?: (bookingId: string) => void;
  onBack?: () => void;
}

interface PaymentElementFormProps extends Omit<PaymentFormProps, 'onSuccess' | 'onBack'> {
  clientSecret: string;
  onPaymentSuccess: (bookingId: string) => void;
  onPaymentError: (error: string) => void;
  onBack?: () => void;
}

// Main payment wrapper component
export function PaymentForm(props: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create payment intent on component mount
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: props.totalPrice,
            apartmentId: props.apartment.id,
            guestEmail: props.guestInfo.email,
            guestName: `${props.guestInfo.firstName} ${props.guestInfo.lastName}`,
            checkIn: format(props.bookingData.checkIn, 'yyyy-MM-dd'),
            checkOut: format(props.bookingData.checkOut, 'yyyy-MM-dd'),
            bookingData: props.bookingData,
            guestInfo: props.guestInfo,
            pricing: props.pricing,
            extrasTotal: props.extrasTotal
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }

        const { clientSecret } = await response.json();
        setClientSecret(clientSecret);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Nepodarilo sa inicializovať platbu');
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
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

  if (!clientSecret) {
    return (
      <PaymentErrorState 
        error="Nepodarilo sa inicializovať platbu" 
        onRetry={() => window.location.reload()}
        onBack={props.onBack}
      />
    );
  }

  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: 'hsl(var(--primary))',
        colorBackground: 'hsl(var(--background))',
        colorText: 'hsl(var(--foreground))',
        colorDanger: 'hsl(var(--destructive))',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '6px'
      }
    }
  };

  return (
    <Elements stripe={stripePromise} options={stripeOptions}>
      <PaymentElementForm
        {...props}
        clientSecret={clientSecret}
        onPaymentSuccess={(bookingId) => props.onSuccess?.(bookingId)}
        onPaymentError={(error) => setError(error)}
      />
    </Elements>
  );
}

// Payment form with Stripe Elements
function PaymentElementForm({
  apartment,
  bookingData,
  guestInfo,
  pricing,
  extrasTotal,
  totalPrice,
  clientSecret,
  onPaymentSuccess,
  onPaymentError,
  onBack
}: PaymentElementFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  
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
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking/confirmation`,
          receipt_email: guestInfo.email,
        },
        redirect: 'if_required'
      });

      if (error) {
        setPaymentError(error.message || 'Platba sa nepodarila');
      } else if (paymentIntent?.status === 'requires_capture') {
        // Payment authorized successfully
        const bookingId = paymentIntent.metadata?.bookingId;
        if (bookingId) {
          onPaymentSuccess(bookingId);
        } else {
          setPaymentError('Chyba pri spracovaní rezervácie');
        }
      } else {
        setPaymentError('Neočakávaný stav platby');
      }
    } catch (err) {
      setPaymentError('Nastala chyba pri spracovaní platby');
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
              onCheckedChange={setTermsAccepted}
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
              onCheckedChange={setCancellationAccepted}
              className="mt-1"
            />
            <Label htmlFor="cancellation" className="text-sm leading-relaxed">
              Súhlasím s{' '}
              <a href="/cancellation" target="_blank" className="text-primary hover:underline">
                stornovacími podmienkami
              </a>
              . Rezerváciu môžem zrušiť bezplatne do 24 hodín pred príchodom.
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
          <Button type="button" variant="outline" onClick={onBack} disabled={isProcessing}>
            Späť
          </Button>
          
          <Button 
            type="submit" 
            disabled={!canProceed}
            className="min-w-[200px]"
            size="lg"
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
      <div>
        <div className="h-6 bg-muted rounded w-32 mb-2" />
        <div className="h-4 bg-muted rounded w-96" />
      </div>
      
      <div className="h-24 bg-muted rounded" />
      
      <div className="space-y-4">
        <div className="h-32 bg-muted rounded" />
        <div className="h-16 bg-muted rounded" />
        <div className="h-12 bg-muted rounded" />
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
  bookingData: any;
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
