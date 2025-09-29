'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Phone, Mail, Home, LogIn, UserPlus } from 'lucide-react'
import { CONTACT_INFO } from '@/constants'
import { useSessionHydrationSafe } from '@/hooks/use-session-hydration-safe'

interface MobileMenuProps {
  navigation: Array<{ name: string; href: string }>
}

/**
 * Mobile menu component - CLIENT-ONLY to prevent hydration mismatch
 * This component is not rendered on server, only after client hydration
 */
export function MobileMenu({ navigation }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSessionHydrationSafe()

  // NOTE: Loaded via dynamic import with ssr: false
  // Component only runs on client, session will be available

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen} modal>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="ghost" size="sm">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] sm:w-[320px] md:w-[360px] p-0">
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
  )
}
