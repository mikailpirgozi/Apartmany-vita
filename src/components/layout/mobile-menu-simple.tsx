'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, Phone, Mail, Home, LogIn, UserPlus } from 'lucide-react'
import { CONTACT_INFO } from '@/constants'
import { useSessionHydrationSafe } from '@/hooks/use-session-hydration-safe'

interface MobileMenuSimpleProps {
  navigation: Array<{ name: string; href: string }>
}

/**
 * Simple mobile menu without Sheet component
 * Direct DOM rendering for better control and reliability
 */
export function MobileMenuSimple({ navigation }: MobileMenuSimpleProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSessionHydrationSafe()

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="md:hidden touch-manipulation active:scale-95 transition-transform"
        data-testid="mobile-menu-button"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Overlay + Panel */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          {/* Backdrop Overlay */}
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Sliding Panel */}
          <div
            className="absolute inset-y-0 right-0 w-[85vw] max-w-[400px] bg-background shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-muted/80 hover:bg-muted transition-colors touch-manipulation"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Header */}
            <div className="px-6 py-6 border-b bg-muted/30">
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
            <div className="flex-1 px-6 py-6 overflow-y-auto">
              <nav className="flex flex-col space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-base font-medium py-4 px-4 rounded-lg transition-all duration-200 hover:bg-brand-accent/10 hover:text-brand-accent active:scale-95 active:bg-brand-accent/20 touch-manipulation min-h-[48px] flex items-center"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* Auth Section */}
                <div className="pt-4 mt-4 border-t border-muted">
                  {session ? (
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
                        className="flex items-center space-x-3 text-base font-medium py-4 px-4 rounded-lg transition-all duration-200 hover:bg-brand-accent/10 hover:text-brand-accent active:scale-95 active:bg-brand-accent/20 touch-manipulation min-h-[48px]"
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
                        className="flex items-center space-x-3 text-base font-medium py-4 px-4 rounded-lg transition-all duration-200 hover:bg-brand-accent/10 hover:text-brand-accent active:scale-95 active:bg-brand-accent/20 touch-manipulation min-h-[48px]"
                        onClick={() => setIsOpen(false)}
                      >
                        <LogIn className="h-4 w-4" />
                        <span>Prihlásenie</span>
                      </Link>
                      <Link
                        href="/auth/signup"
                        className="flex items-center space-x-3 text-base font-medium py-4 px-4 rounded-lg transition-all duration-200 hover:bg-brand-accent/10 hover:text-brand-accent active:scale-95 active:bg-brand-accent/20 touch-manipulation min-h-[48px]"
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

                <Button asChild className="w-full bg-brand-accent hover:bg-brand-accent-dark text-white font-semibold py-3 rounded-lg shadow-lg touch-manipulation min-h-[48px]">
                  <Link href="/booking" onClick={() => setIsOpen(false)}>
                    Rezervovať
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

