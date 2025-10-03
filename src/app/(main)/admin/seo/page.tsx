/**
 * Admin SEO Management Page
 */

import type { Metadata } from 'next'
import { SeoManager } from '@/components/admin/seo-manager'

export const metadata: Metadata = {
  title: 'SEO Management - Admin',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminSeoPage() {
  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">SEO Management</h1>
        <p className="text-muted-foreground">
          Spravujte SEO metadata pre všetky stránky webu
        </p>
      </div>

      <SeoManager />
    </div>
  )
}

