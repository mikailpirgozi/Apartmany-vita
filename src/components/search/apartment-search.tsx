'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { DateRange } from 'react-day-picker'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Users, Search } from 'lucide-react'
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
  
  // Initialize date range
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (initialValues?.checkIn && initialValues?.checkOut) {
      return {
        from: initialValues.checkIn,
        to: initialValues.checkOut
      }
    }
    return undefined
  })

  const [guests, setGuests] = useState(initialValues?.guests || 2)
  const [children, setChildren] = useState(initialValues?.children || 0)

  // Track validation errors
  const [errors, setErrors] = useState<{
    dateRange?: string
  }>({})

  // Calculate minDate - block past dates
  const minDate = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    setErrors({})
    
    // Validate required fields
    const newErrors: typeof errors = {}
    
    if (!dateRange?.from || !dateRange?.to) {
      newErrors.dateRange = 'Vyberte dátumy príchodu a odchodu'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const checkInStr = dateRange?.from?.toISOString().split('T')[0];
    const checkOutStr = dateRange?.to?.toISOString().split('T')[0];
    
    if (!checkInStr || !checkOutStr) return;
    
    const params = new URLSearchParams({
      checkIn: checkInStr,
      checkOut: checkOutStr,
      guests: guests.toString(),
      children: children.toString()
    })

    router.push(`/apartments?${params.toString()}`)
  }

  const updateGuests = (type: 'guests' | 'children', increment: boolean) => {
    if (type === 'guests') {
      const newValue = increment ? guests + 1 : Math.max(1, guests - 1)
      if (newValue <= 8) {
        setGuests(newValue)
      }
    } else {
      const newValue = increment ? children + 1 : Math.max(0, children - 1)
      if (newValue <= 6) {
        setChildren(newValue)
      }
    }
  }

  return (
    <Card className={cn("p-6", className)} data-testid="search-widget">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Range Picker */}
          <div className="md:col-span-2">
            <Label className="text-sm font-medium mb-2 block">
              Dátumy pobytu
            </Label>
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              minDate={minDate}
              placeholder="Príchod → Odchod"
              numberOfMonths={2}
            />
            {errors.dateRange && (
              <p className="text-sm text-red-600 mt-1" data-testid="daterange-error">
                {errors.dateRange}
              </p>
            )}
          </div>

          {/* Guest Selector */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Hostia</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  data-testid="search-guests"
                >
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  {guests} {guests === 1 ? 'hosť' : 'hostia'}
                  {children > 0 && `, ${children} ${children === 1 ? 'dieťa' : 'detí'}`}
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
                        disabled={guests <= 1}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center" data-testid="guests-adults-count">{guests}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        data-testid="guests-adults-plus"
                        onClick={() => updateGuests('guests', true)}
                        disabled={guests >= 8}
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
                        disabled={children <= 0}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center" data-testid="guests-children-count">{children}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        data-testid="guests-children-plus"
                        onClick={() => updateGuests('children', true)}
                        disabled={children >= 6}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Search Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            size="lg"
            className="w-full md:w-auto min-w-[200px]"
            data-testid="search-button"
            disabled={!dateRange?.from || !dateRange?.to}
          >
            <Search className="mr-2 h-4 w-4" />
            Vyhľadať apartmány
          </Button>
        </div>
      </form>
    </Card>
  )
}
