'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Phone, Mail, Home } from 'lucide-react'
import { CONTACT_INFO } from '@/constants'
import { fadeInDown, staggerContainer, staggerItem } from '@/lib/animations'
import { UserMenu } from './user-menu'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

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

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col space-y-4 mt-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-lg font-medium transition-colors hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-4 border-t">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                  <Phone className="h-4 w-4" />
                  <span>{CONTACT_INFO.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                  <Mail className="h-4 w-4" />
                  <span>{CONTACT_INFO.email}</span>
                </div>
                <Button asChild className="w-full">
                  <Link href="/booking" onClick={() => setIsOpen(false)}>
                    Rezervovať
                  </Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  )
}
