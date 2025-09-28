/**
 * Optimized availability hook for Phase 2 API optimization
 * Uses batch API and request deduplication for better performance
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, addMonths, subMonths } from 'date-fns';
import { useEffect } from 'react';

export interface OptimizedAvailabilityRequest {
  apartmentSlug: string;
  month: Date;
  guests: number;
  children?: number;
}

export interface OptimizedAvailabilityResponse {
  success: boolean;
  apartment: string;
  isAvailable: boolean;
  totalPrice: number;
  pricePerNight: number;
  nights: number;
  bookedDates: string[];
  dailyPrices: Record<string, number>;
  performance: {
    responseTime: number;
    cacheStats: {
      hits: number;
      misses: number;
      activeRequests: number;
      hitRate: number;
    };
    timestamp: string;
  };
}

// Cache configuration for Phase 2 optimization
const CACHE_CONFIG = {
  staleTime: 10 * 60 * 1000,        // 10 minutes (increased from 2 minutes)
  gcTime: 30 * 60 * 1000,           // 30 minutes garbage collection
  refetchOnWindowFocus: false,      // No automatic refresh on focus
  refetchInterval: false as const,  // No periodic refresh
  retry: 2,                         // Reduced retries (from 3)
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000)
};

// Hierarchical cache keys for better cache management
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

/**
 * Fetch availability for a specific month using optimized API
 */
async function fetchOptimizedAvailability(
  apartmentSlug: string,
  month: Date,
  guests: number,
  children = 0
): Promise<OptimizedAvailabilityResponse> {
  const startDate = format(month, 'yyyy-MM-01');
  const endDate = format(addMonths(month, 1), 'yyyy-MM-01');
  
  const params = new URLSearchParams({
    apartment: apartmentSlug,
    checkIn: startDate,
    checkOut: endDate,
    guests: guests.toString(),
    children: children.toString()
  });

  const response = await fetch(`/api/beds24/availability?${params}`);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Main hook for optimized availability data
 */
export function useOptimizedAvailability({
  apartmentSlug,
  month,
  guests,
  children = 0
}: OptimizedAvailabilityRequest) {
  const queryKey = QUERY_KEYS.availability(apartmentSlug, month, guests);
  
  return useQuery({
    queryKey,
    queryFn: () => fetchOptimizedAvailability(apartmentSlug, month, guests, children),
    ...CACHE_CONFIG,
    enabled: !!apartmentSlug && !!month
  });
}

/**
 * Hook for prefetching adjacent months in background
 */
export function useAvailabilityPrefetch(
  apartmentSlug: string,
  currentMonth: Date,
  guests: number,
  children = 0
) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!apartmentSlug || !currentMonth) return;
    
    const prefetchAdjacentMonths = async () => {
      const prevMonth = subMonths(currentMonth, 1);
      const nextMonth = addMonths(currentMonth, 1);
      
      console.log(`🔄 Prefetching adjacent months for ${apartmentSlug}:`, {
        prev: format(prevMonth, 'yyyy-MM'),
        next: format(nextMonth, 'yyyy-MM')
      });
      
      // Prefetch previous and next month in parallel
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.availability(apartmentSlug, prevMonth, guests),
          queryFn: () => fetchOptimizedAvailability(apartmentSlug, prevMonth, guests, children),
          staleTime: CACHE_CONFIG.staleTime
        }),
        queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.availability(apartmentSlug, nextMonth, guests),
          queryFn: () => fetchOptimizedAvailability(apartmentSlug, nextMonth, guests, children),
          staleTime: CACHE_CONFIG.staleTime
        })
      ]);
      
      console.log(`✅ Prefetch completed for ${apartmentSlug}`);
    };
    
    // Prefetch after 2 seconds to not block UI
    const timer = setTimeout(prefetchAdjacentMonths, 2000);
    return () => clearTimeout(timer);
  }, [apartmentSlug, currentMonth, guests, children, queryClient]);
}

/**
 * Hook for batch availability fetching (multiple apartments)
 */
export function useBatchAvailability(
  apartments: Array<{ slug: string; propId: string; roomId: string }>,
  startDate: string,
  endDate: string,
  adults: number,
  children = 0
) {
  const queryKey = ['batch-availability', apartments.map(a => a.slug).join(','), startDate, endDate, adults, children];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch('/api/beds24/batch-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apartments,
          startDate,
          endDate,
          adults,
          children
        })
      });
      
      if (!response.ok) {
        throw new Error(`Batch API error: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    },
    ...CACHE_CONFIG,
    enabled: apartments.length > 0 && !!startDate && !!endDate
  });
}

/**
 * Utility function for optimistic navigation
 */
export function useOptimisticNavigation() {
  const queryClient = useQueryClient();
  
  return {
    navigateMonth: (
      apartmentSlug: string,
      currentMonth: Date,
      direction: 'prev' | 'next',
      guests: number,
      onNavigate: (newMonth: Date) => void
    ) => {
      const newMonth = direction === 'prev' 
        ? subMonths(currentMonth, 1) 
        : addMonths(currentMonth, 1);
      
      // Immediately update UI
      onNavigate(newMonth);
      
      // Check if data is already cached
      const queryKey = QUERY_KEYS.availability(apartmentSlug, newMonth, guests);
      const cachedData = queryClient.getQueryData(queryKey);
      
      if (!cachedData) {
        // If not cached, invalidate to trigger fresh fetch
        console.log(`🔄 Invalidating cache for ${format(newMonth, 'yyyy-MM')}`);
        queryClient.invalidateQueries({ queryKey });
      } else {
        console.log(`🎯 Using cached data for ${format(newMonth, 'yyyy-MM')}`);
      }
    }
  };
}
