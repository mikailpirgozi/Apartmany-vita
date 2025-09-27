import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ApartmentCard } from '../apartment-card'
import type { Apartment } from '@/types'

const mockApartment: Apartment = {
  id: '1',
  name: 'Malý Apartmán',
  slug: 'maly-apartman',
  description: 'Útulný apartmán pre 2 osoby v centre Trenčína',
  floor: 2,
  size: 30,
  maxGuests: 2,
  maxChildren: 1,
  images: ['/apartment1.jpg', '/apartment1-2.jpg'],
  amenities: ['wifi', 'kitchen', 'tv', 'parking'],
  basePrice: 45,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('ApartmentCard', () => {
  it('renders apartment information correctly', () => {
    const { container } = render(<ApartmentCard apartment={mockApartment} />)
    
    expect(container.querySelector('h3')?.textContent).toBe('Malý Apartmán')
    expect(container.textContent).toContain('30m²')
    expect(container.textContent).toContain('Max 2 osôb')
    expect(container.textContent).toContain('€45')
    expect(container.textContent).toContain('/noc')
  })

  it('displays apartment image with correct alt text', () => {
    const { container } = render(<ApartmentCard apartment={mockApartment} />)
    
    const image = container.querySelector('img')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('alt', 'Malý Apartmán')
    expect(image).toHaveAttribute('src', '/apartment1.jpg')
  })

  it('shows floor information', () => {
    const { container } = render(<ApartmentCard apartment={mockApartment} />)
    
    expect(container.textContent).toContain('2. poschodie')
  })

  it('displays amenities count', () => {
    const { container } = render(<ApartmentCard apartment={mockApartment} />)
    
    expect(container.textContent).toContain('4 vybavenia')
  })

  it('renders booking button', () => {
    const { container } = render(<ApartmentCard apartment={mockApartment} />)
    
    const bookingButton = container.querySelector('button')
    expect(bookingButton).toBeInTheDocument()
    expect(bookingButton?.textContent).toMatch(/rezervovať/i)
  })

  it('applies hover animation classes', () => {
    const { container } = render(<ApartmentCard apartment={mockApartment} />)
    
    const card = container.querySelector('[data-testid="apartment-card"]')
    expect(card).toHaveClass('transition-all', 'hover:shadow-lg')
  })

  it('shows compact variant when specified', () => {
    const { container } = render(<ApartmentCard apartment={mockApartment} variant="compact" />)
    
    const card = container.querySelector('[data-testid="apartment-card"]')
    expect(card).toHaveClass('compact')
  })
})
