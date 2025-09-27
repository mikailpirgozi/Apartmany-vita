import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kontakt',
  description: 'Kontaktujte nás pre rezervácie apartmánov v Trenčíne. Sme tu pre vás 24/7.',
  keywords: ['kontakt', 'apartmány Trenčín', 'rezervácia', 'telefón', 'email'],
  openGraph: {
    title: 'Kontakt - Apartmány Vita',
    description: 'Kontaktujte nás pre rezervácie apartmánov v Trenčíne. Sme tu pre vás 24/7.',
  }
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
