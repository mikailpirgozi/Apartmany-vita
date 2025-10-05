'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { WhatsAppButton } from '@/components/contact/whatsapp-button'
import { CONTACT_INFO, SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/constants'
import { staggerContainer, staggerItem } from '@/lib/animations'
import { useToast } from '@/hooks/use-toast'

interface ContactFormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Správa odoslaná!",
          description: SUCCESS_MESSAGES.MESSAGE_SENT,
        })
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        })
      } else {
        throw new Error('Failed to send message')
      }
    } catch {
      toast({
        title: "Chyba",
        description: ERROR_MESSAGES.GENERIC,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container py-12">
        <motion.div
          className="max-w-6xl mx-auto"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Header */}
          <motion.div className="text-center mb-12" variants={staggerItem}>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Kontaktujte nás
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Máte otázky o našich apartmánoch? Radi vám pomôžeme s rezerváciou 
              alebo poskytneme ďalšie informácie.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div variants={staggerItem}>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Send className="h-6 w-6 text-brand-accent" />
                    Napíšte nám
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Meno a priezvisko *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Vaše meno"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="vas@email.sk"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefón</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+421 940 728 676"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Predmet *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        placeholder="Rezervácia apartmánu / Otázka / Informácie"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Správa *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        placeholder="Opíšte vašu požiadavku alebo otázku..."
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-brand-accent hover:bg-brand-accent/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Odosielam...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Odoslať správu
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information */}
            <motion.div className="space-y-6" variants={staggerItem}>
              {/* Contact Details */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Kontaktné informácie</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <MapPin className="h-6 w-6 text-brand-accent mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Adresa</h3>
                      <p className="text-muted-foreground">
                        {CONTACT_INFO.address.street}<br />
                        {CONTACT_INFO.address.postalCode} {CONTACT_INFO.address.city}<br />
                        {CONTACT_INFO.address.country}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Phone className="h-6 w-6 text-brand-accent mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Telefón</h3>
                      <a 
                        href={`tel:${CONTACT_INFO.phone}`}
                        className="text-brand-accent hover:underline"
                      >
                        {CONTACT_INFO.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Mail className="h-6 w-6 text-brand-accent mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <a 
                        href={`mailto:${CONTACT_INFO.email}`}
                        className="text-brand-accent hover:underline"
                      >
                        {CONTACT_INFO.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Clock className="h-6 w-6 text-brand-accent mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Otváracie hodiny</h3>
                      <div className="text-muted-foreground space-y-1">
                        <p>Pondelok - Piatok: 9:00 - 18:00</p>
                        <p>Sobota - Nedeľa: 10:00 - 16:00</p>
                        <p className="text-sm text-brand-accent">
                          Check-in: 15:00 | Check-out: 11:00
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Contact Options */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Rýchly kontakt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <WhatsAppButton 
                    variant="inline"
                    message="Ahoj! Mám záujem o apartmány Vita v Trenčíne. Môžete mi poskytnúť viac informácií?"
                    className="w-full justify-center"
                  />
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-center"
                    asChild
                  >
                    <a href={`tel:${CONTACT_INFO.phone}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      Zavolať teraz
                    </a>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full justify-center"
                    asChild
                  >
                    <a href={`mailto:${CONTACT_INFO.email}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Napísať email
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Map placeholder */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Naša poloha</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <MapPin className="h-12 w-12 mx-auto mb-2" />
                      <p>Interaktívna mapa</p>
                      <p className="text-sm">Centrum Trenčína</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    Naše apartmány sa nachádzajú v srdci Trenčína, 
                    len pár krokov od Trenčianskeho hradu a hlavných atrakcií.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
