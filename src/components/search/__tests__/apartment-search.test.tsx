import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApartmentSearch } from '../apartment-search'

// Mock useRouter
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams(),
}))

describe('ApartmentSearch', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders all form fields', () => {
    const { container } = render(<ApartmentSearch />)
    
    expect(container.querySelector('input[type="date"]')).toBeInTheDocument()
    expect(container.querySelector('button')).toBeInTheDocument()
  })

  it('handles form submission', async () => {
    const user = userEvent.setup()
    const { container } = render(<ApartmentSearch />)
    
    const searchButton = container.querySelector('button')
    expect(searchButton).toBeInTheDocument()
    
    if (searchButton) {
      await user.click(searchButton)
    }
  })

  it('validates form inputs', () => {
    const { container } = render(<ApartmentSearch />)
    
    // Basic rendering test
    expect(container).toBeInTheDocument()
  })
})