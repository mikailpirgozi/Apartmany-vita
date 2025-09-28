/**
 * Virtual Scrolling Availability Calendar
 * Optimized for large date ranges with thousands of days
 */

'use client';

import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { FixedSizeGrid as Grid, VariableSizeGrid } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { format, addDays, startOfMonth, endOfMonth, isSameMonth, isToday, isBefore, isAfter } from 'date-fns';
import { sk } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useOptimizedAvailability } from '@/hooks/use-optimized-availability';

interface VirtualCalendarProps {
  apartmentSlug: string;
  guests: number;
  startDate?: Date;
  endDate?: Date;
  onDateSelect?: (date: Date) => void;
  onDateRangeSelect?: (startDate: Date, endDate: Date) => void;
  selectedDate?: Date;
  selectedRange?: { start: Date; end: Date };
  className?: string;
  monthsToShow?: number;
  enableInfiniteScroll?: boolean;
  itemSize?: number;
}

interface CalendarDay {
  date: Date;
  available: boolean;
  price?: number;
  minStay?: number;
  isToday: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isPast: boolean;
  isWeekend: boolean;
  loading: boolean;
}

interface GridItemData {
  days: CalendarDay[];
  columnsPerRow: number;
  onDateSelect?: (date: Date) => void;
  onDateRangeSelect?: (startDate: Date, endDate: Date) => void;
  selectedRange?: { start: Date; end: Date };
  rangeSelection: boolean;
}

const DAYS_PER_ROW = 7;
const DEFAULT_ITEM_HEIGHT = 80;
const HEADER_HEIGHT = 40;
const MONTH_HEADER_HEIGHT = 60;

