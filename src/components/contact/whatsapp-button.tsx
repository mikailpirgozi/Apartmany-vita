'use client'

import { Button } from '@/components/ui/button'
import { MessageCircle, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WhatsAppButtonProps {
  message?: string
  phoneNumber?: string
  variant?: 'floating' | 'inline' | 'compact'
  className?: string
}

export function WhatsAppButton({ 
  message, 
  phoneNumber = '421940728676',
  variant = 'floating',
  className 
}: WhatsAppButtonProps) {
  const handleWhatsAppClick = () => {
    const defaultMessage = message || 'Ahoj! Mám záujem o apartmány Vita v Trenčíne.'
    const encodedMessage = encodeURIComponent(defaultMessage)
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    
    // Track WhatsApp click event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'whatsapp_click', {
        event_category: 'contact',
        event_label: 'whatsapp_button'
      })
    }
    
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  if (variant === 'floating') {
    return (
      <Button
        onClick={handleWhatsAppClick}
        className={cn(
          "fixed bottom-24 right-6 z-40 bg-green-500 hover:bg-green-600 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200",
          className
        )}
        aria-label="Kontaktovať cez WhatsApp"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    )
  }

  if (variant === 'compact') {
    return (
      <Button
        onClick={handleWhatsAppClick}
        size="sm"
        className={cn(
          "bg-green-500 hover:bg-green-600 text-white gap-2",
          className
        )}
      >
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </Button>
    )
  }

  return (
    <Button
      onClick={handleWhatsAppClick}
      className={cn(
        "bg-green-500 hover:bg-green-600 text-white gap-2",
        className
      )}
    >
      <MessageCircle className="h-5 w-5" />
      Kontaktovať cez WhatsApp
    </Button>
  )
}

interface BookingWhatsAppButtonProps {
  apartmentName: string
  checkIn?: string
  checkOut?: string
  guests?: number
  phoneNumber?: string
}

export function BookingWhatsAppButton({
  apartmentName,
  checkIn,
  checkOut,
  guests,
  phoneNumber = '421900123456'
}: BookingWhatsAppButtonProps) {
  const generateBookingMessage = () => {
    let message = `Ahoj! Mám záujem o rezerváciu apartmánu "${apartmentName}"`
    
    if (checkIn && checkOut) {
      message += ` od ${checkIn} do ${checkOut}`
    }
    
    if (guests) {
      message += ` pre ${guests} ${guests === 1 ? 'osobu' : guests < 5 ? 'osoby' : 'osôb'}`
    }
    
    message += '. Môžete mi prosím poslať viac informácií o dostupnosti a cene?'
    
    return message
  }

  return (
    <WhatsAppButton
      message={generateBookingMessage()}
      phoneNumber={phoneNumber}
      variant="inline"
    />
  )
}

interface ContactWhatsAppButtonProps {
  subject?: 'booking' | 'info' | 'support' | 'complaint'
  phoneNumber?: string
}

export function ContactWhatsAppButton({
  subject = 'info',
  phoneNumber = '421900123456'
}: ContactWhatsAppButtonProps) {
  const messages = {
    booking: 'Ahoj! Chcel by som si rezervovať apartmán v Apartmánoch Vita. Môžete mi pomôcť?',
    info: 'Ahoj! Potrebujem informácie o Apartmánoch Vita. Môžete mi pomôcť?',
    support: 'Ahoj! Potrebujem pomoc s mojou rezerváciou v Apartmánoch Vita.',
    complaint: 'Ahoj! Chcel by som podať sťažnosť týkajúcu sa môjho pobytu v Apartmánoch Vita.'
  }

  return (
    <WhatsAppButton
      message={messages[subject]}
      phoneNumber={phoneNumber}
      variant="inline"
    />
  )
}

export function WhatsAppFloatingButtons() {
  return (
    <>
      <WhatsAppButton variant="floating" />
      {/* Phone button as alternative */}
      <Button
        onClick={() => window.open('tel:+421940728676', '_self')}
        className="fixed bottom-40 right-6 z-40 bg-blue-500 hover:bg-blue-600 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200"
        aria-label="Zavolať"
      >
        <Phone className="h-6 w-6 text-white" />
      </Button>
    </>
  )
}
