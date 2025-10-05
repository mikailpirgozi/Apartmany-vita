'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Home } from 'lucide-react'
import { SimpleMobileMenu } from './simple-mobile-menu'
import { SimpleUserMenu } from './simple-user-menu'

/**
 * Simple header without Framer Motion or Radix UI
 * Pure HTML/CSS/Tailwind - NO hydration issues, 100% reliable
 */
export function SimpleHeader() {
  const { data: session } = useSession()

  const navigation = [
    { name: 'Domov', href: '/' },
    { name: 'Apartmány', href: '/apartments' },
    { name: 'Okolie', href: '/okolie' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Kontakt', href: '/contact' },
  ]

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-brand-accent relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-accent transition-all group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/apartments"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium bg-brand-accent hover:bg-brand-accent-dark text-white rounded-md transition-colors"
            >
              Rezervovať
            </Link>
            <SimpleUserMenu
              isLoggedIn={!!session}
              userName={session?.user?.name}
              userEmail={session?.user?.email}
              userImage={session?.user?.image}
            />
          </div>

          {/* Mobile Menu Button - only button stays in header */}
          <SimpleMobileMenu
            navigation={navigation}
            isLoggedIn={!!session}
            userName={session?.user?.name}
            userEmail={session?.user?.email}
          />
        </div>
      </header>
      
      {/* Mobile Menu Portal - renders OUTSIDE header at body level */}
      {/* This is handled inside SimpleMobileMenu component */}
    </>
  )
}
