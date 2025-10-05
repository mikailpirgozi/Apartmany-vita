'use client'

import { useState } from 'react'
import { BreakfastEditor } from './breakfast-editor'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { BreakfastCategory } from '@prisma/client'

interface BreakfastData {
  id: string
  name: string
  slug: string
  description: string
  price: string
  weight: string | null
  images: string[]
  category: BreakfastCategory
  allergens: string[]
  isActive: boolean
  sortOrder: number
  guestPrice: string | null
}

interface AdminBreakfastListProps {
  breakfasts: BreakfastData[]
}

export function AdminBreakfastList({ breakfasts: initialBreakfasts }: AdminBreakfastListProps) {
  const [breakfasts, setBreakfasts] = useState(initialBreakfasts)
  const [showNewForm, setShowNewForm] = useState(false)

  const handleBreakfastUpdate = (updatedBreakfast: BreakfastData) => {
    setBreakfasts(prev => 
      prev.map(b => b.id === updatedBreakfast.id ? updatedBreakfast : b)
    )
  }

  const handleBreakfastDelete = (id: string) => {
    setBreakfasts(prev => prev.filter(b => b.id !== id))
  }

  const handleBreakfastCreate = (newBreakfast: BreakfastData) => {
    setBreakfasts(prev => [...prev, newBreakfast])
    setShowNewForm(false)
  }

  // Group by category
  const categories = [
    { key: 'BREAD_AND_EGGS', label: 'Chlieb a vajíčka' },
    { key: 'SWEET', label: 'Sladké raňajky' },
    { key: 'SAVORY', label: 'Slané raňajky' },
    { key: 'DRINKS', label: 'Drinky' },
    { key: 'SNACKS', label: 'Celodenné snacky' },
  ]

  return (
    <div className="space-y-8">
      {/* Add New Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowNewForm(!showNewForm)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Pridať novú položku
        </Button>
      </div>

      {/* New Breakfast Form */}
      {showNewForm && (
        <div className="border-2 border-primary rounded-lg p-6 bg-primary/5">
          <h3 className="text-xl font-bold mb-4">Nová položka menu</h3>
          <BreakfastEditor
            onSave={handleBreakfastCreate}
            onCancel={() => setShowNewForm(false)}
          />
        </div>
      )}

      {/* Breakfasts by Category */}
      {categories.map(category => {
        const categoryBreakfasts = breakfasts.filter(b => b.category === category.key)
        
        if (categoryBreakfasts.length === 0) return null

        return (
          <div key={category.key} className="space-y-4">
            <h2 className="text-2xl font-bold text-primary border-b pb-2">
              {category.label} ({categoryBreakfasts.length})
            </h2>
            <div className="space-y-4">
              {categoryBreakfasts.map((breakfast) => (
                <BreakfastEditor
                  key={breakfast.id}
                  breakfast={breakfast}
                  onUpdate={handleBreakfastUpdate}
                  onDelete={handleBreakfastDelete}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
