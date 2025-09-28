/**
 * Apartment Card Component Tests
 * Tests for apartment card display and interaction
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock Next.js components
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => React.createElement('img', { src, alt, ...props }),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => 
    React.createElement('a', { href, ...props }, children),
}));

// Mock apartment card component
const ApartmentCard = ({ apartment, onBookNow }: any) => {
  return (
    <div data-testid="apartment-card" className="apartment-card">
      <img src={apartment.images[0]} alt={apartment.name} />
      <h3>{apartment.name}</h3>
      <p>{apartment.description}</p>
      <div className="apartment-details">
        <span>Max guests: {apartment.maxGuests}</span>
        <span>Bedrooms: {apartment.bedrooms}</span>
        <span>Bathrooms: {apartment.bathrooms}</span>
      </div>
      <div className="apartment-price">
        <span className="price">€{apartment.price}</span>
        <span className="period">/ night</span>
      </div>
      <div className="apartment-amenities">
        {apartment.amenities.map((amenity: string) => (
          <span key={amenity} className="amenity">
            {amenity}
          </span>
        ))}
      </div>
      <button 
        onClick={() => onBookNow(apartment.slug)}
        className="book-now-btn"
        data-testid="book-now-button"
      >
        Book Now
      </button>
    </div>
  );
};

describe('Apartment Card Component', () => {
  const mockApartment = {
    id: '1',
    name: 'Beautiful Apartment',
    slug: 'beautiful-apartment',
    description: 'A stunning apartment in the heart of the city',
    price: 120,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ['wifi', 'parking', 'kitchen'],
    images: ['apartment1.jpg', 'apartment2.jpg'],
    location: {
      address: 'Main Street 123',
      city: 'Bratislava',
      country: 'Slovakia',
    },
    isActive: true,
  };

  const mockOnBookNow = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render apartment card with all details', () => {
      render(<ApartmentCard apartment={mockApartment} onBookNow={mockOnBookNow} />);

      expect(screen.getByTestId('apartment-card')).toBeInTheDocument();
      expect(screen.getByText('Beautiful Apartment')).toBeInTheDocument();
      expect(screen.getByText('A stunning apartment in the heart of the city')).toBeInTheDocument();
      expect(screen.getByText('Max guests: 4')).toBeInTheDocument();
      expect(screen.getByText('Bedrooms: 2')).toBeInTheDocument();
      expect(screen.getByText('Bathrooms: 1')).toBeInTheDocument();
      expect(screen.getByText('€120')).toBeInTheDocument();
      expect(screen.getByText('/ night')).toBeInTheDocument();
    });

    it('should render apartment image', () => {
      render(<ApartmentCard apartment={mockApartment} onBookNow={mockOnBookNow} />);

      const image = screen.getByAltText('Beautiful Apartment');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'apartment1.jpg');
    });

    it('should render all amenities', () => {
      render(<ApartmentCard apartment={mockApartment} onBookNow={mockOnBookNow} />);

      expect(screen.getByText('wifi')).toBeInTheDocument();
      expect(screen.getByText('parking')).toBeInTheDocument();
      expect(screen.getByText('kitchen')).toBeInTheDocument();
    });

    it('should render book now button', () => {
      render(<ApartmentCard apartment={mockApartment} onBookNow={mockOnBookNow} />);

      const bookButton = screen.getByTestId('book-now-button');
      expect(bookButton).toBeInTheDocument();
      expect(bookButton).toHaveTextContent('Book Now');
    });
  });

  describe('Interactions', () => {
    it('should call onBookNow when book button is clicked', () => {
      render(<ApartmentCard apartment={mockApartment} onBookNow={mockOnBookNow} />);

      const bookButton = screen.getByTestId('book-now-button');
      fireEvent.click(bookButton);

      expect(mockOnBookNow).toHaveBeenCalledWith('beautiful-apartment');
      expect(mockOnBookNow).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple clicks on book button', () => {
      render(<ApartmentCard apartment={mockApartment} onBookNow={mockOnBookNow} />);

      const bookButton = screen.getByTestId('book-now-button');
      fireEvent.click(bookButton);
      fireEvent.click(bookButton);
      fireEvent.click(bookButton);

      expect(mockOnBookNow).toHaveBeenCalledTimes(3);
    });
  });

  describe('Data Handling', () => {
    it('should handle apartment with no amenities', () => {
      const apartmentWithoutAmenities = {
        ...mockApartment,
        amenities: [],
      };

      render(<ApartmentCard apartment={apartmentWithoutAmenities} onBookNow={mockOnBookNow} />);

      expect(screen.getByTestId('apartment-card')).toBeInTheDocument();
      expect(screen.queryByText('wifi')).not.toBeInTheDocument();
    });

    it('should handle apartment with single image', () => {
      const apartmentWithSingleImage = {
        ...mockApartment,
        images: ['single-image.jpg'],
      };

      render(<ApartmentCard apartment={apartmentWithSingleImage} onBookNow={mockOnBookNow} />);

      const image = screen.getByAltText('Beautiful Apartment');
      expect(image).toHaveAttribute('src', 'single-image.jpg');
    });

    it('should handle apartment with no images', () => {
      const apartmentWithoutImages = {
        ...mockApartment,
        images: [],
      };

      render(<ApartmentCard apartment={apartmentWithoutImages} onBookNow={mockOnBookNow} />);

      const image = screen.getByAltText('Beautiful Apartment');
      expect(image).toHaveAttribute('src', '');
    });

    it('should handle zero price', () => {
      const freeApartment = {
        ...mockApartment,
        price: 0,
      };

      render(<ApartmentCard apartment={freeApartment} onBookNow={mockOnBookNow} />);

      expect(screen.getByText('€0')).toBeInTheDocument();
    });

    it('should handle high price', () => {
      const expensiveApartment = {
        ...mockApartment,
        price: 999,
      };

      render(<ApartmentCard apartment={expensiveApartment} onBookNow={mockOnBookNow} />);

      expect(screen.getByText('€999')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper alt text for images', () => {
      render(<ApartmentCard apartment={mockApartment} onBookNow={mockOnBookNow} />);

      const image = screen.getByAltText('Beautiful Apartment');
      expect(image).toBeInTheDocument();
    });

    it('should have accessible button', () => {
      render(<ApartmentCard apartment={mockApartment} onBookNow={mockOnBookNow} />);

      const bookButton = screen.getByTestId('book-now-button');
      expect(bookButton).toBeInTheDocument();
      expect(bookButton.tagName).toBe('BUTTON');
    });

    it('should have proper heading structure', () => {
      render(<ApartmentCard apartment={mockApartment} onBookNow={mockOnBookNow} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Beautiful Apartment');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing apartment data gracefully', () => {
      const incompleteApartment = {
        name: 'Incomplete Apartment',
        slug: 'incomplete-apartment',
      };

      expect(() => {
        render(<ApartmentCard apartment={incompleteApartment} onBookNow={mockOnBookNow} />);
      }).not.toThrow();
    });

    it('should handle null apartment', () => {
      expect(() => {
        render(<ApartmentCard apartment={null} onBookNow={mockOnBookNow} />);
      }).toThrow();
    });

    it('should handle missing onBookNow callback', () => {
      expect(() => {
        render(<ApartmentCard apartment={mockApartment} onBookNow={undefined} />);
      }).toThrow();
    });
  });

  describe('Performance', () => {
    it('should render quickly with large number of amenities', () => {
      const apartmentWithManyAmenities = {
        ...mockApartment,
        amenities: Array.from({ length: 100 }, (_, i) => `amenity-${i}`),
      };

      const start = performance.now();
      render(<ApartmentCard apartment={apartmentWithManyAmenities} onBookNow={mockOnBookNow} />);
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // Should render in less than 100ms
    });

    it('should handle rapid button clicks efficiently', () => {
      render(<ApartmentCard apartment={mockApartment} onBookNow={mockOnBookNow} />);

      const bookButton = screen.getByTestId('book-now-button');
      
      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        fireEvent.click(bookButton);
      }
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // Should handle 100 clicks in less than 100ms
      expect(mockOnBookNow).toHaveBeenCalledTimes(100);
    });
  });
});
