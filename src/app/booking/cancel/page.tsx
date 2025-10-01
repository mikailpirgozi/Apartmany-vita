"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function BookingCancelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <XCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Rezervácia zrušená</h1>
          <p className="text-lg text-muted-foreground">
            Proces platby bol zrušený. Žiadne peniaze neboli stiahnuté z vašej karty.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Čo sa stalo?</h2>
            <p className="text-muted-foreground mb-4">
              Zrušili ste proces platby na Stripe stránke. Vaša rezervácia nebola dokončená a žiadne peniaze 
              neboli stiahnuté z vašej karty.
            </p>
            
            {bookingId && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  ID nedokončenej rezervácie: <span className="font-mono">{bookingId}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-2">💡 Chcete to skúsiť znova?</h3>
          <p className="text-sm text-muted-foreground">
            Môžete sa vrátiť späť a dokončiť rezerváciu. Všetky vaše údaje zostali uložené.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => router.push('/')}>
            Späť na hlavnú stránku
          </Button>
          <Button onClick={() => router.back()}>
            Dokončiť rezerváciu
          </Button>
        </div>
      </div>
    </div>
  );
}


