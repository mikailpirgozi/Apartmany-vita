'use client'

import { useState, useEffect } from 'react'
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
 * Fixed z-index hierarchy and body scroll lock with proper positioning
 */
export function SimpleMobileMenu({ navigation, isLoggedIn, userName, userEmail }: SimpleMobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Lock body scroll when menu is open - preserve scroll position
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
    } else {
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
    }

    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
    }
  }, [isOpen])

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

      {/* Full-screen container for overlay + menu - z-[9999] to be above EVERYTHING */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] md:hidden">
          {/* Overlay - darker and more opaque with backdrop blur */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Slideout Menu - solid white background, above overlay */}
          <div
            className="absolute top-0 right-0 h-full w-[280px] sm:w-[320px] bg-white dark:bg-gray-900 shadow-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-brand-accent text-white">
                    <Home className="h-5 w-5" />
                  </div>
                  <div className="font-bold text-lg text-gray-900 dark:text-white">
                    Apartmány Vita
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5 text-gray-900 dark:text-white" />
                </button>
              </div>

              {/* Navigation */}
              <div className="flex-1 px-6 py-6 overflow-y-auto">
                <nav className="flex flex-col space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-base font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:bg-brand-accent/10 hover:text-brand-accent active:scale-95 text-gray-900 dark:text-white"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  
                  {/* Auth Section */}
                  <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                    {isLoggedIn ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3 py-2 px-4 rounded-lg bg-gray-100 dark:bg-gray-800">
                          <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">
                              {userName?.[0] || userEmail?.[0] || 'U'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{userName || 'Používateľ'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{userEmail}</p>
                          </div>
                        </div>
                        <Link
                          href="/account/dashboard"
                          className="flex items-center space-x-3 text-base font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:bg-brand-accent/10 hover:text-brand-accent active:scale-95 text-gray-900 dark:text-white"
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
                          className="flex items-center space-x-3 text-base font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:bg-brand-accent/10 hover:text-brand-accent active:scale-95 text-gray-900 dark:text-white"
                          onClick={() => setIsOpen(false)}
                        >
                          <LogIn className="h-4 w-4" />
                          <span>Prihlásenie</span>
                        </Link>
                        <Link
                          href="/auth/signup"
                          className="flex items-center space-x-3 text-base font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:bg-brand-accent/10 hover:text-brand-accent active:scale-95 text-gray-900 dark:text-white"
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
              <div className="px-6 py-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                      <Phone className="h-4 w-4 text-brand-accent" />
                      <span className="font-medium">{CONTACT_INFO.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
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
      )}
    </div>
  )
}