export function VirtualAvailabilityCalendar({
  apartmentSlug,
  guests,
  startDate = new Date(),
  endDate,
  onDateSelect,
  onDateRangeSelect,
  selectedDate,
  selectedRange,
  className,
  monthsToShow = 12,
  enableInfiniteScroll = true,
  itemSize = DEFAULT_ITEM_HEIGHT
}: VirtualCalendarProps) {
  const [rangeSelection, setRangeSelection] = useState(!!onDateRangeSelect);
  const [tempRange, setTempRange] = useState<{ start: Date; end: Date } | null>(null);
  const [loadedMonths, setLoadedMonths] = useState<Set<string>>(new Set());
  const gridRef = useRef<VariableSizeGrid>(null);

  // Calculate date range
  const actualEndDate = endDate || addDays(startDate, monthsToShow * 30);
  
  // Generate all days in the range
  const allDays = useMemo(() => {
    const days: Date[] = [];
    let currentDate = startOfMonth(startDate);
    const end = endOfMonth(actualEndDate);
    
    while (isBefore(currentDate, end) || currentDate.getTime() === end.getTime()) {
      days.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }
    
    return days;
  }, [startDate, actualEndDate]);

  // Load availability data with optimized hook
  const { 
    data: availabilityData, 
    isLoading, 
    prefetchMonth,
    getCachedMonth 
  } = useOptimizedAvailability(apartmentSlug, guests);

  // Process days with availability data
  const processedDays = useMemo(() => {
    return allDays.map((date): CalendarDay => {
      const monthKey = format(date, 'yyyy-MM');
      const dayKey = format(date, 'yyyy-MM-dd');
      const monthData = availabilityData?.[monthKey];
      const dayData = monthData?.days?.[dayKey];

      const isSelectedDate = selectedDate && date.getTime() === selectedDate.getTime();
      const isInSelectedRange = selectedRange && 
        date >= selectedRange.start && date <= selectedRange.end;
      const isRangeStart = selectedRange && date.getTime() === selectedRange.start.getTime();
      const isRangeEnd = selectedRange && date.getTime() === selectedRange.end.getTime();

      return {
        date,
        available: dayData?.available ?? false,
        price: dayData?.price,
        minStay: dayData?.minStay,
        isToday: isToday(date),
        isSelected: isSelectedDate || false,
        isInRange: isInSelectedRange || false,
        isRangeStart: isRangeStart || false,
        isRangeEnd: isRangeEnd || false,
        isPast: isBefore(date, new Date()),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        loading: !monthData && isLoading
      };
    });
  }, [allDays, availabilityData, isLoading, selectedDate, selectedRange]);

  // Group days into rows
  const dayRows = useMemo(() => {
    const rows: CalendarDay[][] = [];
    for (let i = 0; i < processedDays.length; i += DAYS_PER_ROW) {
      rows.push(processedDays.slice(i, i + DAYS_PER_ROW));
    }
    return rows;
  }, [processedDays]);

  // Handle date selection
  const handleDateClick = useCallback((date: Date) => {
    if (rangeSelection && onDateRangeSelect) {
      if (!tempRange) {
        setTempRange({ start: date, end: date });
      } else {
        const start = isBefore(date, tempRange.start) ? date : tempRange.start;
        const end = isAfter(date, tempRange.start) ? date : tempRange.start;
        onDateRangeSelect(start, end);
        setTempRange(null);
      }
    } else if (onDateSelect) {
      onDateSelect(date);
    }
  }, [rangeSelection, tempRange, onDateSelect, onDateRangeSelect]);

  // Infinite loading
  const isItemLoaded = useCallback((index: number) => {
    const row = dayRows[index];
    if (!row) return false;
    
    const monthKey = format(row[0].date, 'yyyy-MM');
    return loadedMonths.has(monthKey);
  }, [dayRows, loadedMonths]);

  const loadMoreItems = useCallback(async (startIndex: number, stopIndex: number) => {
    const monthsToLoad = new Set<string>();
    
    for (let i = startIndex; i <= stopIndex; i++) {
      const row = dayRows[i];
      if (row) {
        const monthKey = format(row[0].date, 'yyyy-MM');
        if (!loadedMonths.has(monthKey)) {
          monthsToLoad.add(monthKey);
        }
      }
    }

    // Prefetch months
    await Promise.all(
      Array.from(monthsToLoad).map(async (monthKey) => {
        const [year, month] = monthKey.split('-');
        const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        await prefetchMonth(monthDate);
        setLoadedMonths(prev => new Set([...prev, monthKey]));
      })
    );
  }, [dayRows, loadedMonths, prefetchMonth]);

  // Grid item renderer
  const GridItem = useCallback(({ columnIndex, rowIndex, style, data }: any) => {
    const { days, onDateSelect, selectedRange } = data as GridItemData;
    const day = days[rowIndex * DAYS_PER_ROW + columnIndex];
    
    if (!day) {
      return <div style={style} />;
    }

    return (
      <div style={style} className="p-1">
        <CalendarDayCell
          day={day}
          onClick={() => handleDateClick(day.date)}
          disabled={day.isPast || !day.available}
        />
      </div>
    );
  }, [handleDateClick]);

  // Variable row height for month headers
  const getRowHeight = useCallback((index: number) => {
    const row = dayRows[index];
    if (!row) return itemSize;
    
    const isFirstRowOfMonth = index === 0 || 
      !isSameMonth(row[0].date, dayRows[index - 1]?.[0]?.date);
    
    return isFirstRowOfMonth ? itemSize + MONTH_HEADER_HEIGHT : itemSize;
  }, [dayRows, itemSize]);

  // Grid data
  const gridData: GridItemData = {
    days: processedDays,
    columnsPerRow: DAYS_PER_ROW,
    onDateSelect,
    onDateRangeSelect,
    selectedRange: selectedRange || tempRange,
    rangeSelection
  };

  if (enableInfiniteScroll) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="space-y-4">
          {/* Calendar Header */}
          <CalendarHeader 
            apartmentSlug={apartmentSlug}
            rangeSelection={rangeSelection}
            onToggleRangeSelection={() => setRangeSelection(!rangeSelection)}
          />

          {/* Days of Week Header */}
          <WeekdaysHeader />

          {/* Virtual Grid with Infinite Loading */}
          <div className="relative">
            <InfiniteLoader
              isItemLoaded={isItemLoaded}
              itemCount={dayRows.length + 50} // Buffer for infinite scroll
              loadMoreItems={loadMoreItems}
              threshold={10}
            >
              {({ onItemsRendered, ref }) => (
                <VariableSizeGrid
                  ref={(grid) => {
                    gridRef.current = grid;
                    ref(grid);
                  }}
                  columnCount={DAYS_PER_ROW}
                  columnWidth={() => 100}
                  height={600}
                  rowCount={dayRows.length}
                  rowHeight={getRowHeight}
                  itemData={gridData}
                  onItemsRendered={({
                    visibleRowStartIndex,
                    visibleRowStopIndex,
                    ...rest
                  }) => {
                    onItemsRendered({
                      startIndex: visibleRowStartIndex,
                      stopIndex: visibleRowStopIndex
                    });
                  }}
                  className="calendar-grid"
                >
                  {GridItem}
                </VariableSizeGrid>
              )}
            </InfiniteLoader>
          </div>
        </div>
      </Card>
    );
  }

  // Standard virtual grid without infinite loading
  return (
    <Card className={cn("p-4", className)}>
      <div className="space-y-4">
        <CalendarHeader 
          apartmentSlug={apartmentSlug}
          rangeSelection={rangeSelection}
          onToggleRangeSelection={() => setRangeSelection(!rangeSelection)}
        />

        <WeekdaysHeader />

        <VariableSizeGrid
          ref={gridRef}
          columnCount={DAYS_PER_ROW}
          columnWidth={() => 100}
          height={600}
          rowCount={dayRows.length}
          rowHeight={getRowHeight}
          itemData={gridData}
          className="calendar-grid"
        >
          {GridItem}
        </VariableSizeGrid>
      </div>
    </Card>
  );
}

