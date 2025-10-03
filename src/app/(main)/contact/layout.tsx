import type { Metadata } from 'next'
import { getSeoMetadata } from '@/services/seo'
import { seoDataToMetadata } from '@/lib/seo-helpers'

/**
 * Generate SEO metadata for contact page
 */
export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getSeoMetadata('contact', 'sk')
  return seoDataToMetadata(seoData)
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
