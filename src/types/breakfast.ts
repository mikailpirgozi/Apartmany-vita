import { Breakfast, BreakfastCategory, BreakfastOrder } from '@prisma/client'

export type { Breakfast, BreakfastCategory, BreakfastOrder }

export interface BreakfastWithDetails extends Breakfast {
  categoryLabel: string
  allergenLabels: string[]
}

export interface BreakfastFormData {
  name: string
  slug: string
  description: string
  price: number
  weight?: string
  images: string[]
  category: BreakfastCategory
  allergens: string[]
  isActive: boolean
  sortOrder: number
  guestPrice?: number
}

export interface BreakfastOrderFormData {
  bookingId: string
  adults: number
  children: number
  adultPrice: number // 9.90
  childPrice: number // 5.90
  delivery: boolean
  specialRequests?: string
}

export const BREAKFAST_CATEGORIES = {
  BREAD_AND_EGGS: 'Chlieb a vajíčka',
  SWEET: 'Sladké raňajky',
  SAVORY: 'Slané raňajky',
  DRINKS: 'Drinky',
  SNACKS: 'Celodenné snacky',
} as const

export const ALLERGEN_LABELS: Record<string, string> = {
  '1': 'Obilniny obsahujúce lepok',
  '2': 'Kôrovce',
  '3': 'Vajcia',
  '4': 'Ryby',
  '5': 'Arašidy',
  '6': 'Sójové bôby',
  '7': 'Mlieko',
  '8': 'Orechy',
  '9': 'Zeler',
  '10': 'Horčica',
  '11': 'Sezamové semená',
  '12': 'Oxid siričitý a siričitany',
  '13': 'Vlčí bôb',
  '14': 'Mäkkýše',
}

export const BREAKFAST_HOURS = {
  WEEKDAY: {
    start: '7:30',
    end: '13:00',
    label: 'Po-Pi: 7:30-13:00',
  },
  SATURDAY: {
    start: '8:00',
    end: '13:00',
    label: 'So: 8:00-13:00',
  },
  SUNDAY: {
    start: '9:00',
    end: '13:00',
    label: 'Ne: 9:00-13:00',
  },
}

export const GUEST_PRICING = {
  ADULT: 9.90,
  CHILD: 5.90,
  CURRENCY: '€',
  LABEL: 'Pre hostí apartmánov',
}
