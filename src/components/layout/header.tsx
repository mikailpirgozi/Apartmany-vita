'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Phone, Home } from 'lucide-react'
import { CONTACT_INFO } from '@/constants'
import { fadeInDown, staggerContainer, staggerItem } from '@/lib/animations'

// Dynamic imports to prevent hydration errors (client-only components)
const UserMenu = dynamic(() => import('./user-menu').then(mod => ({ default: mod.UserMenu })), {
  ssr: false,
  loading: () => <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
})

const MobileMenu = dynamic(() => import('./mobile-menu').then(mod => ({ default: mod.MobileMenu })), {
  ssr: false,
  loading: () => null // No loading state needed for mobile menu
})

export function Header() {

  const navigation = [
    { name: 'Domov', href: '/' },
    { name: 'Apartmány', href: '/apartments' },
    { name: 'Rezervácia', href: '/booking' },
    { name: 'Kontakt', href: '/contact' },
  ]

  return (
    <motion.header 
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      initial="initial"
      animate="animate"
      variants={fadeInDown}
      suppressHydrationWarning
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <motion.div variants={staggerItem}>
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-brand-accent text-white group-hover:bg-brand-accent-dark transition-colors">
                <Home className="h-5 w-5" />
              </div>
              <div className="font-bold text-xl bg-gradient-to-r from-brand-accent to-brand-accent-dark bg-clip-text text-transparent">
                Apartmány Vita
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <motion.nav 
          className="hidden md:flex items-center space-x-6"
          variants={staggerContainer}
        >
          {navigation.map((item) => (
            <motion.div key={item.name} variants={staggerItem}>
              <Link
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-brand-accent relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-accent transition-all group-hover:w-full"></span>
              </Link>
            </motion.div>
          ))}
        </motion.nav>

        {/* Desktop Actions */}
        <motion.div 
          className="hidden md:flex items-center space-x-4"
          variants={staggerItem}
        >
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4 text-brand-accent" />
            <span>{CONTACT_INFO.phone}</span>
          </div>
          <Button asChild className="bg-brand-accent hover:bg-brand-accent-dark">
            <Link href="/apartments">Rezervovať</Link>
          </Button>
          <UserMenu />
        </motion.div>

        {/* Mobile Menu - Separate client-only component */}
        <MobileMenu navigation={navigation} />
      </div>
    </motion.header>
  )
}
