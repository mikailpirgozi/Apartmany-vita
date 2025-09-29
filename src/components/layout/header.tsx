'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Phone, Mail, Home, LogIn, UserPlus } from 'lucide-react'
import { CONTACT_INFO } from '@/constants'
import { fadeInDown, staggerContainer, staggerItem } from '@/lib/animations'
import { UserMenu } from './user-menu'
import { useSessionHydrationSafe } from '@/hooks/use-session-hydration-safe'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { data: session, status, isHydrated } = useSessionHydrationSafe()

  // Prevent hydration mismatch by only rendering Sheet after mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

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

        {/* Mobile Menu - Always render structure, only functionality after mount */}
        <div className="md:hidden">
          {isMounted ? (
            <Sheet open={isOpen} onOpenChange={setIsOpen} modal>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
          <SheetContent side="right" className="w-[280px] sm:w-[320px] md:w-[360px] p-0" suppressHydrationWarning>
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="px-6 py-4 border-b bg-muted/30">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-brand-accent text-white">
                    <Home className="h-5 w-5" />
                  </div>
                  <div className="font-bold text-lg bg-gradient-to-r from-brand-accent to-brand-accent-dark bg-clip-text text-transparent">
                    Apartmány Vita
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex-1 px-6 py-6">
                <nav className="flex flex-col space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-base font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:bg-brand-accent/10 hover:text-brand-accent active:scale-95"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  
                  {/* Auth Section */}
                  <div className="pt-4 mt-4 border-t border-muted">
                    {!isHydrated || status === 'loading' ? (
                      <div className="flex items-center justify-center py-3">
                        <div className="w-6 h-6 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : session ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3 py-2 px-4 rounded-lg bg-muted/50">
                          <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">
                              {session.user?.name?.[0] || session.user?.email?.[0] || 'U'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{session.user?.name || 'Používateľ'}</p>
                            <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                          </div>
                        </div>
                        <Link
                          href="/account/dashboard"
                          className="flex items-center space-x-3 text-base font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:bg-brand-accent/10 hover:text-brand-accent active:scale-95"
                          onClick={() => setIsOpen(false)}
                        >
                          <Home className="h-4 w-4" />
                          <span>Môj účet</span>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Link
                          href="/auth/signin"
                          className="flex items-center space-x-3 text-base font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:bg-brand-accent/10 hover:text-brand-accent active:scale-95"
                          onClick={() => setIsOpen(false)}
                        >
                          <LogIn className="h-4 w-4" />
                          <span>Prihlásenie</span>
                        </Link>
                        <Link
                          href="/auth/signup"
                          className="flex items-center space-x-3 text-base font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:bg-brand-accent/10 hover:text-brand-accent active:scale-95"
                          onClick={() => setIsOpen(false)}
                        >
                          <UserPlus className="h-4 w-4" />
                          <span>Registrácia</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </nav>
              </div>

              {/* Contact & CTA */}
              <div className="px-6 py-6 border-t bg-muted/20">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 text-brand-accent" />
                      <span className="font-medium">{CONTACT_INFO.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 text-brand-accent" />
                      <span className="font-medium">{CONTACT_INFO.email}</span>
                    </div>
                  </div>
                  
                  <Button asChild className="w-full bg-brand-accent hover:bg-brand-accent-dark text-white font-semibold py-3 rounded-lg shadow-lg">
                    <Link href="/booking" onClick={() => setIsOpen(false)}>
                      Rezervovať
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
          ) : (
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  )
}
