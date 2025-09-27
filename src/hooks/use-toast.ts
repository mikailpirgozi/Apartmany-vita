'use client'

import { useState, useCallback } from 'react'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

interface ToastState {
  toasts: Toast[]
}

let toastCounter = 0

const toastListeners: Array<(toasts: Toast[]) => void> = []
let toastState: ToastState = { toasts: [] }

const addToast = (toast: Omit<Toast, 'id'>) => {
  const id = (++toastCounter).toString()
  const newToast: Toast = {
    id,
    duration: 5000,
    ...toast,
  }

  toastState.toasts = [...toastState.toasts, newToast]
  toastListeners.forEach(listener => listener(toastState.toasts))

  // Auto remove after duration
  if (newToast.duration && newToast.duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, newToast.duration)
  }

  return id
}

const removeToast = (id: string) => {
  toastState.toasts = toastState.toasts.filter(toast => toast.id !== id)
  toastListeners.forEach(listener => listener(toastState.toasts))
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(toastState.toasts)

  const subscribe = useCallback((listener: (toasts: Toast[]) => void) => {
    toastListeners.push(listener)
    return () => {
      const index = toastListeners.indexOf(listener)
      if (index > -1) {
        toastListeners.splice(index, 1)
      }
    }
  }, [])

  // Subscribe to toast updates
  useState(() => {
    const unsubscribe = subscribe(setToasts)
    return unsubscribe
  })

  const toast = useCallback((props: Omit<Toast, 'id'>) => {
    return addToast(props)
  }, [])

  const dismiss = useCallback((id: string) => {
    removeToast(id)
  }, [])

  return {
    toasts,
    toast,
    dismiss,
  }
}
