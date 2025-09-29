'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, Phone, Mail, Home, LogIn, UserPlus, X } from 'lucide-react'
import { CONTACT_INFO } from '@/constants'

interface SimpleMobileMenuProps {
  navigation: Array<{ name: string; href: string }>
  isLoggedIn?: boolean
  userName?: string | null
  userEmail?: string | null
}

/**
 * Simple mobile menu without Radix UI
 * Pure HTML/CSS/Tailwind - NO hydration issues
 */
export function SimpleMobileMenu({ navigation, isLoggedIn, userName, userEmail }: SimpleMobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-accent"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slideout Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] sm:w-[320px] bg-background shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-brand-accent text-white">
                <Home className="h-5 w-5" />
              </div>
              <div className="font-bold text-lg bg-gradient-to-r from-brand-accent to-brand-accent-dark bg-clip-text text-transparent">
                Apartmány Vita
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-accent"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-6 py-6 overflow-y-auto">
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
                {isLoggedIn ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 py-2 px-4 rounded-lg bg-muted/50">
                      <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {userName?.[0] || userEmail?.[0] || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{userName || 'Používateľ'}</p>
                        <p className="text-xs text-muted-foreground">{userEmail}</p>
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
              
              <Link
                href="/booking"
                onClick={() => setIsOpen(false)}
                className="w-full inline-flex items-center justify-center bg-brand-accent hover:bg-brand-accent-dark text-white font-semibold py-3 rounded-lg shadow-lg transition-colors"
              >
                Rezervovať
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
