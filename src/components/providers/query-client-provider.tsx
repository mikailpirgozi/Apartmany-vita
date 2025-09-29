"use client";

import { QueryClient, QueryClientProvider as TanStackQueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

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
      {/* ReactQueryDevtools DISABLED to prevent hydration issues */}
      {/* Use browser extension instead: https://react-query.tanstack.com/devtools#devtools-in-production */}
    </TanStackQueryClientProvider>
  );
}
