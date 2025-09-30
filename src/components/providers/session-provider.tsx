'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider
      // Re-enable session refetch to ensure OAuth callback works properly
      // Refetch session every 5 minutes
      refetchInterval={5 * 60}
      // Refetch when user returns to tab
      refetchOnWindowFocus={true}
      // Ensure consistent behavior between server and client
      basePath="/api/auth"
    >
      {children}
    </SessionProvider>
  )
}
