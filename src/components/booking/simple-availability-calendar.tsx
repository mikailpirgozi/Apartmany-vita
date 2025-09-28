"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isToday, 
  isBefore, 
  isAfter, 
  differenceInDays 
} from "date-fns";
import { sk } from "date-fns/locale";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Info, 
  CheckCircle, 
  XCircle,
  Euro,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SimpleAvailabilityCalendarProps {
  apartmentSlug: string;
  selectedRange?: {
    from: Date | null;
    to: Date | null;
  };
  onRangeSelect?: (range: { from: Date | null; to: Date | null }) => void;
  guests?: number;
  className?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isAvailable: boolean;
  isBooked: boolean;
  price: number;
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

export function SimpleAvailabilityCalendar({
  apartmentSlug,
  selectedRange,
  onRangeSelect,
  guests = 2,
  className
}: SimpleAvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingRange, setSelectingRange] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  // Fetch availability data for current month only
  const { data: availability, isLoading, error, refetch } = useQuery({
    queryKey: ['simple-availability', apartmentSlug, currentMonth, guests],
    queryFn: async () => {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      
      const startDate = format(monthStart, 'yyyy-MM-dd');
      const endDate = format(monthEnd, 'yyyy-MM-dd');
      
      console.log('📅 Fetching availability:', { apartmentSlug, startDate, endDate, guests });
      
      const response = await fetch(
        `/api/beds24/availability?apartment=${apartmentSlug}&checkIn=${startDate}&checkOut=${endDate}&guests=${guests}&children=0`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }
      
      const data = await response.json();
      console.log('📅 Calendar data received:', data);
      
      return data as AvailabilityData;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    retry: 3
  });

  // Generate calendar days for current month only
  const calendarDays = generateCalendarDays(
    currentMonth, 
    availability, 
    selectedRange, 
    hoveredDate, 
    selectingRange
  );

  const handleDateClick = (date: Date) => {
    if (!isDateSelectable(date, availability)) return;

    if (onRangeSelect) {
      if (!selectingRange) {
        // Start new range selection
        setSelectingRange(date);
        onRangeSelect({ from: date, to: null });
        setHoveredDate(null);
      } else {
        // Complete range selection
        const from = isBefore(date, selectingRange) ? date : selectingRange;
        const to = isBefore(date, selectingRange) ? selectingRange : date;
        
        // Validate range
        if (isValidRange(from, to, availability)) {
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
    setSelectingRange(null);
    setHoveredDate(null);
  };

  // Calculate pricing info for selected range
  const pricingInfo = selectedRange?.from && selectedRange?.to && availability 
    ? calculatePricingInfo(selectedRange.from, selectedRange.to, availability)
    : null;

  if (error) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center text-muted-foreground">
          <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium mb-2">Nepodarilo sa načítať dostupnosť</p>
          <p className="text-sm mb-4">Skúste to znovu neskôr</p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            Skúsiť znovu
          </Button>
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
            Dostupnosť a ceny
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
            
            <div className="min-w-[160px] text-center font-medium text-muted-foreground">
              Navigácia
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

        {/* Quick info */}
        {availability && (
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>{availability.available?.length || 0} dostupných dní</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-red-500" />
              <span>{availability.booked?.length || 0} rezervovaných dní</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Min. {availability.minStay} noc{availability.minStay > 1 ? 'í' : ''}</span>
            </div>
          </div>
        )}

        {/* Selection help */}
        {selectingRange && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Vyberte dátum odchodu pre dokončenie rezervácie.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <CalendarSkeleton />
        ) : (
          <div className="space-y-6">
            {/* Calendar Grid */}
            <div className="space-y-4">
              {/* Month header */}
              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  {format(currentMonth, 'MMMM yyyy', { locale: sk })}
                </h3>
              </div>
              
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar days - organized by weeks */}
              <div className="space-y-1">
                {organizeCalendarByWeeks(calendarDays).map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-cols-7 gap-1">
                    {week.map((day, dayIndex) => (
                      day ? (
                        <CalendarDayCell
                          key={`${weekIndex}-${dayIndex}`}
                          day={day}
                          onClick={() => handleDateClick(day.date)}
                          onHover={() => handleDateHover(day.date)}
                          onLeave={() => setHoveredDate(null)}
                        />
                      ) : (
                        <div key={`${weekIndex}-${dayIndex}`} className="aspect-square" />
                      )
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing summary for selected range */}
            {pricingInfo && (
              <div className="pt-4 border-t space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Euro className="h-4 w-4" />
                  Cenový súhrn
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Základná cena</p>
                    <p className="text-lg font-medium">€{pricingInfo.baseTotal}</p>
                    <p className="text-xs text-muted-foreground">{pricingInfo.nights} noc{pricingInfo.nights > 1 ? 'í' : ''}</p>
                  </div>
                  
                  {pricingInfo.discount > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Zľava</p>
                      <p className="text-lg font-medium text-green-600">-€{pricingInfo.discount}</p>
                      <p className="text-xs text-muted-foreground">{pricingInfo.discountReason}</p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Celková cena</p>
                    <p className="text-xl font-bold text-primary">€{pricingInfo.finalTotal}</p>
                    <p className="text-xs text-muted-foreground">€{Math.round(pricingInfo.finalTotal / pricingInfo.nights)}/noc</p>
                  </div>
                </div>

                {/* Daily breakdown */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Rozloženie cien:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {pricingInfo.dailyPrices.map(({ date, price }) => (
                      <div key={date} className="flex justify-between p-2 bg-muted rounded">
                        <span>{format(new Date(date), 'dd.MM')}</span>
                        <span>€{price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-sm pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                <span>Dostupné</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                <span>Rezervované</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded"></div>
                <span>Vybrané</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
                <span>Minulé</span>
              </div>
            </div>
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
  return (
    <button
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      disabled={!day.isAvailable || !day.isCurrentMonth || day.isPast}
      className={cn(
        "w-full aspect-square p-1 text-xs rounded-md transition-all relative group",
        "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
        {
          // Base styles
          "text-muted-foreground bg-gray-50": !day.isCurrentMonth,
          "cursor-not-allowed opacity-40": (!day.isAvailable && day.isCurrentMonth) || day.isPast,
          
          // Past days
          "bg-gray-100 text-gray-400 cursor-not-allowed": day.isPast,
          
          // Available days
          "hover:bg-green-50 border border-green-200 text-green-800 bg-green-50/50": 
            day.isAvailable && day.isCurrentMonth && !day.isSelected && !day.isInRange && !day.isPast,
          
          // Booked days
          "bg-red-100 text-red-800 border border-red-200 cursor-not-allowed": 
            day.isBooked && day.isCurrentMonth,
          
          // Selected days
          "bg-primary text-primary-foreground border-primary shadow-md": day.isSelected,
          "bg-primary/20 text-primary border-primary/30": day.isInRange && !day.isSelected,
          
          // Range edges
          "rounded-l-md rounded-r-none": day.isRangeStart && day.isInRange,
          "rounded-r-md rounded-l-none": day.isRangeEnd && day.isInRange,
          "rounded-none": day.isInRange && !day.isRangeStart && !day.isRangeEnd,
          
          // Today highlight
          "ring-2 ring-blue-400 ring-offset-1": isToday(day.date) && day.isCurrentMonth && !day.isSelected
        }
      )}
    >
      {/* Day number */}
      <span className="block font-medium">
        {format(day.date, 'd')}
      </span>
      
      {/* Price */}
      {day.price && day.isAvailable && day.isCurrentMonth && !day.isPast && (
        <span className="absolute bottom-0 left-0 right-0 text-[10px] font-medium text-green-700 bg-white/90 rounded-b px-0.5">
          €{day.price}
        </span>
      )}
      
      {/* Status indicator */}
      {day.isCurrentMonth && !day.isPast && (
        <div className="absolute top-0.5 right-0.5">
          {day.isAvailable ? (
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
          ) : (
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
          )}
        </div>
      )}
    </button>
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
  
  // Get only days of current month (no padding days)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  return days.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
    const isAvailable = availability?.available?.includes(dateStr) || false;
    const isBooked = availability?.booked?.includes(dateStr) || false;
    const price = availability?.prices?.[dateStr] || 0;
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
      
      if (isValidRange(from, to, availability)) {
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
  availability?: AvailabilityData
): boolean {
  if (!availability) return false;
  
  const nights = differenceInDays(to, from);
  
  // Check minimum stay
  if (nights < (availability.minStay || 1)) return false;
  
  // Check all days in range are available
  const days = eachDayOfInterval({ start: from, end: to });
  return days.every(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availability.available?.includes(dateStr);
  });
}

function organizeCalendarByWeeks(days: CalendarDay[]): (CalendarDay | null)[][] {
  const weeks: (CalendarDay | null)[][] = [];
  let currentWeek: (CalendarDay | null)[] = [];
  
  // Start with the first day of the month
  const firstDay = days[0];
  if (!firstDay) return [];
  
  // Add empty slots for days before the first day of the month
  const firstDayOfWeek = (firstDay.date.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }
  
  // Add all days from the month - but only current month days
  days.forEach(day => {
    // Only add days that belong to the current month
    if (day.isCurrentMonth) {
      currentWeek.push(day);
      
      // If week is complete (7 days), start a new week
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
  });
  
  // Fill the last week with empty slots if needed
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }
  
  // Limit to maximum 6 weeks to prevent showing multiple months
  return weeks.slice(0, 6);
}

function calculatePricingInfo(
  from: Date,
  to: Date,
  availability: AvailabilityData,
  // _guests: number
) {
  const days = eachDayOfInterval({ start: from, end: to });
  const nights = days.length - 1; // Exclude checkout day
  
  let baseTotal = 0;
  const dailyPrices: { date: string; price: number }[] = [];
  
  // Calculate base total from daily prices
  days.slice(0, -1).forEach(date => { // Exclude checkout day
    const dateStr = format(date, 'yyyy-MM-dd');
    const price = availability.prices[dateStr] || 0;
    baseTotal += price;
    dailyPrices.push({ date: dateStr, price });
  });
  
  // Calculate discounts using unified logic (same as Beds24Service)
  let totalDiscount = 0;
  let discountReason = '';
  
  // Stay length discounts
  if (nights >= 30) {
    totalDiscount = 0.3; // 30% monthly discount
    discountReason = 'Mesačná zľava (30%)';
  } else if (nights >= 14) {
    totalDiscount = 0.15; // 15% extended stay discount
    discountReason = 'Predĺžený pobyt (15%)';
  } else if (nights >= 7) {
    totalDiscount = 0.1; // 10% weekly discount
    discountReason = 'Týždňová zľava (10%)';
  }
  
  // Seasonal discount (October-March) - can combine with stay discount
  const month = from.getMonth() + 1;
  if (month >= 10 || month <= 3) {
    const seasonalDiscount = 0.2; // 20% off-season discount
    if (totalDiscount > 0) {
      // Combine discounts but cap at 40%
      totalDiscount = Math.min(totalDiscount + seasonalDiscount, 0.4);
      discountReason = `${discountReason.replace(/\(\d+%\)/, '')} + mimo sezóna (${Math.round(totalDiscount * 100)}%)`;
    } else {
      totalDiscount = seasonalDiscount;
      discountReason = 'Mimo sezóna (20%)';
    }
  }
  
  const discount = Math.round(baseTotal * totalDiscount);
  const finalTotal = Math.round(baseTotal - discount);
  
  return {
    nights,
    baseTotal: Math.round(baseTotal),
    discount,
    discountReason,
    finalTotal,
    dailyPrices
  };
}
