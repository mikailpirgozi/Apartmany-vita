'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Mail, Loader2, Check, Gift } from 'lucide-react'
import { toast } from 'sonner'
// import { useLocale, useTranslations } from 'next-intl'

const newsletterSchema = z.object({
  email: z.string().email('Zadajte platný email'),
  name: z.string().optional(),
  preferences: z.object({
    promotions: z.boolean(),
    updates: z.boolean(),
    events: z.boolean()
  }).optional()
})

type NewsletterFormData = z.infer<typeof newsletterSchema>

async function subscribeToNewsletter(data: NewsletterFormData & { language: string }) {
  const response = await fetch('/api/newsletter/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  
  if (!response.ok) {
    throw new Error('Failed to subscribe')
  }
  
  return response.json()
}

interface NewsletterSignupProps {
  variant?: 'default' | 'compact' | 'inline'
  showPreferences?: boolean
}

export function NewsletterSignup({ 
  variant = 'default', 
  showPreferences = false 
}: NewsletterSignupProps) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const locale = 'sk' // Default to Slovak for now
  // const t = useTranslations('footer.newsletter')
  
  // Temporary translations object
  const t = (key: string) => {
    const translations: Record<string, string> = {
      'title': 'Prihláste sa k odberu noviniek',
      'description': 'Získajte exkluzívne ponuky a novinky o našich apartmánoch',
      'placeholder': 'Váš email',
      'subscribe': 'Prihlásiť sa'
    }
    return translations[key] || key
  }

  const form = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: '',
      name: '',
      preferences: {
        promotions: true,
        updates: true,
        events: false
      }
    }
  })

  const subscribe = useMutation({
    mutationFn: (data: NewsletterFormData) => 
      subscribeToNewsletter({ ...data, language: locale }),
    onSuccess: () => {
      setIsSubscribed(true)
      toast.success('Úspešne ste sa prihlásili k odberu noviniek!')
      form.reset()
    },
    onError: (error) => {
      toast.error('Nastala chyba pri prihlasovaní k odberu')
      console.error('Newsletter subscription error:', error)
    }
  })

  if (isSubscribed) {
    return (
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Ďakujeme za prihlásenie!
          </h3>
          <p className="text-green-700 text-sm">
            Poslali sme vám potvrdzovací email. Prvé novinky dostanete čoskoro.
          </p>
        </div>
      </Card>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <Gift className="h-5 w-5 text-primary" />
          <div>
            <h4 className="font-semibold text-sm">Exkluzívne ponuky</h4>
            <p className="text-xs text-muted-foreground">Získajte 5% zľavu na prvú rezerváciu</p>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => subscribe.mutate(data))} className="flex gap-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input 
                      placeholder={t('placeholder')}
                      type="email" 
                      {...field} 
                      className="h-9"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              disabled={subscribe.isPending}
              size="sm"
            >
              {subscribe.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('subscribe')
              )}
            </Button>
          </form>
        </Form>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <Mail className="h-5 w-5 text-primary flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-sm">Nezmeškajte žiadnu ponuku</p>
          <p className="text-xs text-muted-foreground">Prihlásenie k odberu noviniek</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => subscribe.mutate(data))} className="flex gap-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      placeholder={t('placeholder')}
                      type="email" 
                      {...field} 
                      className="w-48"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              disabled={subscribe.isPending}
              size="sm"
            >
              {subscribe.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('subscribe')
              )}
            </Button>
          </form>
        </Form>
      </div>
    )
  }

  return (
    <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10">
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">{t('title')}</h3>
        <p className="text-muted-foreground text-sm">
          {t('description')}
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => subscribe.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meno (voliteľné)</FormLabel>
                  <FormControl>
                    <Input placeholder="Vaše meno" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input placeholder={t('placeholder')} type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {showPreferences && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Chcem dostávať:</Label>
              
              <FormField
                control={form.control}
                name="preferences.promotions"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm">
                        Exkluzívne ponuky a zľavy
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="preferences.updates"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm">
                        Novinky a aktualizácie
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="preferences.events"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm">
                        Podujatia v Trenčíne
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={subscribe.isPending}
          >
            {subscribe.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Prihlasovanie...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                {t('subscribe')}
              </>
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            Prihlásením súhlasíte s našimi podmienkami ochrany osobných údajov. 
            Odber môžete kedykoľvek zrušiť.
          </p>
        </form>
      </Form>
    </Card>
  )
}
