'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar, Users, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchParams {
  checkIn: Date | null
  checkOut: Date | null
  guests: number
  children: number
}

interface ApartmentSearchProps {
  initialValues?: Partial<SearchParams>
  className?: string
}

export function ApartmentSearch({ initialValues, className }: ApartmentSearchProps) {
  const router = useRouter()
  const [searchParams, setSearchParams] = useState<SearchParams>({
    checkIn: initialValues?.checkIn || null,
    checkOut: initialValues?.checkOut || null,
    guests: initialValues?.guests || 2,
    children: initialValues?.children || 0
  })

  // Track validation errors
  const [errors, setErrors] = useState<{
    checkIn?: string
    checkOut?: string
    date?: string
  }>({})

  // Track if component is mounted (client-side only)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Mark component as mounted after hydration
    setIsMounted(true)
  }, [])

  // Calculate minDate only on client side
  const minDate = useMemo(() => {
    if (!isMounted) return ''
    return new Date().toISOString().split('T')[0]
  }, [isMounted])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    setErrors({})
    
    // Validate required fields
    const newErrors: typeof errors = {}
    
    if (!searchParams.checkIn) {
      newErrors.checkIn = 'Vyberte dátum príchodu'
    }
    
    if (!searchParams.checkOut) {
      newErrors.checkOut = 'Vyberte dátum odchodu'
    }
    
    // Validate date logic
    if (searchParams.checkIn && searchParams.checkOut && searchParams.checkIn >= searchParams.checkOut) {
      newErrors.date = 'Dátum odchodu musí byť po dátume príchodu'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const params = new URLSearchParams({
      checkIn: searchParams.checkIn!.toISOString().split('T')[0],
      checkOut: searchParams.checkOut!.toISOString().split('T')[0],
      guests: searchParams.guests.toString(),
      children: searchParams.children.toString()
    })

    router.push(`/apartments?${params.toString()}`)
  }

  const updateGuests = (type: 'guests' | 'children', increment: boolean) => {
    setSearchParams(prev => {
      const current = prev[type]
      const newValue = increment ? current + 1 : Math.max(0, current - 1)
      
      // Limit guests to reasonable numbers
      if (type === 'guests' && newValue > 8) return prev
      if (type === 'children' && newValue > 6) return prev
      if (type === 'guests' && newValue < 1) return prev
      
      return { ...prev, [type]: newValue }
    })
  }

  const formatDate = (date: Date | null) => {
    if (!date) return ''
    return date.toISOString().split('T')[0]
  }

  return (
    <Card className={cn("p-6", className)} data-testid="search-widget">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Check-in Date */}
          <div>
            <Label htmlFor="checkin" className="text-sm font-medium">
              Príchod
            </Label>
            <div className="relative">
              <Input
                id="checkin"
                data-testid="search-checkin"
                type="date"
                value={formatDate(searchParams.checkIn)}
                onChange={(e) => setSearchParams(prev => ({ 
                  ...prev, 
                  checkIn: e.target.value ? new Date(e.target.value) : null 
                }))}
                min={minDate}
                className="pl-10"
                suppressHydrationWarning
              />
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            {errors.checkIn && (
              <p className="text-sm text-red-600 mt-1" data-testid="checkin-error">{errors.checkIn}</p>
            )}
          </div>

          {/* Check-out Date */}
          <div>
            <Label htmlFor="checkout" className="text-sm font-medium">
              Odchod
            </Label>
            <div className="relative">
              <Input
                id="checkout"
                data-testid="search-checkout"
                type="date"
                value={formatDate(searchParams.checkOut)}
                onChange={(e) => setSearchParams(prev => ({ 
                  ...prev, 
                  checkOut: e.target.value ? new Date(e.target.value) : null 
                }))}
                min={searchParams.checkIn ? 
                  new Date(searchParams.checkIn.getTime() + 86400000).toISOString().split('T')[0] : 
                  minDate
                }
                className="pl-10"
                suppressHydrationWarning
              />
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            {errors.checkOut && (
              <p className="text-sm text-red-600 mt-1" data-testid="checkout-error">{errors.checkOut}</p>
            )}
          </div>

          {/* Guest Selector */}
          <div>
            <Label className="text-sm font-medium">Hostia</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal pl-10"
                  data-testid="search-guests"
                >
                  <Users className="absolute left-3 h-4 w-4 text-muted-foreground" />
                  {searchParams.guests} {searchParams.guests === 1 ? 'hosť' : 'hostia'}
                  {searchParams.children > 0 && `, ${searchParams.children} ${searchParams.children === 1 ? 'dieťa' : 'detí'}`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Dospelí</p>
                      <p className="text-sm text-muted-foreground">Vek 13+</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        data-testid="guests-adults-minus"
                        onClick={() => updateGuests('guests', false)}
                        disabled={searchParams.guests <= 1}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center" data-testid="guests-adults-count">{searchParams.guests}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        data-testid="guests-adults-plus"
                        onClick={() => updateGuests('guests', true)}
                        disabled={searchParams.guests >= 8}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Deti</p>
                      <p className="text-sm text-muted-foreground">Vek 2-12</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        data-testid="guests-children-minus"
                        onClick={() => updateGuests('children', false)}
                        disabled={searchParams.children <= 0}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center" data-testid="guests-children-count">{searchParams.children}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        data-testid="guests-children-plus"
                        onClick={() => updateGuests('children', true)}
                        disabled={searchParams.children >= 6}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <Button 
              type="submit" 
              className="w-full"
              data-testid="search-button"
              disabled={!searchParams.checkIn || !searchParams.checkOut}
            >
              <Search className="mr-2 h-4 w-4" />
              Vyhľadať
            </Button>
          </div>
        </div>
        
        {/* Date validation error */}
        {errors.date && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600" data-testid="date-error">{errors.date}</p>
          </div>
        )}
      </form>
    </Card>
  )
}
