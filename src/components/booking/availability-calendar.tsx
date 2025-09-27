"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, isAfter } from "date-fns";
import { sk } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getApartmentAvailability } from "@/services/beds24";

interface AvailabilityCalendarProps {
  apartmentSlug: string;
  selectedRange?: {
    from: Date | null;
    to: Date | null;
  };
  onDateSelect?: (date: Date) => void;
  onRangeSelect?: (range: { from: Date | null; to: Date | null }) => void;
  minStay?: number;
  maxStay?: number;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isAvailable: boolean;
  isBooked: boolean;
  price?: number;
  isSelected: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
}

export function AvailabilityCalendar({
  apartmentSlug,
  selectedRange,
  onDateSelect,
  onRangeSelect,
  minStay = 1,
  maxStay = 30
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingRange, setSelectingRange] = useState<Date | null>(null);

  // Fetch availability data for current month
  const { data: availability, isLoading, error } = useQuery({
    queryKey: ['availability', apartmentSlug, currentMonth],
    queryFn: async () => {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      return getApartmentAvailability(apartmentSlug, monthStart, monthEnd);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true
  });

  // Generate calendar days
  const calendarDays = generateCalendarDays(currentMonth, availability || {}, selectedRange);

  const handleDateClick = (date: Date) => {
    if (!isDateSelectable(date, availability || {})) return;

    if (onRangeSelect) {
      if (!selectingRange) {
        // Start new range selection
        setSelectingRange(date);
        onRangeSelect({ from: date, to: null });
      } else {
        // Complete range selection
        const from = isBefore(date, selectingRange) ? date : selectingRange;
        const to = isBefore(date, selectingRange) ? selectingRange : date;
        
        // Validate range
        if (isValidRange(from, to, availability || {}, minStay, maxStay)) {
          onRangeSelect({ from, to });
          setSelectingRange(null);
        } else {
          // Start new range if invalid
          setSelectingRange(date);
          onRangeSelect({ from: date, to: null });
        }
      }
    } else if (onDateSelect) {
      onDateSelect(date);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nepodarilo sa načítať dostupnosť</p>
          <p className="text-sm">Skúste to znovu neskôr</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Dostupnosť
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              disabled={isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="min-w-[140px] text-center font-medium">
              {format(currentMonth, 'MMMM yyyy', { locale: sk })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              disabled={isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Dostupné</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Rezervované</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded"></div>
            <span>Vybrané</span>
          </div>
          {availability && (
            <div className="flex items-center gap-2">
              <Info className="h-3 w-3" />
              <span>Min. {availability.minStay} noc{availability.minStay > 1 ? 'í' : ''}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <CalendarSkeleton />
        ) : (
          <div className="space-y-4">
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {calendarDays.map((day, index) => (
                <CalendarDayCell
                  key={index}
                  day={day}
                  onClick={() => handleDateClick(day.date)}
                />
              ))}
            </div>

            {/* Pricing info */}
            {availability && Object.keys(availability.prices).length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Ceny za noc:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(availability.prices).slice(0, 5).map(([date, price]) => (
                    <Badge key={date} variant="outline" className="text-xs">
                      {format(new Date(date), 'dd.MM')}: €{price}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CalendarDayCell({ day, onClick }: { day: CalendarDay; onClick: () => void }) {
  const dayContent = (
    <button
      onClick={onClick}
      disabled={!day.isAvailable || !day.isCurrentMonth}
      className={cn(
        "w-full aspect-square p-1 text-sm rounded-md transition-all relative",
        "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
        {
          // Base styles
          "text-muted-foreground": !day.isCurrentMonth,
          "cursor-not-allowed opacity-50": !day.isAvailable && day.isCurrentMonth,
          
          // Available days
          "hover:bg-green-50 border border-green-200": day.isAvailable && day.isCurrentMonth && !day.isSelected,
          
          // Booked days
          "bg-red-100 text-red-800 cursor-not-allowed": day.isBooked && day.isCurrentMonth,
          
          // Selected days
          "bg-primary text-primary-foreground": day.isSelected,
          "bg-primary/20 text-primary": day.isInRange && !day.isSelected,
          
          // Range edges
          "rounded-l-md rounded-r-none": day.isRangeStart && day.isInRange,
          "rounded-r-md rounded-l-none": day.isRangeEnd && day.isInRange,
          "rounded-none": day.isInRange && !day.isRangeStart && !day.isRangeEnd,
          
          // Today
          "ring-2 ring-primary ring-offset-1": isToday(day.date) && day.isCurrentMonth
        }
      )}
    >
      <span className="block">{format(day.date, 'd')}</span>
      {day.price && day.isAvailable && (
        <span className="absolute bottom-0 left-0 right-0 text-xs text-green-600 font-medium">
          €{day.price}
        </span>
      )}
    </button>
  );

  if (!day.isCurrentMonth || day.isAvailable) {
    return dayContent;
  }

  // Wrap unavailable days with tooltip
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {dayContent}
        </TooltipTrigger>
        <TooltipContent>
          <p>{day.isBooked ? 'Rezervované' : 'Nedostupné'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 42 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square" />
        ))}
      </div>
    </div>
  );
}

function generateCalendarDays(
  currentMonth: Date,
  availability: {
    available?: string[];
    booked?: string[];
    prices?: Record<string, number>;
  },
  selectedRange?: { from: Date | null; to: Date | null }
): CalendarDay[] {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  // Get all days to display (including prev/next month padding)
  const calendarStart = new Date(monthStart);
  calendarStart.setDate(calendarStart.getDate() - ((monthStart.getDay() + 6) % 7));
  
  const calendarEnd = new Date(monthEnd);
  calendarEnd.setDate(calendarEnd.getDate() + (6 - ((monthEnd.getDay() + 6) % 7)));
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  return days.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
    const isAvailable = availability?.available?.includes(dateStr) || false;
    const isBooked = availability?.booked?.includes(dateStr) || false;
    const price = availability?.prices?.[dateStr];
    
    // Check if date is in selected range
    let isSelected = false;
    let isInRange = false;
    let isRangeStart = false;
    let isRangeEnd = false;
    
    if (selectedRange?.from && selectedRange?.to) {
      isSelected = isSameDay(date, selectedRange.from) || isSameDay(date, selectedRange.to);
      isInRange = (isAfter(date, selectedRange.from) && isBefore(date, selectedRange.to)) || isSelected;
      isRangeStart = isSameDay(date, selectedRange.from);
      isRangeEnd = isSameDay(date, selectedRange.to);
    } else if (selectedRange?.from) {
      isSelected = isSameDay(date, selectedRange.from);
    }
    
    return {
      date,
      isCurrentMonth,
      isAvailable,
      isBooked,
      price,
      isSelected,
      isInRange,
      isRangeStart,
      isRangeEnd
    };
  });
}

function isDateSelectable(date: Date, availability: {
  available?: string[];
  booked?: string[];
  prices?: Record<string, number>;
}): boolean {
  if (isBefore(date, new Date())) return false;
  
  const dateStr = format(date, 'yyyy-MM-dd');
  return availability?.available?.includes(dateStr) || false;
}

function isValidRange(
  from: Date,
  to: Date,
  availability: {
    available?: string[];
    booked?: string[];
    prices?: Record<string, number>;
  },
  minStay: number,
  maxStay: number
): boolean {
  const days = eachDayOfInterval({ start: from, end: to });
  const nights = days.length - 1;
  
  // Check stay length
  if (nights < minStay || nights > maxStay) return false;
  
  // Check all days in range are available
  return days.every(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availability?.available?.includes(dateStr);
  });
}
