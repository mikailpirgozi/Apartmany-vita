"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function BookingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState<{
    bookingId: string;
    apartmentName: string;
    checkIn: string;
    checkOut: string;
    totalAmount: number;
    taxAmount: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError('Chýba session ID');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/payments/verify-session?session_id=${sessionId}`);
        
        if (!response.ok) {
          throw new Error('Nepodarilo sa overiť platbu');
        }

        const data = await response.json();
        setBookingData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Nastala chyba');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-bold mb-2">Overujem platbu...</h1>
          <p className="text-muted-foreground">Prosím počkajte, spracovávame vašu rezerváciu.</p>
        </div>
      </div>
    );
  }

  if (error || !bookingData) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-destructive mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Chyba pri overení platby</h1>
          <p className="text-muted-foreground mb-6">{error || 'Nepodarilo sa načítať údaje o rezervácii'}</p>
          <Button onClick={() => router.push('/')}>Späť na hlavnú stránku</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Rezervácia potvrdená!</h1>
          <p className="text-lg text-muted-foreground">
            Platba prebehla úspešne. Potvrdenie sme vám poslali na email.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Detaily rezervácie</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-muted-foreground">Číslo rezervácie:</span>
                <span className="font-mono font-semibold">{bookingData.bookingId}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-muted-foreground">Apartmán:</span>
                <span className="font-semibold">{bookingData.apartmentName}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-muted-foreground">Check-in:</span>
                <span>{new Date(bookingData.checkIn).toLocaleDateString('sk-SK')}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-muted-foreground">Check-out:</span>
                <span>{new Date(bookingData.checkOut).toLocaleDateString('sk-SK')}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-muted-foreground">Suma bez DPH:</span>
                <span>€{(bookingData.totalAmount - bookingData.taxAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-muted-foreground">DPH (5%):</span>
                <span>€{bookingData.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold text-lg">Celková suma:</span>
                <span className="font-bold text-2xl text-primary">€{bookingData.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-2">ℹ️ Dôležité informácie</h3>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Platba bude stiahnutá z vašej karty 7 dní pred príchodom</li>
            <li>• Check-in je možný od 14:00</li>
            <li>• Check-out je do 10:00</li>
            <li>• V prípade otázok nás kontaktujte</li>
          </ul>
        </div>

        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => router.push('/')}>
            Späť na hlavnú stránku
          </Button>
          <Button onClick={() => router.push(`/booking/confirmation/${bookingData.bookingId}`)}>
            Zobraziť rezerváciu
          </Button>
        </div>
      </div>
    </div>
  );
}


