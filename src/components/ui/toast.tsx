'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from './button'
import { useToast, Toast } from '@/hooks/use-toast'

export function ToastProvider() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => dismiss(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onDismiss: () => void
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onDismiss, 150) // Allow animation to complete
      }, toast.duration)

      return () => clearTimeout(timer)
    }
  }, [toast.duration, onDismiss])

  const getIcon = () => {
    switch (toast.variant) {
      case 'destructive':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />
    }
  }

  const getStyles = () => {
    switch (toast.variant) {
      case 'destructive':
        return 'border-red-200 bg-red-50 text-red-900'
      default:
        return 'border-green-200 bg-green-50 text-green-900'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.3 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        x: isVisible ? 0 : 300, 
        scale: isVisible ? 1 : 0.3 
      }}
      exit={{ opacity: 0, x: 300, scale: 0.3 }}
      transition={{ duration: 0.2 }}
      className={`
        relative flex items-start gap-3 rounded-lg border p-4 shadow-lg
        ${getStyles()}
      `}
    >
      {getIcon()}
      
      <div className="flex-1 min-w-0">
        {toast.title && (
          <div className="font-semibold text-sm mb-1">
            {toast.title}
          </div>
        )}
        {toast.description && (
          <div className="text-sm opacity-90">
            {toast.description}
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:bg-black/10"
        onClick={() => {
          setIsVisible(false)
          setTimeout(onDismiss, 150)
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    </motion.div>
  )
}
