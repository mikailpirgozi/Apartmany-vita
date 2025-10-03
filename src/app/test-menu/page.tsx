'use client'

import { MobileMenuSimple } from '@/components/layout/mobile-menu-simple'

export default function TestMenuPage() {
  const navigation = [
    { name: 'Domov', href: '/' },
    { name: 'Apartmány', href: '/apartments' },
    { name: 'Kontakt', href: '/contact' },
  ]

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold">Test Mobile Menu</h1>
        <p className="text-muted-foreground">Klikni na menu ikonu nižšie:</p>
        
        <div className="border p-4 rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <span>Hamburger menu:</span>
            <MobileMenuSimple navigation={navigation} />
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <h2 className="font-semibold mb-2">Čo by sa malo stať:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Klikneš na ☰ ikonu</li>
            <li>Objaví sa tmavé pozadie</li>
            <li>Biely panel vyslizne sprava</li>
            <li>Vidíš menu položky</li>
            <li>X tlačidlo zavrie menu</li>
          </ul>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-mono bg-muted p-2 rounded">
            Component: mobile-menu-simple.tsx
          </p>
          <p className="text-sm font-mono bg-muted p-2 rounded">
            Test URL: /test-menu
          </p>
        </div>
      </div>
    </div>
  )
}

