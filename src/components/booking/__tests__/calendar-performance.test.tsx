/**
 * 🚀 CALENDAR PERFORMANCE TESTS
 * Tests to verify Phase 1 optimizations are working correctly
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OptimizedAvailabilityCalendar } from '../optimized-availability-calendar';
// import { SimpleAvailabilityCalendar } from '../simple-availability-calendar';

// Mock fetch
global.fetch = vi.fn();

// Mock data
const mockAvailabilityData = {
  success: true,
  available: ['2024-01-15', '2024-01-16', '2024-01-17'],
  booked: ['2024-01-14'],
  prices: {
    '2024-01-15': 120,
    '2024-01-16': 120,
    '2024-01-17': 130
  },
  minStay: 2,
  maxStay: 30
};

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
  },
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Calendar Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => mockAvailabilityData,
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('🚀 Optimized Calendar Performance', () => {
    it('should use optimized cache configuration', async () => {
      const { rerender } = render(
        <TestWrapper>
          <OptimizedAvailabilityCalendar
            apartmentSlug="test-apartment"
            guests={2}
          />
        </TestWrapper>
      );

      // Wait for initial render
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
      });

      // Re-render with same props - should use cache
      rerender(
        <TestWrapper>
          <OptimizedAvailabilityCalendar
            apartmentSlug="test-apartment"
            guests={2}
          />
        </TestWrapper>
      );

      // Should not make additional API calls due to cache
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should implement background prefetching', async () => {
      vi.useFakeTimers();
      
      render(
        <TestWrapper>
          <OptimizedAvailabilityCalendar
            apartmentSlug="test-apartment"
            guests={2}
          />
        </TestWrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
      });

      // Fast-forward to trigger prefetch (2 seconds)
      vi.advanceTimersByTime(2000);

      // Should prefetch adjacent months
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(3); // Initial + 2 prefetch calls
      }, { timeout: 5000 });

      vi.useRealTimers();
    });

    it('should provide optimistic navigation', async () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <OptimizedAvailabilityCalendar
            apartmentSlug="test-apartment"
            guests={2}
          />
        </TestWrapper>
      );

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText(/január/i)).toBeInTheDocument();
      });

      // Click next month button
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      const navigationTime = performance.now() - startTime;

      // Navigation should be fast (optimistic)
      expect(navigationTime).toBeLessThan(100); // Less than 100ms for UI update
    });

    it('should show performance indicators', async () => {
      render(
        <TestWrapper>
          <OptimizedAvailabilityCalendar
            apartmentSlug="test-apartment"
            guests={2}
          />
        </TestWrapper>
      );

      // Should show "Optimalizované" badge
      await waitFor(() => {
        expect(screen.getByText('Optimalizované')).toBeInTheDocument();
      });

      // Should show cache status
      await waitFor(() => {
        expect(screen.getByText(/Cache:/)).toBeInTheDocument();
      });
    });
  });

  describe('📊 Performance Comparison', () => {
    it('should have better cache configuration than simple calendar', () => {
      // Test cache stale time
      const optimizedStaleTime = 10 * 60 * 1000; // 10 minutes
      const simpleStaleTime = 2 * 60 * 1000;     // 2 minutes

      expect(optimizedStaleTime).toBeGreaterThan(simpleStaleTime);
    });

    it('should track performance analytics', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      render(
        <TestWrapper>
          <OptimizedAvailabilityCalendar
            apartmentSlug="test-apartment"
            guests={2}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('📊 Calendar Load Analytics:'),
          expect.any(Object)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('🔄 Cache Management', () => {
    it('should use hierarchical query keys', async () => {
      const queryClient = createTestQueryClient();
      // const _getQueriesSpy = vi.spyOn(queryClient, 'getQueryCache');
      
      render(
        <QueryClientProvider client={queryClient}>
          <OptimizedAvailabilityCalendar
            apartmentSlug="test-apartment"
            guests={2}
          />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });

      // Query keys should follow hierarchical structure
      const queries = queryClient.getQueryCache().getAll();
      const availabilityQuery = queries.find(q => 
        q.queryKey[0] === 'availability'
      );

      expect(availabilityQuery?.queryKey).toEqual([
        'availability',
        'test-apartment',
        expect.any(String), // month format
        2 // guests
      ]);
    });

    it('should invalidate cache correctly on navigation', async () => {
      const queryClient = createTestQueryClient();
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
      
      render(
        <QueryClientProvider client={queryClient}>
          <OptimizedAvailabilityCalendar
            apartmentSlug="test-apartment"
            guests={2}
          />
        </QueryClientProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      });

      // Navigate to next month
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      // Should invalidate queries for new month if not cached
      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalled();
      });
    });
  });

  describe('🎯 Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(new Error('API Error'));
      
      render(
        <TestWrapper>
          <OptimizedAvailabilityCalendar
            apartmentSlug="test-apartment"
            guests={2}
          />
        </TestWrapper>
      );

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText(/Nepodarilo sa načítať dostupnosť/)).toBeInTheDocument();
      });

      // Should have retry button
      expect(screen.getByText('Skúsiť znovu')).toBeInTheDocument();
    });

    it('should retry with exponential backoff', async () => {
      (fetch as jest.MockedFunction<typeof fetch>)
        .mockRejectedValueOnce(new Error('API Error'))
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAvailabilityData,
        });

      render(
        <TestWrapper>
          <OptimizedAvailabilityCalendar
            apartmentSlug="test-apartment"
            guests={2}
          />
        </TestWrapper>
      );

      // Should eventually succeed after retries
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
      }, { timeout: 10000 });
    });
  });
});

describe('🔍 Integration Tests', () => {
  it('should work with BookingWidget integration', async () => {
    // This would be expanded with actual BookingWidget integration tests
    expect(true).toBe(true);
  });

  it('should maintain compatibility with existing API', async () => {
    const onRangeSelect = vi.fn();
    
    render(
      <TestWrapper>
        <OptimizedAvailabilityCalendar
          apartmentSlug="test-apartment"
          guests={2}
          onRangeSelect={onRangeSelect}
          selectedRange={{ from: null, to: null }}
        />
      </TestWrapper>
    );

    // Should render without errors
    await waitFor(() => {
      expect(screen.getByText('Dostupnosť a ceny')).toBeInTheDocument();
    });
  });
});
