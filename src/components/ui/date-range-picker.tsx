"use client"

import * as React from "react"
import { format, isBefore } from "date-fns"
import { sk } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange, Matcher } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  className?: string
  placeholder?: string
  disabled?: boolean
  minDate?: Date
  numberOfMonths?: number
}

export function DateRangePicker({
  value,
  onChange,
  className,
  placeholder = "Vyberte dátumy",
  disabled = false,
  minDate,
  numberOfMonths = 2,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(value)
  const [isOpen, setIsOpen] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)

  // Detect mobile screen size
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  React.useEffect(() => {
    setDate(value)
  }, [value])

  const handleDayClick = (day: Date) => {
    // If no date selected yet, or both from and to are already set, start fresh
    if (!date?.from || (date.from && date.to)) {
      // First click - set only 'from'
      const newRange: DateRange = { from: day, to: undefined }
      setDate(newRange)
      onChange?.(newRange)
      return
    }

    // If only 'from' is set, this is the second click - complete the range
    if (date.from && !date.to) {
      let newRange: DateRange
      
      // Ensure correct order
      if (isBefore(day, date.from)) {
        newRange = { from: day, to: date.from }
      } else {
        newRange = { from: date.from, to: day }
      }
      
      // Valid range - close popover
      setDate(newRange)
      onChange?.(newRange)
      setIsOpen(false)
    }
  }

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) {
      return placeholder
    }

    if (range.to) {
      return `${format(range.from, "d. MMM", { locale: sk })} - ${format(
        range.to,
        "d. MMM yyyy",
        { locale: sk }
      )}`
    }

    // Only 'from' is selected - show it with arrow
    return `${format(range.from, "d. MMM yyyy", { locale: sk })} → ...`
  }

  // Create modifiers for styling
  const modifiers = React.useMemo(() => {
    const mods: {
      selected?: Matcher
      range_start?: Matcher
      range_end?: Matcher
      range_middle?: Matcher
    } = {}

    if (date?.from) {
      mods.range_start = date.from
      if (date.to) {
        mods.range_end = date.to
        // Calculate middle days
        const start = date.from.getTime()
        const end = date.to.getTime()
        mods.range_middle = (day: Date) => {
          const time = day.getTime()
          return time > start && time < end
        }
        mods.selected = [date.from, date.to]
      } else {
        mods.selected = date.from
      }
    }

    return mods
  }, [date])

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal h-10",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">{formatDateRange(date)}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" side="bottom">
          <Calendar
            mode="range"
            defaultMonth={date?.from || minDate || new Date()}
            selected={date}
            onDayClick={handleDayClick}
            numberOfMonths={isMobile ? 1 : numberOfMonths}
            disabled={(day) => {
              if (minDate && day < minDate) {
                return true
              }
              return false
            }}
            modifiers={modifiers}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

