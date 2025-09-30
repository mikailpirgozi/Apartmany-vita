'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function ResetImagesButton() {
  const [isResetting, setIsResetting] = useState(false)

  const handleReset = async () => {
    if (!confirm('Naozaj chceš vymazať VŠETKY fotky zo všetkých apartmánov? Táto akcia sa nedá vrátiť späť.')) {
      return
    }

    setIsResetting(true)

    try {
      const response = await fetch('/api/admin/reset-images', {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Reset failed')
      }

      const data = await response.json()
      toast.success(data.message)
      
      // Refresh page to show empty images
      setTimeout(() => {
        window.location.reload()
      }, 1000)

    } catch (error) {
      console.error('Reset error:', error)
      toast.error(error instanceof Error ? error.message : 'Chyba pri mazaní fotiek')
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleReset}
      disabled={isResetting}
    >
      {isResetting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Mažem...
        </>
      ) : (
        <>
          <Trash2 className="mr-2 h-4 w-4" />
          Vymazať všetky fotky
        </>
      )}
    </Button>
  )
}

