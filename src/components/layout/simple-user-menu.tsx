'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { User, Settings, Calendar, LogOut, Star } from 'lucide-react'
import { signOut } from 'next-auth/react'

interface SimpleUserMenuProps {
  isLoggedIn: boolean
  userName?: string | null
  userEmail?: string | null
  userImage?: string | null
}

/**
 * Simple user menu without Radix UI DropdownMenu
 * Pure HTML/CSS/Tailwind - NO hydration issues
 */
export function SimpleUserMenu({ isLoggedIn, userName, userEmail, userImage }: SimpleUserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
    return undefined;
  }, [isOpen])

  if (!isLoggedIn) {
    return (
      <div className="flex items-center space-x-2">
        <Link
          href="/auth/signin"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          Prihlásenie
        </Link>
        <Link
          href="/auth/signup"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium bg-brand-accent hover:bg-brand-accent-dark text-white rounded-md transition-colors"
        >
          Registrácia
        </Link>
      </div>
    )
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).filter(Boolean).join('').toUpperCase()
    }
    return email.charAt(0).toUpperCase()
  }

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2"
      >
        {userImage ? (
          <Image
            src={userImage}
            alt={userName || userEmail || ''}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-brand-accent flex items-center justify-center text-white font-semibold">
            {getInitials(userName || null, userEmail || '')}
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            {/* User Info */}
            <div className="px-4 py-3 border-b">
              <p className="text-sm font-medium text-gray-900">
                {userName || 'Nepomenovaný používateľ'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userEmail}
              </p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  <Star className="h-3 w-3 mr-1" />
                  5% zľava
                </span>
              </div>
            </div>

            {/* Menu Items */}
            <Link
              href="/account/dashboard"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User className="mr-2 h-4 w-4" />
              Môj účet
            </Link>

            <Link
              href="/account/bookings"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Moje rezervácie
            </Link>

            <Link
              href="/account/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Nastavenia
            </Link>

            <div className="border-t my-1"></div>

            <button
              onClick={() => {
                setIsOpen(false)
                signOut({ callbackUrl: '/' })
              }}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Odhlásiť sa
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
