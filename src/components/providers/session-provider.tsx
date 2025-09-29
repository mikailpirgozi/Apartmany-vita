'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider
      // Disable automatic session refetching to prevent hydration issues
      refetchInterval={0}
      refetchOnWindowFocus={false}
      // Ensure consistent behavior between server and client
      basePath="/api/auth"
    >
      {children}
    </SessionProvider>
  )
}
