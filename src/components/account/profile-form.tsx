'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Loader2, Calendar as CalendarIcon, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const profileSchema = z.object({
  name: z.string().min(2, 'Meno musí mať aspoň 2 znaky'),
  email: z.string().email('Neplatný email'),
  phone: z.string().optional(),
  dateOfBirth: z.date().optional()
})

type ProfileFormData = z.infer<typeof profileSchema>

interface User {
  id: string
  name: string | null
  email: string
  phone: string | null
  dateOfBirth: Date | null
}

interface ProfileFormProps {
  user: User
  onUpdate?: () => void
}

export function ProfileForm({ user, onUpdate }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || '',
      email: user.email,
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth || undefined
    }
  })

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth?.toISOString()
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Nastala chyba pri aktualizácii profilu')
      }

      toast.success('Profil bol úspešne aktualizovaný')
      onUpdate?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nastala chyba pri aktualizácii profilu')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Osobné informácie</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meno a priezvisko</FormLabel>
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" disabled {...field} />
                  </FormControl>
                  <FormDescription>
                    Email sa nedá zmeniť. Pre zmenu kontaktujte podporu.
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefónne číslo</FormLabel>
                  <FormControl>
                    <Input placeholder="+421 900 123 456" {...field} />
                  </FormControl>
                  <FormDescription>
                    Telefónne číslo pre kontakt v prípade potreby
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Dátum narodenia</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'dd.MM.yyyy')
                          ) : (
                            <span>Vyberte dátum</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Nepovinné. Pomôže nám lepšie prispôsobiť naše služby.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Uložiť zmeny
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
