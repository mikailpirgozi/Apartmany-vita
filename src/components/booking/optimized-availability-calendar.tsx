"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

interface OptimizedAvailabilityCalendarProps {
  apartmentSlug: string;
  selectedRange?: {
    from: Date | null;
    to: Date | null;
  };
  onRangeSelect?: (range: { from: Date | null; to: Date | null }) => void;
  guests?: number;
  childrenCount?: number;
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

// 🚀 PHASE 1: OPTIMIZED CACHE CONFIGURATION
const CACHE_CONFIG = {
  staleTime: 10 * 60 * 1000,        // 10 minutes (from 2 minutes)
  gcTime: 30 * 60 * 1000,           // 30 minutes garbage collection
  refetchOnWindowFocus: false,      // No automatic refresh
  retry: 2,                         // Less retries (from 3)
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000)
};

// 🔑 HIERARCHICAL CACHE KEYS
const QUERY_KEYS = {
  availability: (apartmentSlug: string, month: Date, guests: number) => [
    'availability',
    apartmentSlug,
    format(month, 'yyyy-MM'),
    guests
  ],
  prefetch: (apartmentSlug: string, month: Date, guests: number) => [
    'availability',
    'prefetch',
    apartmentSlug,
    format(month, 'yyyy-MM'),
    guests
  ]
};

// 📊 PERFORMANCE TRACKING
class CalendarAnalytics {
  static trackCalendarLoad(apartmentSlug: string, loadTime: number, cacheHit: boolean) {
    console.log('📊 Calendar Load Analytics:', {
      apartment: apartmentSlug,
      loadTime: `${loadTime}ms`,
      cacheHit,
      timestamp: new Date().toISOString()
    });
  }
  
  static trackNavigation(from: Date, to: Date, timeToLoad: number) {
    console.log('📊 Calendar Navigation Analytics:', {
      from: format(from, 'yyyy-MM'),
      to: format(to, 'yyyy-MM'),
      timeToLoad: `${timeToLoad}ms`,
      timestamp: new Date().toISOString()
    });
  }
  
  static trackPrefetch(apartmentSlug: string, month: Date, success: boolean) {
    console.log('📊 Prefetch Analytics:', {
      apartment: apartmentSlug,
      month: format(month, 'yyyy-MM'),
      success,
      timestamp: new Date().toISOString()
    });
  }
}

// 🔄 BACKGROUND PREFETCHING HOOK
const useAvailabilityPrefetch = (apartmentSlug: string, currentMonth: Date, guests: number) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const prefetchAdjacentMonths = async () => {
      const startTime = performance.now();
      const prevMonth = subMonths(currentMonth, 1);
      const nextMonth = addMonths(currentMonth, 1);
      
      try {
        // Prefetch in background
        await Promise.all([
          queryClient.prefetchQuery({
            queryKey: QUERY_KEYS.availability(apartmentSlug, prevMonth, guests),
            queryFn: () => fetchAvailability(apartmentSlug, prevMonth, guests),
            staleTime: CACHE_CONFIG.staleTime
          }),
          queryClient.prefetchQuery({
            queryKey: QUERY_KEYS.availability(apartmentSlug, nextMonth, guests),
            queryFn: () => fetchAvailability(apartmentSlug, nextMonth, guests),
            staleTime: CACHE_CONFIG.staleTime
          })
        ]);
        
        const endTime = performance.now();
        CalendarAnalytics.trackPrefetch(apartmentSlug, prevMonth, true);
        CalendarAnalytics.trackPrefetch(apartmentSlug, nextMonth, true);
        console.log(`🚀 Prefetch completed in ${Math.round(endTime - startTime)}ms`);
      } catch (error) {
        console.warn('⚠️ Prefetch failed:', error);
        CalendarAnalytics.trackPrefetch(apartmentSlug, prevMonth, false);
        CalendarAnalytics.trackPrefetch(apartmentSlug, nextMonth, false);
      }
    };
    
    // Prefetch after 2 seconds (don't block UI)
    const timer = setTimeout(prefetchAdjacentMonths, 2000);
    return () => clearTimeout(timer);
  }, [apartmentSlug, currentMonth, guests, queryClient]);
};

