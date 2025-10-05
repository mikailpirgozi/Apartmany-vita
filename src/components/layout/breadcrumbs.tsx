'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { BreadcrumbStructuredData } from '@/components/seo/structured-data'

export interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

/**
 * Breadcrumbs navigation component with structured data for SEO
 * Improves user navigation and search engine understanding of site structure
 */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Add home as first item
  const allItems: BreadcrumbItem[] = [
    { name: 'Domov', url: 'https://apartmanvita.sk' },
    ...items,
  ]

  return (
    <>
      {/* Structured Data for SEO */}
      <BreadcrumbStructuredData items={allItems} />

      {/* Visual Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <li>
            <Link 
              href="/" 
              className="hover:text-foreground transition-colors flex items-center gap-1"
              aria-label="Domov"
            >
              <Home className="h-4 w-4" />
              <span className="sr-only">Domov</span>
            </Link>
          </li>
          
          {items.map((item, index) => {
            const isLast = index === items.length - 1
            
            return (
              <li key={index} className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4" />
                {isLast ? (
                  <span className="text-foreground font-medium" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link 
                    href={item.url.replace('https://apartmanvita.sk', '')} 
                    className="hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
