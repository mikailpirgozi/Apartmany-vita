'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Separator } from '@/components/ui/separator'
import { Phone, Mail, MapPin, Facebook, Instagram, Heart } from 'lucide-react'
import { CONTACT_INFO, SOCIAL_LINKS, APP_NAME } from '@/constants'
import { staggerContainer, staggerItem } from '@/lib/animations'

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <motion.div 
        className="container py-12"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <motion.div className="space-y-4" variants={staggerItem}>
            <h3 className="font-bold text-lg text-brand-accent">{APP_NAME}</h3>
            <p className="text-sm text-muted-foreground">
              Luxusné apartmány v centre Trenčína. Dokonalé ubytovanie pre váš pobyt.
            </p>
            <div className="flex space-x-4">
              <Link
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-brand-accent transition-colors transform hover:scale-110"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-brand-accent transition-colors transform hover:scale-110"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div className="space-y-4" variants={staggerItem}>
            <h4 className="font-semibold text-brand-accent">Rýchle odkazy</h4>
            <nav className="flex flex-col space-y-2">
              <Link
                href="/apartments"
                className="text-sm text-muted-foreground hover:text-brand-accent transition-colors"
              >
                Naše apartmány
              </Link>
              <Link
                href="/booking"
                className="text-sm text-muted-foreground hover:text-brand-accent transition-colors"
              >
                Rezervácia
              </Link>
              <Link
                href="/contact"
                className="text-sm text-muted-foreground hover:text-brand-accent transition-colors"
              >
                Kontakt
              </Link>
              <Link
                href="/about"
                className="text-sm text-muted-foreground hover:text-brand-accent transition-colors"
              >
                O nás
              </Link>
            </nav>
          </motion.div>

          {/* Legal */}
          <motion.div className="space-y-4" variants={staggerItem}>
            <h4 className="font-semibold text-brand-accent">Právne informácie</h4>
            <nav className="flex flex-col space-y-2">
              <Link
                href="/terms-of-service"
                className="text-sm text-muted-foreground hover:text-brand-accent transition-colors"
              >
                Obchodné podmienky
              </Link>
              <Link
                href="/privacy-policy"
                className="text-sm text-muted-foreground hover:text-brand-accent transition-colors"
              >
                Ochrana osobných údajov
              </Link>
            </nav>
          </motion.div>

          {/* Contact Info */}
          <motion.div className="space-y-4" variants={staggerItem} data-testid="footer-contact">
            <h4 className="font-semibold text-brand-accent">Kontakt</h4>
            <div className="space-y-3" data-testid="footer-address">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-0.5 text-brand-accent" />
                <div className="text-sm text-muted-foreground">
                  <div>{CONTACT_INFO.address.street}</div>
                  <div>{CONTACT_INFO.address.postalCode} {CONTACT_INFO.address.city}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-brand-accent" />
                <Link
                  href={`tel:${CONTACT_INFO.phone}`}
                  className="text-sm text-muted-foreground hover:text-brand-accent transition-colors"
                >
                  {CONTACT_INFO.phone}
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-brand-accent" />
                <Link
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="text-sm text-muted-foreground hover:text-brand-accent transition-colors"
                >
                  {CONTACT_INFO.email}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        <Separator className="my-8" />

        <motion.div 
          className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
          variants={staggerItem}
          suppressHydrationWarning
        >
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground" suppressHydrationWarning>
              © {new Date().getFullYear()} {APP_NAME}. Všetky práva vyhradené.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              P2 invest s.r.o. | IČO: 47992701 | IČ DPH: SK2120035951
            </p>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Vytvorené s <Heart className="h-4 w-4 text-red-500 animate-pulse" /> pre najlepší pobyt v Trenčíne
          </p>
        </motion.div>
      </motion.div>
    </footer>
  )
}
