"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, isAfter, differenceInDays } from "date-fns";
import { sk } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EnhancedAvailabilityCalendarProps {
  apartmentSlug: string;
  selectedRange?: {
    from: Date | null;
    to: Date | null;
  };
  onRangeSelect?: (range: { from: Date | null; to: Date | null }) => void;
  minStay?: number;
  maxStay?: number;
  className?: string;
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
  isPast: boolean;
}

interface AvailabilityData {
  success: boolean;
  available: string[];
  booked: string[];
  prices: Record<string, number>;
  minStay: number;
  maxStay: number;
}

export function EnhancedAvailabilityCalendar({
  apartmentSlug,
  selectedRange,
  onRangeSelect,
  minStay = 1,
  maxStay = 30,
  className
}: EnhancedAvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingRange, setSelectingRange] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  // Fetch availability data for current month and next month
  const { data: availability, isLoading, error } = useQuery({
    queryKey: ['monthly-availability', apartmentSlug, currentMonth],
    queryFn: async () => {
      const monthStart = startOfMonth(currentMonth);
      const nextMonthEnd = endOfMonth(addMonths(currentMonth, 1));
      
      // Format dates for API
      const startDate = format(monthStart, 'yyyy-MM-dd');
      const endDate = format(nextMonthEnd, 'yyyy-MM-dd');
      
      console.log('Fetching availability for calendar:', { apartmentSlug, startDate, endDate });
      
      const response = await fetch(`/api/beds24/monthly-availability?apartment=${apartmentSlug}&startDate=${startDate}&endDate=${endDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }
      
      const data = await response.json();
      console.log('Calendar availability data:', data);
      return data as AvailabilityData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true
  });

  // Generate calendar days
  const calendarDays = generateCalendarDays(currentMonth, availability, selectedRange, hoveredDate, selectingRange);

  const handleDateClick = (date: Date) => {
    if (!isDateSelectable(date, availability)) return;

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
        if (isValidRange(from, to, availability, minStay, maxStay)) {
          onRangeSelect({ from, to });
          setSelectingRange(null);
          setHoveredDate(null);
        } else {
          // Start new range if invalid
          setSelectingRange(date);
          onRangeSelect({ from: date, to: null });
        }
      }
    }
  };

  const handleDateHover = (date: Date) => {
    if (selectingRange && isDateSelectable(date, availability)) {
      setHoveredDate(date);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  if (error) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center text-muted-foreground">
          <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nepodarilo sa načítať dostupnosť</p>
          <p className="text-sm">Skúste to znovu neskôr</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Dostupnosť apartmánu
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
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>Dostupné</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-3 w-3 text-red-500" />
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

        {/* Validation Messages */}
        {selectingRange && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Vyberte dátum odchodu. Minimálne {minStay} noc{minStay > 1 ? 'í' : ''}.
            </AlertDescription>
          </Alert>
        )}
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
                  onHover={() => handleDateHover(day.date)}
                  onLeave={() => setHoveredDate(null)}
                />
              ))}
            </div>

            {/* Pricing info for selected range */}
            {selectedRange?.from && selectedRange?.to && availability && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Ceny pre vybraný termín:</p>
                <div className="space-y-2">
                  {generateDateRange(selectedRange.from, selectedRange.to).map((date) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const price = availability.prices[dateStr];
                    return price ? (
                      <div key={dateStr} className="flex justify-between text-sm">
                        <span>{format(date, 'dd.MM.yyyy')}</span>
                        <span>€{price}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CalendarDayCell({ 
  day, 
  onClick, 
  onHover, 
  onLeave 
}: { 
  day: CalendarDay; 
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
}) {
  const dayContent = (
    <button
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      disabled={!day.isAvailable || !day.isCurrentMonth || day.isPast}
      className={cn(
        "w-full aspect-square p-1 text-sm rounded-md transition-all relative group",
        "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
        {
          // Base styles
          "text-muted-foreground": !day.isCurrentMonth,
          "cursor-not-allowed opacity-50": (!day.isAvailable && day.isCurrentMonth) || day.isPast,
          
          // Available days
          "hover:bg-green-50 border border-green-200 text-green-800": 
            day.isAvailable && day.isCurrentMonth && !day.isSelected && !day.isInRange && !day.isPast,
          
          // Booked days
          "bg-red-100 text-red-800 cursor-not-allowed": day.isBooked && day.isCurrentMonth,
          
          // Past days
          "bg-gray-100 text-gray-400 cursor-not-allowed": day.isPast,
          
          // Selected days
          "bg-primary text-primary-foreground": day.isSelected,
          "bg-primary/20 text-primary border-primary/30": day.isInRange && !day.isSelected,
          
          // Range edges
          "rounded-l-md rounded-r-none": day.isRangeStart && day.isInRange,
          "rounded-r-md rounded-l-none": day.isRangeEnd && day.isInRange,
          "rounded-none": day.isInRange && !day.isRangeStart && !day.isRangeEnd,
          
          // Today
          "ring-2 ring-primary ring-offset-1": isToday(day.date) && day.isCurrentMonth && !day.isSelected
        }
      )}
    >
      <span className="block font-medium">{format(day.date, 'd')}</span>
      {day.price && day.isAvailable && day.isCurrentMonth && !day.isPast && (
        <span className="absolute bottom-0 left-0 right-0 text-xs text-green-600 font-medium bg-white/80 rounded-b">
          €{day.price}
        </span>
      )}
      
      {/* Status indicators */}
      {day.isCurrentMonth && !day.isPast && (
        <div className="absolute top-0 right-0 p-0.5">
          {day.isAvailable ? (
            <CheckCircle className="h-2 w-2 text-green-500" />
          ) : (
            <XCircle className="h-2 w-2 text-red-500" />
          )}
        </div>
      )}
    </button>
  );

  if (!day.isCurrentMonth || day.isAvailable || day.isPast) {
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
  availability?: AvailabilityData,
  selectedRange?: { from: Date | null; to: Date | null },
  hoveredDate?: Date | null,
  selectingRange?: Date | null
): CalendarDay[] {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const today = new Date();
  
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
    const isPast = isBefore(date, today);
    
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
    
    // Handle hover preview for range selection
    if (selectingRange && hoveredDate && !selectedRange?.to) {
      const from = isBefore(hoveredDate, selectingRange) ? hoveredDate : selectingRange;
      const to = isBefore(hoveredDate, selectingRange) ? selectingRange : hoveredDate;
      
      if (isValidRange(from, to, availability, 1, 30)) {
        const isInHoverRange = (isAfter(date, from) && isBefore(date, to)) || 
                              isSameDay(date, from) || isSameDay(date, to);
        if (isInHoverRange) {
          isInRange = true;
          isRangeStart = isSameDay(date, from);
          isRangeEnd = isSameDay(date, to);
        }
      }
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
      isRangeEnd,
      isPast
    };
  });
}

function isDateSelectable(date: Date, availability?: AvailabilityData): boolean {
  if (isBefore(date, new Date())) return false;
  
  const dateStr = format(date, 'yyyy-MM-dd');
  return availability?.available?.includes(dateStr) || false;
}

function isValidRange(
  from: Date,
  to: Date,
  availability?: AvailabilityData,
  minStay: number = 1,
  maxStay: number = 30
): boolean {
  const nights = differenceInDays(to, from);
  
  // Check stay length
  if (nights < minStay || nights > maxStay) return false;
  
  // Check all days in range are available
  const days = eachDayOfInterval({ start: from, end: to });
  return days.every(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availability?.available?.includes(dateStr);
  });
}

function generateDateRange(from: Date, to: Date): Date[] {
  return eachDayOfInterval({ start: from, end: to });
}
