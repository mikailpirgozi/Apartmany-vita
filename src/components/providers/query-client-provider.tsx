"use client";

import { QueryClient, QueryClientProvider as TanStackQueryClientProvider } from "@tanstack/react-query";
import { useState, lazy, Suspense, useEffect } from "react";

// Lazy load devtools only in development
const ReactQueryDevtools = lazy(() =>
  process.env.NODE_ENV === 'development'
    ? import("@tanstack/react-query-devtools").then(module => ({
        default: module.ReactQueryDevtools
      }))
    : Promise.resolve({ default: () => null })
);

// Client-only wrapper to prevent hydration mismatch
function ClientOnlyDevtools() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always return null during SSR and initial hydration
  if (!mounted || typeof window === 'undefined') {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <ReactQueryDevtools initialIsOpen={false} />
    </Suspense>
  );
}

interface QueryClientProviderProps {
  children: React.ReactNode;
}

export function QueryClientProvider({ children }: QueryClientProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            retry: (failureCount, error) => {
              // Don't retry on 4xx errors
              if (error instanceof Error && 'status' in error) {
                const status = (error as Error & { status: number }).status;
                if (status >= 400 && status < 500) {
                  return false;
                }
              }
              return failureCount < 3;
            },
          },
          mutations: {
            retry: false,
          },
        },
      })
  );

  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
      <ClientOnlyDevtools />
    </TanStackQueryClientProvider>
  );
}
