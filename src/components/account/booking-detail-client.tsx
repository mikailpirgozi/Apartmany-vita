'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Loader2,
  Calendar,
  Users,
  Euro,
  MapPin,
  Phone,
  Mail,
  FileText,
  ArrowLeft,
  XCircle,
  AlertCircle,
  RefreshCw,
  Star
} from 'lucide-react';
import { Decimal } from '@prisma/client/runtime/library';
import AddReviewDialog from './add-review-dialog';

interface Booking {
  id: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  children: number;
  totalPrice: number | Decimal;
  discount: number | Decimal;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests: string | null;
  needsInvoice: boolean;
  companyName: string | null;
  companyId: string | null;
  companyVat: string | null;
  companyAddress: string | null;
  apartment: {
    id: string;
    name: string;
    slug: string;
    description: string;
    images: string[];
    floor: number;
    size: number;
    maxGuests: number;
    amenities: string[];
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

interface BookingMeta {
  daysUntilCheckIn: number;
  canCancel: boolean;
  canReview: boolean;
}

interface BookingDetailClientProps {
  bookingId: string;
  userId: string;
}

const toNumber = (value: number | Decimal): number => {
  return typeof value === 'number' ? value : value.toNumber();
};

export function BookingDetailClient({ bookingId }: BookingDetailClientProps) {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [meta, setMeta] = useState<BookingMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  const fetchBooking = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Rezervácia nebola nájdená');
        }
        throw new Error('Nepodarilo sa načítať rezerváciu');
      }

      const data = await response.json();
      
      // Convert date strings to Date objects
      const bookingWithDates = {
        ...data.booking,
        checkIn: new Date(data.booking.checkIn),
        checkOut: new Date(data.booking.checkOut),
        createdAt: new Date(data.booking.createdAt)
      };

      setBooking(bookingWithDates);
      setMeta(data.meta);
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError(err instanceof Error ? err.message : 'Nepodarilo sa načítať rezerváciu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const handleCancelBooking = async () => {
    setIsCancelling(true);
    
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Nepodarilo sa zrušiť rezerváciu');
      }

      // Refresh booking data
      await fetchBooking();
      setShowCancelDialog(false);
      
      // Show success message (you could add a toast notification here)
      alert('Rezervácia bola úspešne zrušená');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert(err instanceof Error ? err.message : 'Nepodarilo sa zrušiť rezerváciu');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleBookAgain = () => {
    if (!booking) return;
    
    // Redirect to apartment page with pre-filled dates
    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + 14); // 2 weeks from now
    
