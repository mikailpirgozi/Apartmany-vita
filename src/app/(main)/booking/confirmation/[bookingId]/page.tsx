import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { CheckCircle, Calendar, Users, MapPin, Phone, Mail, Download } from 'lucide-react'
import { format } from 'date-fns'
import { sk } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { prisma } from '@/lib/db'

interface BookingConfirmationPageProps {
  params: Promise<{ bookingId: string }>
}

export default async function BookingConfirmationPage({ params }: BookingConfirmationPageProps) {
  return (
    <Suspense fallback={<ConfirmationSkeleton />}>
      <ConfirmationContent bookingId={(await params).bookingId} />
    </Suspense>
  )
}

async function ConfirmationContent({ bookingId }: { bookingId: string }) {
  // Get booking details
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      apartment: true,
      user: true,
      extras: true
    }
  })

  if (!booking) {
    notFound()
  }

  const nights = Math.ceil((booking.checkOut.getTime() - booking.checkIn.getTime()) / (1000 * 60 * 60 * 24))
  const extrasTotal = booking.extras.reduce((sum, extra) => sum + Number(extra.price) * extra.quantity, 0)

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-green-600 mb-2">
          Rezervácia potvrdená!
        </h1>
        <p className="text-muted-foreground text-lg">
          Ďakujeme za vašu rezerváciu. Potvrdenie sme vám poslali na email.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Detaily rezervácie</CardTitle>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {booking.status === 'CONFIRMED' ? 'Potvrdené' : 'Čaká na potvrdenie'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    Apartmán
                  </div>
                  <p className="font-medium">{booking.apartment.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.apartment.size}m² • {booking.apartment.floor}. poschodie
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    Hostia
                  </div>
                  <p className="font-medium">
                    {booking.guests} dospalý{booking.guests !== 1 ? 'ch' : ''}
                    {booking.children > 0 && `, ${booking.children} dieťa${booking.children > 1 ? 'ť' : ''}`}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    Príchod
                  </div>
                  <p className="font-medium">
                    {format(booking.checkIn, 'EEEE, d. MMMM yyyy', { locale: sk })}
                  </p>
                  <p className="text-sm text-muted-foreground">od 15:00</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    Odchod
                  </div>
                  <p className="font-medium">
                    {format(booking.checkOut, 'EEEE, d. MMMM yyyy', { locale: sk })}
                  </p>
                  <p className="text-sm text-muted-foreground">do 11:00</p>
                </div>
              </div>

              {booking.specialRequests && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Špeciálne požiadavky</p>
                  <p className="text-sm bg-muted p-3 rounded-lg">{booking.specialRequests}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Guest Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informácie o hosťovi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Meno</p>
                  <p className="font-medium">{booking.guestName}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </div>
                  <p className="font-medium">{booking.guestEmail}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 mr-2" />
                    Telefón
                  </div>
                  <p className="font-medium">{booking.guestPhone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Extra Services */}
          {booking.extras.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Extra služby</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {booking.extras.map((extra) => (
                    <div key={extra.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{extra.name}</p>
                        {extra.quantity > 1 && (
                          <p className="text-sm text-muted-foreground">
                            Množstvo: {extra.quantity}
                          </p>
                        )}
                      </div>
                      <p className="font-medium">
                        €{(Number(extra.price) * extra.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Important Information */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Dôležité informácie:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Potvrdenie rezervácie sme vám poslali na email {booking.guestEmail}</li>
                <li>• Prístupové kódy dostanete 24 hodín pred príchodom</li>
                <li>• Pri príchode sa prosím ohlaste na recepcii</li>
                <li>• Bezplatné zrušenie do 24 hodín pred príchodom</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        {/* Booking Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Súhrn platby</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Ubytovanie ({nights} noc{nights > 1 ? 'í' : ''})</span>
                  <span>€{(Number(booking.totalPrice) - Number(booking.discount) - extrasTotal).toFixed(2)}</span>
                </div>
                
                {Number(booking.discount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Zľava</span>
                    <span>-€{Number(booking.discount).toFixed(2)}</span>
                  </div>
                )}

                {booking.extras.map((extra) => (
                  <div key={extra.id} className="flex justify-between">
                    <span>{extra.name} {extra.quantity > 1 && `(${extra.quantity}x)`}</span>
                    <span>€{(Number(extra.price) * extra.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex justify-between font-semibold text-lg">
                <span>Celkom zaplatené</span>
                <span>€{Number(booking.totalPrice).toFixed(2)}</span>
              </div>

              <div className="space-y-2 pt-4">
                <Button className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Stiahnuť faktúru
                </Button>
                
                <Button 
                  className="w-full" 
                  onClick={() => window.location.href = '/account/dashboard'}
                >
                  Zobraziť všetky rezervácie
                </Button>
              </div>

              <div className="text-xs text-muted-foreground pt-4">
                <p><strong>Číslo rezervácie:</strong> {booking.id.slice(-8).toUpperCase()}</p>
                <p><strong>Dátum rezervácie:</strong> {format(booking.createdAt, 'd.M.yyyy HH:mm', { locale: sk })}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  )
}

function ConfirmationSkeleton() {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
        <Skeleton className="h-8 w-64 mx-auto mb-2" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
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
  )
}