// 📡 OPTIMIZED FETCH FUNCTION - SINGLE MONTH
async function fetchAvailability(apartmentSlug: string, month: Date, guests: number): Promise<AvailabilityData> {
  try {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const startDate = format(monthStart, 'yyyy-MM-dd');
    const endDate = format(monthEnd, 'yyyy-MM-dd');
    
    console.log('📅 Fetching availability (single month):', { apartmentSlug, startDate, endDate, guests });
    
    const response = await fetch(
      `/api/beds24/availability?apartment=${apartmentSlug}&checkIn=${startDate}&checkOut=${endDate}&guests=${guests}&children=0`,
      {
        // Add cache headers for better performance
        headers: {
          'Cache-Control': 'public, max-age=300', // 5 minutes browser cache
        }
      }
    );
    
    console.log('📅 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('📅 API Error:', response.status, errorText);
      throw new Error(`Failed to fetch availability: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('📅 Calendar data received (single month):', data);
    
    return data as AvailabilityData;
  } catch (error) {
    console.error('📅 Fetch availability error:', error);
    throw error;
  }
}

export function OptimizedAvailabilityCalendar({
  apartmentSlug,
  selectedRange,
  onRangeSelect,
  guests = 2,
  childrenCount = 0,
  className
}: OptimizedAvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingRange, setSelectingRange] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [isRangeSelectionMode, setIsRangeSelectionMode] = useState(false);
  
  const queryClient = useQueryClient();


  // 🚀 OPTIMIZED AVAILABILITY QUERY
  const { data: availability, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.availability(apartmentSlug, currentMonth, guests),
    queryFn: async () => {
      const startTime = performance.now();
      const data = await fetchAvailability(apartmentSlug, currentMonth, guests);
      const endTime = performance.now();
      const loadTime = Math.round(endTime - startTime);
      
      // Check if data came from cache
      const cacheHit = (endTime - startTime) < 100; // Less than 100ms likely means cache hit
      CalendarAnalytics.trackCalendarLoad(apartmentSlug, loadTime, cacheHit);
      
      return data;
    },
    ...CACHE_CONFIG
  });

  // 🔄 BACKGROUND PREFETCHING
  useAvailabilityPrefetch(apartmentSlug, currentMonth, guests);

  // Generate calendar days for current month only
  const calendarDays = generateCalendarDays(
    currentMonth, 
    availability as AvailabilityData | undefined, 
    selectedRange, 
    hoveredDate, 
    selectingRange,
    isRangeSelectionMode
  );

  const handleDateClick = (date: Date) => {
    if (!isDateSelectable(date, availability as AvailabilityData | undefined)) return;

    if (onRangeSelect) {
      if (!selectingRange) {
        // Start new range selection
        setSelectingRange(date);
        setIsRangeSelectionMode(true);
        onRangeSelect({ from: date, to: null });
        setHoveredDate(null);
        
        // Smart navigation: ak je dátum na konci mesiaca, automaticky prejdi na ďalší
        const daysUntilEndOfMonth = differenceInDays(endOfMonth(date), date);
        if (daysUntilEndOfMonth <= 3) {
          // Automaticky prejdi na ďalší mesiac pre lepší UX
          setTimeout(() => {
            setCurrentMonth(addMonths(date, 1));
          }, 300);
        }
      } else {
        // Complete range selection
        const from = isBefore(date, selectingRange) ? date : selectingRange;
        const to = isBefore(date, selectingRange) ? selectingRange : date;
        
        // Správna validácia: kontrolujeme rezervované dátumy
        const isInDifferentMonth = from.getMonth() !== to.getMonth() || from.getFullYear() !== to.getFullYear();
        
        let isRangeValid = false;
        if (isInDifferentMonth) {
          // Pre cross-month použijeme špeciálnu validáciu
          isRangeValid = isValidCrossMonthRange(from, to, availability as AvailabilityData | undefined);
        } else {
          // Pre single-month použijeme štandardnú validáciu
          isRangeValid = isValidRange(from, to, availability as AvailabilityData | undefined);
        }
        
        if (isRangeValid) {
          onRangeSelect({ from, to });
          setSelectingRange(null);
          setIsRangeSelectionMode(false);
          setHoveredDate(null);
        } else {
          // Start new range if invalid - ukáž chybu
          console.warn('❌ Neplatný rozsah dátumov:', {
            from: format(from, 'dd.MM.yyyy'),
            to: format(to, 'dd.MM.yyyy'),
            reason: 'Medzi vybranými dátumami sú rezervované dni'
          });
          setSelectingRange(date);
          setIsRangeSelectionMode(true);
          onRangeSelect({ from: date, to: null });
        }
      }
    }
  };

  const handleDateHover = (date: Date) => {
    if (selectingRange && isDateSelectable(date, availability as AvailabilityData | undefined)) {
      setHoveredDate(date);
    }
  };

  // 🚀 OPTIMISTIC NAVIGATION - zachová selection
  const navigateMonthOptimistic = (direction: 'prev' | 'next') => {
    const startTime = performance.now();
    
    const oldMonth = currentMonth;
    const newMonth = direction === 'prev' 
      ? subMonths(currentMonth, 1) 
      : addMonths(currentMonth, 1);
    
    // Immediately show new month (optimistic update)
    setCurrentMonth(newMonth);
    // NERESETNEME selectingRange a hoveredDate pre cross-month selection
    setHoveredDate(null);
    
    // Track navigation performance
    setTimeout(() => {
      const endTime = performance.now();
      const timeToLoad = Math.round(endTime - startTime);
      CalendarAnalytics.trackNavigation(oldMonth, newMonth, timeToLoad);
    }, 100);
    
    // Check if data is already cached
    const cachedData = queryClient.getQueryData(
      QUERY_KEYS.availability(apartmentSlug, newMonth, guests)
    );
    
    if (!cachedData) {
      // If not cached, invalidate to trigger fetch
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.availability(apartmentSlug, newMonth, guests)
      });
    }
  };

  // Get combined availability data for cross-month selection
  const getCombinedAvailabilityData = (from: Date, to: Date): AvailabilityData | null => {
    if (!availability) return null;
    
    const fromMonth = startOfMonth(from);
    const toMonth = startOfMonth(to);
    const currentMonthStart = startOfMonth(currentMonth);
    
    // If selection is within current month, use current data
    if (fromMonth.getTime() === toMonth.getTime() && fromMonth.getTime() === currentMonthStart.getTime()) {
      return availability as AvailabilityData;
    }
    
    // For cross-month selection, combine data from both months
    const combinedData: AvailabilityData = {
      success: availability.success,
      available: [...(availability.available || [])],
      booked: [...(availability.booked || [])],
      prices: { ...(availability.prices || {}) },
      minStay: availability.minStay,
      maxStay: availability.maxStay
    };
    
    // Try to get data from other month (if prefetched)
    if (fromMonth.getTime() !== currentMonthStart.getTime()) {
      const prevMonthData = queryClient.getQueryData(QUERY_KEYS.availability(apartmentSlug, fromMonth, guests)) as AvailabilityData | undefined;
      if (prevMonthData) {
        combinedData.available.push(...(prevMonthData.available || []));
        combinedData.booked.push(...(prevMonthData.booked || []));
        Object.assign(combinedData.prices, prevMonthData.prices || {});
      }
    }
    
    if (toMonth.getTime() !== currentMonthStart.getTime() && toMonth.getTime() !== fromMonth.getTime()) {
      const nextMonthData = queryClient.getQueryData(QUERY_KEYS.availability(apartmentSlug, toMonth, guests)) as AvailabilityData | undefined;
      if (nextMonthData) {
        combinedData.available.push(...(nextMonthData.available || []));
        combinedData.booked.push(...(nextMonthData.booked || []));
        Object.assign(combinedData.prices, nextMonthData.prices || {});
      }
    }
    
    return combinedData;
  };

  // Calculate pricing info for selected range
  const pricingInfo = selectedRange?.from && selectedRange?.to && availability 
    ? calculatePricingInfo(selectedRange.from, selectedRange.to, getCombinedAvailabilityData(selectedRange.from, selectedRange.to) || availability as AvailabilityData, guests, childrenCount)
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
    <>
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
              onClick={() => navigateMonthOptimistic('prev')}
              disabled={isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="min-w-[160px] text-center font-medium">
              {format(currentMonth, 'MMMM yyyy', { locale: sk })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonthOptimistic('next')}
              disabled={isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>


        {/* Quick info - kompaktné */}
        {availability && (
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>{(availability as AvailabilityData).available?.length || 0} dostupných</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-red-500" />
              <span>{(availability as AvailabilityData).booked?.length || 0} rezervovaných</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-blue-500" />
              <span>Min. {(availability as AvailabilityData).minStay} noc{(availability as AvailabilityData).minStay > 1 ? 'í' : ''}</span>
            </div>
          </div>
        )}

        {/* Selection help - vylepšené pre cross-month */}
        {selectingRange && (
          <Alert className="py-2 bg-blue-50 border-blue-200">
            <Info className="h-3 w-3 text-blue-600" />
            <AlertDescription className="text-xs text-blue-800">
              <div className="flex flex-col gap-1">
                <span>Vyberte dátum odchodu. Môžete prepínať mesiace pomocou šípok.</span>
                <span className="text-blue-600 font-medium">
                  Príchod: {format(selectingRange, 'dd.MM.yyyy')} 
                  {selectingRange.getMonth() !== currentMonth.getMonth() && (
                    <span className="text-blue-500 text-[10px] ml-1">
                      (iný mesiac)
                    </span>
                  )}
                </span>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent className="p-4">
        {isLoading ? (
          <CalendarSkeleton />
        ) : (
          <div className="space-y-4">
            {/* Calendar Grid */}
            <div className="space-y-2">
              {/* Day headers - kompaktné */}
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'].map((day) => (
                  <div key={day} className="p-1 text-center text-xs font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar days - organized by weeks - kompaktné */}
              <div className="space-y-0.5">
                {organizeCalendarByWeeks(calendarDays).map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-cols-7 gap-0.5">
                    {week.map((day, dayIndex) => 
                      day ? (
                        <CalendarDayCell
                          key={`${weekIndex}-${dayIndex}`}
                          day={day}
                          onClick={() => handleDateClick(day.date)}
                          onHover={() => handleDateHover(day.date)}
                          onLeave={() => setHoveredDate(null)}
                          isRangeSelectionMode={isRangeSelectionMode}
                        />
                      ) : (
                        <div key={`${weekIndex}-${dayIndex}`} className="aspect-square" />
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>


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
    </>
  );
}

function CalendarDayCell({ 
  day, 
  onClick, 
  onHover, 
  onLeave,
  isRangeSelectionMode = false
}: { 
  day: CalendarDay; 
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
  isRangeSelectionMode?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      disabled={!day.isAvailable || !day.isCurrentMonth || day.isPast}
      className={cn(
        "w-full h-12 p-1 text-sm rounded transition-all relative group flex flex-col items-center justify-center",
        "hover:scale-102 focus:outline-none focus:ring-1 focus:ring-primary",
        {
          // Base styles
          "text-muted-foreground bg-gray-50": !day.isCurrentMonth,
          
          // Past days
          "bg-gray-100 text-gray-400 cursor-not-allowed": day.isPast,
          
          // Available days - jasné zelené pozadie
          "hover:bg-green-100 border border-green-300 text-green-900 bg-green-50 font-medium": 
            day.isAvailable && day.isCurrentMonth && !day.isSelected && !day.isInRange && !day.isPast,
          
          // Booked days - jasné červené pozadie
          "bg-red-100 text-red-900 border border-red-300 cursor-not-allowed font-medium": 
            day.isBooked && day.isCurrentMonth,
          
          // Selected days - výrazné modré
          "bg-blue-600 text-white border-blue-600 shadow-lg font-bold": day.isSelected,
          "bg-blue-100 text-blue-900 border-blue-300 font-medium": day.isInRange && !day.isSelected,
          
          // Range edges
          "rounded-l-md rounded-r-none": day.isRangeStart && day.isInRange,
          "rounded-r-md rounded-l-none": day.isRangeEnd && day.isInRange,
          "rounded-none": day.isInRange && !day.isRangeStart && !day.isRangeEnd,
          
          // Today highlight
          "ring-2 ring-blue-500 ring-offset-1": isToday(day.date) && day.isCurrentMonth && !day.isSelected,
          
          // Disabled state for range selection
          "opacity-30 cursor-not-allowed": !day.isAvailable && day.isCurrentMonth && !day.isPast,
          
          // Range selection mode - zvýrazni selectable dátumy
          "ring-2 ring-blue-300 ring-opacity-50": isRangeSelectionMode && day.isAvailable && day.isCurrentMonth && !day.isPast && !day.isSelected,
          
          // Range selection mode - zablokované dátumy
          "bg-gray-200 text-gray-500 cursor-not-allowed": isRangeSelectionMode && !day.isAvailable && day.isCurrentMonth && !day.isPast && !day.isBooked
        }
      )}
    >
      {/* Day number - väčší a výraznejší */}
      <span className="text-sm font-bold leading-none mb-0.5">
        {format(day.date, 'd')}
      </span>
      
      {/* Price - výraznejšie a lepšie umiestnené */}
      {day.price && day.isAvailable && day.isCurrentMonth && !day.isPast && (
        <span className={cn("text-[11px] font-bold leading-none", {
          "text-green-700": !day.isSelected && !day.isInRange,
          "text-white": day.isSelected,
          "text-blue-700": day.isInRange && !day.isSelected
        })}>
          €{day.price}
        </span>
      )}
    </button>
  );
}

function CalendarSkeleton() {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: 42 }).map((_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    </div>
  );
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

function generateCalendarDays(
  currentMonth: Date,
  availability?: AvailabilityData,
  selectedRange?: { from: Date | null; to: Date | null },
  hoveredDate?: Date | null,
  selectingRange?: Date | null,
  isRangeSelectionMode?: boolean
): CalendarDay[] {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const today = new Date();
  
  // Get only days of current month (no padding days)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  return days.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
    let isAvailable = availability?.available?.includes(dateStr) || false;
    const isBooked = availability?.booked?.includes(dateStr) || false;
    const price = availability?.prices?.[dateStr] || 0;
    const isPast = isBefore(date, today);
    
    // V range selection mode, kontroluj či je dátum selectable
    if (isRangeSelectionMode && selectingRange && isAvailable) {
      isAvailable = isDateSelectableInRange(date, selectingRange, availability);
    }
    
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
      
      // Pre hover preview sme menej striktní - ukážeme preview aj pre cross-month
      const isInDifferentMonth = from.getMonth() !== to.getMonth() || from.getFullYear() !== to.getFullYear();
      
      let isHoverRangeValid = false;
      if (isInDifferentMonth) {
        // Pre cross-month hover preview - len základná kontrola
        isHoverRangeValid = differenceInDays(to, from) >= 1;
      } else {
        // Pre single-month hover preview - úplná validácia
        isHoverRangeValid = isValidRange(from, to, availability);
      }
      
      if (isHoverRangeValid) {
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

// Funkcia pre kontrolu či je dátum selectable v range mode
function isDateSelectableInRange(
  date: Date, 
  selectingRange: Date | null, 
  availability?: AvailabilityData
): boolean {
  if (!selectingRange || !availability) return isDateSelectable(date, availability);
  
  // Základná kontrola dostupnosti pre aktuálny dátum
  if (!isDateSelectable(date, availability)) return false;
  
  // Pre cross-month selection - ak sú dátumy v rôznych mesiacoch
  const isInDifferentMonth = date.getMonth() !== selectingRange.getMonth() || 
                            date.getFullYear() !== selectingRange.getFullYear();
  
  if (isInDifferentMonth) {
    // Pre cross-month selection kontrolujeme aspoň dostupné dáta
    const from = isBefore(date, selectingRange) ? date : selectingRange;
    const to = isBefore(date, selectingRange) ? selectingRange : date;
    
    const days = eachDayOfInterval({ start: from, end: to });
    const stayDays = days.slice(0, -1); // Exclude checkout day
    
    // Kontrolujeme len tie dni, pre ktoré máme dáta v aktuálnom mesiaci
    const daysInCurrentMonth = stayDays.filter(checkDate => 
      checkDate.getMonth() === date.getMonth() && 
      checkDate.getFullYear() === date.getFullYear()
    );
    
    // Ak máme nejaké dni v aktuálnom mesiaci, musia byť všetky dostupné
    if (daysInCurrentMonth.length > 0) {
      return daysInCurrentMonth.every(checkDate => {
        const dateStr = format(checkDate, 'yyyy-MM-dd');
        return availability.available?.includes(dateStr) && 
               !availability.booked?.includes(dateStr);
      });
    }
    
    // Ak nemáme žiadne dni v aktuálnom mesiaci, povolíme
    return true;
  }
  
  // Pre single-month selection kontrolujeme celý rozsah
  const from = isBefore(date, selectingRange) ? date : selectingRange;
  const to = isBefore(date, selectingRange) ? selectingRange : date;
  
  const days = eachDayOfInterval({ start: from, end: to });
  const stayDays = days.slice(0, -1); // Exclude checkout day
  
  return stayDays.every(checkDate => {
    const dateStr = format(checkDate, 'yyyy-MM-dd');
    return availability.available?.includes(dateStr) && 
           !availability.booked?.includes(dateStr);
  });
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
  
  // Check all days in range are available (excluding checkout day)
  const days = eachDayOfInterval({ start: from, end: to });
  const stayDays = days.slice(0, -1); // Exclude checkout day
  
  return stayDays.every(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    // Musí byť dostupný A nesmie byť rezervovaný
    return availability.available?.includes(dateStr) && 
           !availability.booked?.includes(dateStr);
  });
}

// Nová funkcia pre cross-month validáciu
function isValidCrossMonthRange(
  from: Date,
  to: Date,
  currentAvailability?: AvailabilityData
): boolean {
  const nights = differenceInDays(to, from);
  
  // Základné kontroly
  if (nights < 1) return false;
  
  // Pre cross-month selection kontrolujeme len aktuálne dostupné dáta
  if (currentAvailability) {
    const days = eachDayOfInterval({ start: from, end: to });
    const stayDays = days.slice(0, -1);
    
    // Kontrolujeme len tie dni, pre ktoré máme dáta
    const daysWithData = stayDays.filter(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return currentAvailability.available?.includes(dateStr) || 
             currentAvailability.booked?.includes(dateStr);
    });
    
    // Ak máme dáta, všetky musia byť dostupné
    if (daysWithData.length > 0) {
      return daysWithData.every(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return currentAvailability.available?.includes(dateStr) && 
               !currentAvailability.booked?.includes(dateStr);
      });
    }
  }
  
  // Ak nemáme dáta, povolíme (bude sa validovať neskôr)
  return true;
}

function calculatePricingInfo(
  from: Date,
  to: Date,
  availability: AvailabilityData,
  guests: number,
  childrenCount: number = 0
) {
  const days = eachDayOfInterval({ start: from, end: to });
  const nights = days.length - 1; // Exclude checkout day
  
  let baseTotal = 0;
  const dailyPrices: { date: string; price: number }[] = [];
  
  // Calculate base total from daily prices (these are already base prices from calendar)
  days.slice(0, -1).forEach(date => { // Exclude checkout day
    const dateStr = format(date, 'yyyy-MM-dd');
    const price = availability.prices[dateStr] || 0;
    baseTotal += price;
    dailyPrices.push({ date: dateStr, price });
  });
  
  // Calculate discounts using NEW unified logic (matching Beds24Service)
  let stayDiscount = 0;
  let seasonalDiscount = 0;
  let discountReason = '';
  
  // Stay length discounts (our own logic, not in Beds24)
  if (nights >= 30) {
    stayDiscount = 0.25; // 25% monthly discount
    discountReason = 'Mesačná zľava (25%)';
  } else if (nights >= 14) {
    stayDiscount = 0.15; // 15% extended stay discount
    discountReason = 'Predĺžený pobyt (15%)';
  } else if (nights >= 7) {
    stayDiscount = 0.10; // 10% weekly discount
    discountReason = 'Týždňová zľava (10%)';
  }
  
  // Seasonal discount (November-February) - our own logic
  const month = from.getMonth() + 1;
  if (month >= 11 || month <= 2) {
    seasonalDiscount = 0.15; // 15% off-season discount
    if (stayDiscount > 0) {
      discountReason = `${discountReason.replace(/\(\d+%\)/, '')} + mimo sezóna`;
    } else {
      discountReason = 'Mimo sezóna (15%)';
    }
  }
  
  // CHOOSE HIGHEST DISCOUNT (not combine)
  const totalDiscount = Math.max(stayDiscount, seasonalDiscount);
  
  // Apply Beds24 guest pricing: €20 per extra adult above 2, €10 per child
  let adjustedBaseTotal = baseTotal;
  let guestAdjustment = 0;
  
  // Calculate additional charges for extra adults (above base 2)
  if (guests > 2) {
    const extraAdults = guests - 2;
    const extraAdultCharge = 20; // €20 per extra adult per night
    const totalExtraAdultCharge = extraAdults * extraAdultCharge * nights;
    guestAdjustment += totalExtraAdultCharge;
    adjustedBaseTotal = baseTotal + totalExtraAdultCharge;
  }
  
  // Calculate additional charges for children (all children are extra)
  if (childrenCount > 0) {
    const childCharge = 10; // €10 per child per night
    const totalChildCharge = childrenCount * childCharge * nights;
    guestAdjustment += totalChildCharge;
    adjustedBaseTotal = baseTotal + guestAdjustment;
  }
  
  const discount = Math.round(adjustedBaseTotal * totalDiscount);
  const finalTotal = Math.round(adjustedBaseTotal - discount);
  
  // Update discount reason with final percentage
  if (totalDiscount > 0) {
    if (totalDiscount === stayDiscount) {
      discountReason = discountReason; // Keep stay discount reason
    } else if (totalDiscount === seasonalDiscount) {
      discountReason = 'Mimo sezóna (15%)'; // Use seasonal reason
    }
  }
  
  return {
    nights,
    baseTotal: Math.round(baseTotal), // Original base total without guest adjustments
    discount,
    discountReason,
    finalTotal: Math.round(adjustedBaseTotal - discount), // Final total with guest adjustments and discounts
    dailyPrices,
    guestAdjustment: Math.round(guestAdjustment) // Total guest adjustment (adults + children)
  };
}

