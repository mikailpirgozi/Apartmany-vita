'use client'

import { useState, useEffect } from 'react';
import { BookingsList } from '@/components/account/bookings-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { Decimal } from '@prisma/client/runtime/library';

interface Booking {
  id: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  children: number;
  totalPrice: number | Decimal;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  apartment: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    basePrice: number | Decimal;
  };
  extras?: Array<{
    id: string;
    name: string;
    price: number | Decimal;
    quantity: number;
  }>;
  createdAt: Date;
}

// interface BookingsPageClientProps {
//   userId: string;
// }

type TabValue = 'upcoming' | 'past' | 'cancelled';

export function BookingsPageClient() {
  const [activeTab, setActiveTab] = useState<TabValue>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async (status: TabValue) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/bookings?status=${status}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      
      // Convert date strings to Date objects
      const bookingsWithDates = data.bookings.map((booking: Record<string, unknown>) => ({
        ...booking,
        checkIn: new Date(booking.checkIn as string),
        checkOut: new Date(booking.checkOut as string),
        createdAt: new Date(booking.createdAt as string)
      }));

      setBookings(bookingsWithDates);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Nepodarilo sa načítať rezervácie. Skúste to prosím neskôr.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(activeTab);
  }, [activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabValue);
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Moje rezervácie</h1>
        <p className="text-muted-foreground">
          Prehľad všetkých vašich rezervácií apartmánov
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="upcoming">
            Nadchádzajúce
          </TabsTrigger>
          <TabsTrigger value="past">
            Minulé
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Zrušené
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {isLoading ? (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Načítavam rezervácie...</p>
              </div>
            </Card>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <BookingsList bookings={bookings} />
          )}
        </TabsContent>

        <TabsContent value="past">
          {isLoading ? (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Načítavam rezervácie...</p>
              </div>
            </Card>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <BookingsList bookings={bookings} />
          )}
        </TabsContent>

        <TabsContent value="cancelled">
          {isLoading ? (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Načítavam rezervácie...</p>
              </div>
            </Card>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <BookingsList bookings={bookings} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

