'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

/**
 * Hydration-safe session hook that prevents hydration mismatches
 * by ensuring consistent rendering between server and client
 */
export function useSessionHydrationSafe() {
  const { data: session, status } = useSession()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // During hydration, always return loading state to prevent mismatch
  if (!isHydrated) {
    return {
      data: null,
      status: 'loading' as const,
      isHydrated: false
    }
  }

  return {
    data: session,
    status,
    isHydrated: true
  }
}