/**
 * Calendar day cell component
 */
interface CalendarDayCellProps {
  day: CalendarDay;
  onClick: () => void;
  disabled?: boolean;
}

function CalendarDayCell({ day, onClick, disabled }: CalendarDayCellProps) {
  if (day.loading) {
    return (
      <Skeleton className="w-full h-full rounded-lg" />
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full h-full p-2 flex flex-col items-center justify-center rounded-lg transition-all",
        "hover:bg-blue-50 dark:hover:bg-blue-900/20",
        {
          // Today
          "ring-2 ring-blue-500": day.isToday,
          
          // Selected states
          "bg-blue-500 text-white hover:bg-blue-600": day.isSelected,
          "bg-blue-100 dark:bg-blue-900/40": day.isInRange && !day.isSelected,
          "bg-blue-500 text-white": day.isRangeStart || day.isRangeEnd,
          
          // Availability states
          "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800": 
            day.available && !day.isSelected && !day.isInRange,
          "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 opacity-50": 
            !day.available,
          
          // Past dates
          "opacity-40": day.isPast,
          
          // Weekend
          "bg-gray-50 dark:bg-gray-800": day.isWeekend && !day.isSelected && !day.isInRange
        }
      )}
    >
      <span className="text-sm font-medium">
        {format(day.date, 'd')}
      </span>
      
      {day.price && (
        <span className="text-xs opacity-75">
          €{day.price}
        </span>
      )}
      
      {day.minStay && day.minStay > 1 && (
        <span className="text-xs opacity-60">
          {day.minStay}n
        </span>
      )}
    </Button>
  );
}

/**
 * Calendar header component
 */
interface CalendarHeaderProps {
  apartmentSlug: string;
  rangeSelection: boolean;
  onToggleRangeSelection: () => void;
}

function CalendarHeader({ apartmentSlug, rangeSelection, onToggleRangeSelection }: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">
        Dostupnosť - {apartmentSlug}
      </h3>
      
      <div className="flex items-center space-x-2">
        <Button
          variant={rangeSelection ? "default" : "outline"}
          size="sm"
          onClick={onToggleRangeSelection}
        >
          {rangeSelection ? "Rozsah dátumov" : "Jeden dátum"}
        </Button>
      </div>
    </div>
  );
}

/**
 * Weekdays header component
 */
function WeekdaysHeader() {
  const weekdays = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'];
  
  return (
    <div className="grid grid-cols-7 gap-1 mb-2">
      {weekdays.map((day) => (
        <div
          key={day}
          className="h-8 flex items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400"
        >
          {day}
        </div>
      ))}
    </div>
  );
}

export default VirtualAvailabilityCalendar;
