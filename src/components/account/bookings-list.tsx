'use client'

import Image from 'next/image'
import Link from 'next/link'
// Removed date-fns imports to prevent hydration issues
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Users, Euro, Eye } from 'lucide-react'

import { Decimal } from '@prisma/client/runtime/library'

interface Booking {
  id: string
  checkIn: Date
  checkOut: Date
  guests: number
  children: number
  totalPrice: number | Decimal
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  apartment: {
    name: string
    images: string[]
  }
  createdAt: Date
}

interface BookingsListProps {
  bookings: Booking[]
}

// Helper function to safely convert to number (handles already-converted values)
const toNumber = (value: number | Decimal): number => {
  if (typeof value === 'number') return value;
  // If it's a Decimal object with toNumber method
  if (value && typeof value === 'object' && 'toNumber' in value && typeof value.toNumber === 'function') {
    return value.toNumber();
  }
  // If it's already serialized (plain object or string), parse it
  return typeof value === 'string' ? parseFloat(value) : Number(value);
}

export function BookingsList({ bookings }: BookingsListProps) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Žiadne rezervácie</h3>
        <p className="text-muted-foreground mb-6">
          Zatiaľ ste nevytvorili žiadnu rezerváciu
        </p>
        <Button asChild>
          <Link href="/apartments">
            Prehliadnuť apartmány
          </Link>
        </Button>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Čaká na potvrdenie'
      case 'CONFIRMED':
        return 'Potvrdené'
      case 'CANCELLED':
        return 'Zrušené'
      case 'COMPLETED':
        return 'Dokončené'
      default:
        return status
    }
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Apartment Image */}
              <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden">
                <Image
                  src={booking.apartment.images[0] || '/placeholder-apartment.jpg'}
                  alt={booking.apartment.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Booking Details */}
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{booking.apartment.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Rezervácia #{booking.id.slice(-8)}
                    </p>
                  </div>
                  <Badge className={getStatusColor(booking.status)}>
                    {getStatusText(booking.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {booking.checkIn?.toISOString().split('T')[0]?.split('-').reverse().join('.') || 'N/A'}
                      </p>
                      <p className="text-muted-foreground">Príchod</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {booking.checkOut?.toISOString().split('T')[0]?.split('-').reverse().join('.') || 'N/A'}
                      </p>
                      <p className="text-muted-foreground">Odchod</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {booking.guests + booking.children} hostí
                      </p>
                      <p className="text-muted-foreground">
                        {booking.guests} dospelí{booking.children > 0 && `, ${booking.children} deti`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-lg">
                      €{toNumber(booking.totalPrice).toFixed(0)}
                    </span>
                    <span className="text-muted-foreground text-sm">celkom</span>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/account/bookings/${booking.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Detail
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
