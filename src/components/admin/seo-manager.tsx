/**
 * SEO Manager Component
 * Admin interface for managing SEO metadata for pages and apartments
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Save, Trash2, Plus, Search } from 'lucide-react'

interface SeoMetadata {
  id: string
  pageSlug: string
  locale: string
  metaTitle: string
  metaDescription: string
  metaKeywords: string[]
  ogTitle?: string | null
  ogDescription?: string | null
  ogImage?: string | null
  ogType: string
  twitterCard: string
  twitterTitle?: string | null
  twitterDescription?: string | null
  twitterImage?: string | null
  canonicalUrl?: string | null
  h1Heading?: string | null
}

interface SeoFormData {
  pageSlug: string
  locale: string
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  h1Heading: string
  canonicalUrl: string
}

const PAGE_SLUGS = ['home', 'apartments', 'contact', 'about', 'booking']
const LOCALES = ['sk', 'en', 'de', 'hu', 'pl']

export function SeoManager() {
  const [seoList, setSeoList] = useState<SeoMetadata[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedItem, setSelectedItem] = useState<SeoMetadata | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState<SeoFormData>({
    pageSlug: 'home',
    locale: 'sk',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    h1Heading: '',
    canonicalUrl: '',
  })

  // Fetch SEO metadata list
  useEffect(() => {
    fetchSeoList()
  }, [])

  const fetchSeoList = async (): Promise<void> => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/seo')
      const result = await response.json()

      if (result.success) {
        setSeoList(result.data)
      } else {
        throw new Error('Failed to fetch SEO list')
      }
    } catch (error) {
      toast({
        title: 'Chyba',
        description: 'Nepodarilo sa načítať SEO dáta',
        variant: 'destructive',
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectItem = (item: SeoMetadata): void => {
    setSelectedItem(item)
    setFormData({
      pageSlug: item.pageSlug,
      locale: item.locale,
      metaTitle: item.metaTitle,
      metaDescription: item.metaDescription,
      metaKeywords: item.metaKeywords.join(', '),
      ogTitle: item.ogTitle || '',
      ogDescription: item.ogDescription || '',
      ogImage: item.ogImage || '',
      h1Heading: item.h1Heading || '',
      canonicalUrl: item.canonicalUrl || '',
    })
  }

  const handleSave = async (): Promise<void> => {
    try {
      setIsSaving(true)

      const payload = {
        ...formData,
        metaKeywords: formData.metaKeywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean),
      }

      const response = await fetch('/api/admin/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Úspech',
          description: 'SEO metadata boli uložené',
        })
        await fetchSeoList()
        setSelectedItem(null)
        resetForm()
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      toast({
        title: 'Chyba',
        description: 'Nepodarilo sa uložiť SEO dáta',
        variant: 'destructive',
      })
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('Naozaj chcete vymazať tieto SEO metadata?')) return

    try {
      const response = await fetch(`/api/admin/seo/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Úspech',
          description: 'SEO metadata boli vymazané',
        })
        await fetchSeoList()
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      toast({
        title: 'Chyba',
        description: 'Nepodarilo sa vymazať SEO dáta',
        variant: 'destructive',
      })
      console.error(error)
    }
  }

  const resetForm = (): void => {
    setFormData({
      pageSlug: 'home',
      locale: 'sk',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      h1Heading: '',
      canonicalUrl: '',
    })
  }

  const handleNewEntry = (): void => {
    setSelectedItem(null)
    resetForm()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>SEO Management</span>
            <Button onClick={handleNewEntry} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nový záznam
            </Button>
          </CardTitle>
          <CardDescription>
            Spravujte SEO metadata pre všetky stránky a jazyky
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list" className="w-full">
            <TabsList>
              <TabsTrigger value="list">
                <Search className="h-4 w-4 mr-2" />
                Zoznam ({seoList.length})
              </TabsTrigger>
              <TabsTrigger value="editor">
                <Save className="h-4 w-4 mr-2" />
                Editor
              </TabsTrigger>
            </TabsList>

            {/* List Tab */}
            <TabsContent value="list" className="space-y-4">
              {seoList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Žiadne SEO záznamy. Vytvorte nový záznam.
                </div>
              ) : (
                <div className="space-y-2">
                  {seoList.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleSelectItem(item)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{item.locale}</Badge>
                          <Badge>{item.pageSlug}</Badge>
                        </div>
                        <div className="font-medium">{item.metaTitle}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {item.metaDescription}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(item.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Editor Tab */}
            <TabsContent value="editor" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stránka</Label>
                  <Select
                    value={formData.pageSlug}
                    onValueChange={(value) =>
                      setFormData({ ...formData, pageSlug: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SLUGS.map((slug) => (
                        <SelectItem key={slug} value={slug}>
                          {slug}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Jazyk</Label>
                  <Select
                    value={formData.locale}
                    onValueChange={(value) =>
                      setFormData({ ...formData, locale: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCALES.map((locale) => (
                        <SelectItem key={locale} value={locale}>
                          {locale.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Meta Title (max 60 znakov)</Label>
                <Input
                  value={formData.metaTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, metaTitle: e.target.value })
                  }
                  maxLength={60}
                  placeholder="Apartmány Vita - Luxusné ubytovanie"
                />
                <div className="text-xs text-muted-foreground">
                  {formData.metaTitle.length}/60
                </div>
              </div>

              <div className="space-y-2">
                <Label>Meta Description (max 160 znakov)</Label>
                <Textarea
                  value={formData.metaDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, metaDescription: e.target.value })
                  }
                  maxLength={160}
                  rows={3}
                  placeholder="Moderné apartmány v centre Lučenca..."
                />
                <div className="text-xs text-muted-foreground">
                  {formData.metaDescription.length}/160
                </div>
              </div>

              <div className="space-y-2">
                <Label>Meta Keywords (oddelené čiarkou)</Label>
                <Input
                  value={formData.metaKeywords}
                  onChange={(e) =>
                    setFormData({ ...formData, metaKeywords: e.target.value })
                  }
                  placeholder="apartmány lučenec, ubytovanie, prenájom"
                />
              </div>

              <div className="space-y-2">
                <Label>H1 Heading</Label>
                <Input
                  value={formData.h1Heading}
                  onChange={(e) =>
                    setFormData({ ...formData, h1Heading: e.target.value })
                  }
                  placeholder="Luxusné apartmány v srdci Lučenca"
                />
              </div>

              <div className="space-y-2">
                <Label>OG Image URL</Label>
                <Input
                  value={formData.ogImage}
                  onChange={(e) =>
                    setFormData({ ...formData, ogImage: e.target.value })
                  }
                  placeholder="https://apartmanyvita.sk/og-default.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label>Canonical URL</Label>
                <Input
                  value={formData.canonicalUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, canonicalUrl: e.target.value })
                  }
                  placeholder="https://apartmanyvita.sk/sk/home"
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Ukladám...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Uložiť SEO metadata
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