    const nights = Math.ceil((booking.checkOut.getTime() - booking.checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + nights);

    const url = `/apartments/${booking.apartment.slug}?checkIn=${checkInDate.toISOString().split('T')[0]}&checkOut=${checkOutDate.toISOString().split('T')[0]}&guests=${booking.guests}&children=${booking.children}`;
    router.push(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Čaká na potvrdenie';
      case 'CONFIRMED':
        return 'Potvrdené';
      case 'CANCELLED':
        return 'Zrušené';
      case 'COMPLETED':
        return 'Dokončené';
      default:
        return status;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('sk-SK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateNights = (checkIn: Date, checkOut: Date) => {
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Načítavam rezerváciu...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Rezervácia nebola nájdená'}</AlertDescription>
        </Alert>
        <Button asChild className="mt-4">
          <Link href="/account/bookings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Späť na rezervácie
          </Link>
        </Button>
      </div>
    );
  }

  const nights = calculateNights(booking.checkIn, booking.checkOut);
  const discount = toNumber(booking.discount);

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/account/bookings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Späť na rezervácie
          </Link>
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Detail rezervácie</h1>
            <p className="text-muted-foreground">
              Rezervácia #{booking.id.slice(-8)}
            </p>
          </div>
          <Badge className={getStatusColor(booking.status)}>
            {getStatusText(booking.status)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Apartment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Apartmán</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="relative w-full md:w-64 h-48 rounded-lg overflow-hidden">
                  <Image
                    src={booking.apartment.images[0] || '/placeholder-apartment.jpg'}
                    alt={booking.apartment.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{booking.apartment.name}</h3>
                  <p className="text-muted-foreground mb-4">{booking.apartment.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Poschodie:</span>
                      <span className="ml-2 font-medium">{booking.apartment.floor}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Veľkosť:</span>
                      <span className="ml-2 font-medium">{booking.apartment.size} m²</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Kapacita:</span>
                      <span className="ml-2 font-medium">{booking.apartment.maxGuests} hostí</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detaily rezervácie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium">Príchod</p>
                    <p className="text-muted-foreground">{formatDate(booking.checkIn)}</p>
                    <p className="text-sm text-muted-foreground">od 14:00</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium">Odchod</p>
                    <p className="text-muted-foreground">{formatDate(booking.checkOut)}</p>
                    <p className="text-sm text-muted-foreground">do 10:00</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium">Počet hostí</p>
                    <p className="text-muted-foreground">
                      {booking.guests} dospelých
                      {booking.children > 0 && `, ${booking.children} detí`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium">Počet nocí</p>
                    <p className="text-muted-foreground">{nights} {nights === 1 ? 'noc' : nights < 5 ? 'noci' : 'nocí'}</p>
                  </div>
                </div>
              </div>

              {booking.specialRequests && (
                <>
                  <Separator />
                  <div>
                    <p className="font-medium mb-2">Špeciálne požiadavky</p>
                    <p className="text-muted-foreground">{booking.specialRequests}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Guest Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informácie o hosťovi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium">Meno</p>
                    <p className="text-muted-foreground">{booking.guestName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground">{booking.guestEmail}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium">Telefón</p>
                    <p className="text-muted-foreground">{booking.guestPhone}</p>
                  </div>
                </div>
              </div>

              {booking.needsInvoice && (
                <>
                  <Separator />
                  <div>
                    <p className="font-medium mb-3">Fakturačné údaje</p>
                    <div className="space-y-2 text-sm">
                      {booking.companyName && (
                        <div>
                          <span className="text-muted-foreground">Firma:</span>
                          <span className="ml-2">{booking.companyName}</span>
                        </div>
                      )}
                      {booking.companyId && (
                        <div>
                          <span className="text-muted-foreground">IČO:</span>
                          <span className="ml-2">{booking.companyId}</span>
                        </div>
                      )}
                      {booking.companyVat && (
                        <div>
                          <span className="text-muted-foreground">DIČ:</span>
                          <span className="ml-2">{booking.companyVat}</span>
                        </div>
                      )}
                      {booking.companyAddress && (
                        <div>
                          <span className="text-muted-foreground">Adresa:</span>
                          <span className="ml-2">{booking.companyAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Cenové zhrnutie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    €{toNumber(booking.apartment.basePrice)} × {nights} {nights === 1 ? 'noc' : nights < 5 ? 'noci' : 'nocí'}
                  </span>
                  <span>€{(toNumber(booking.apartment.basePrice) * nights).toFixed(0)}</span>
                </div>

                {booking.extras && booking.extras.length > 0 && (
                  <>
                    {booking.extras.map((extra) => (
                      <div key={extra.id} className="flex justify-between">
                        <span className="text-muted-foreground">
                          {extra.name} × {extra.quantity}
                        </span>
                        <span>€{(toNumber(extra.price) * extra.quantity).toFixed(0)}</span>
                      </div>
                    ))}
                  </>
                )}

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Zľava</span>
                    <span>-€{discount.toFixed(0)}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Celkom</span>
                <span className="flex items-center">
                  <Euro className="h-4 w-4 mr-1" />
                  {toNumber(booking.totalPrice).toFixed(0)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Akcie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {meta?.canCancel && (
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => setShowCancelDialog(true)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Zrušiť rezerváciu
                </Button>
              )}

              {meta?.canReview && (
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => setShowReviewDialog(true)}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Pridať hodnotenie
                </Button>
              )}

              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleBookAgain}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Rezervovať znovu
              </Button>

              {meta?.canCancel && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Rezerváciu môžete zrušiť do {meta.daysUntilCheckIn} dní pred príchodom ({meta.daysUntilCheckIn} {meta.daysUntilCheckIn === 1 ? 'deň' : meta.daysUntilCheckIn < 5 ? 'dni' : 'dní'} zostáva)
                  </AlertDescription>
                </Alert>
              )}

              {booking.status === 'CONFIRMED' && meta && meta.daysUntilCheckIn < 7 && meta.daysUntilCheckIn > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Nemôžete zrušiť rezerváciu menej ako 7 dní pred príchodom
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Potrebujete pomoc?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href="tel:+421900123456" className="hover:underline">
                  +421 900 123 456
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href="mailto:info@apartmanvita.sk" className="hover:underline">
                  info@apartmanvita.sk
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>Štúrovo námestie 132/16, 911 01 Trenčín</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zrušiť rezerváciu?</DialogTitle>
            <DialogDescription>
              Naozaj chcete zrušiť túto rezerváciu? Táto akcia sa nedá vrátiť späť.
              {meta && (
                <p className="mt-2 text-sm">
                  Do príchodu ostáva {meta.daysUntilCheckIn} {meta.daysUntilCheckIn === 1 ? 'deň' : meta.daysUntilCheckIn < 5 ? 'dni' : 'dní'}.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCancelDialog(false)}
              disabled={isCancelling}
            >
              Nie, ponechať rezerváciu
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelBooking}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ruším...
                </>
              ) : (
                'Áno, zrušiť rezerváciu'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Review Dialog */}
      {booking && (
        <AddReviewDialog
          open={showReviewDialog}
          onOpenChange={setShowReviewDialog}
          bookingId={booking.id}
          apartmentId={booking.apartment.id}
          apartmentName={booking.apartment.name}
          onReviewAdded={() => {
            setShowReviewDialog(false);
            // Optionally refresh booking data
            fetchBooking();
          }}
        />
      )}
    </div>
  );
}

