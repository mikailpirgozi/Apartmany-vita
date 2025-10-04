/**
 * Simple Validation Tests
 * Basic tests for validation functions
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Simple validation schemas
const apartmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  price: z.number().min(0, 'Price must be positive'),
  maxGuests: z.number().min(1, 'Max guests must be at least 1'),
  bedrooms: z.number().min(0, 'Bedrooms must be non-negative'),
  bathrooms: z.number().min(0, 'Bathrooms must be non-negative'),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

const bookingSchema = z.object({
  apartmentSlug: z.string().min(1, 'Apartment slug is required'),
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  guests: z.number().min(1, 'Guests must be at least 1'),
  guestInfo: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(1, 'Phone is required'),
  }),
  totalPrice: z.number().min(0, 'Total price must be non-negative'),
  status: z.enum(['pending', 'confirmed', 'cancelled']).default('pending'),
});

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  phone: z.string().optional(),
});

describe('Validation Schemas', () => {
  describe('Apartment Schema', () => {
    it('should validate correct apartment data', () => {
      const validApartment = {
        name: 'Test Apartment',
        slug: 'test-apartment',
        price: 100,
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 1,
        amenities: ['wifi', 'parking'],
        images: ['image1.jpg', 'image2.jpg'],
        isActive: true,
      };

      const result = apartmentSchema.safeParse(validApartment);
      expect(result.success).toBe(true);
    });

    it('should reject invalid apartment data', () => {
      const invalidApartment = {
        name: '', // Empty name
        slug: 'test-apartment',
        price: -100, // Negative price
        maxGuests: 0, // Zero guests
      };

      const result = apartmentSchema.safeParse(invalidApartment);
      expect(result.success).toBe(false);
    });

    it('should validate required fields', () => {
      const incompleteApartment = {
        name: 'Test Apartment',
        // Missing required fields
      };

      const result = apartmentSchema.safeParse(incompleteApartment);
      expect(result.success).toBe(false);
    });
  });

  describe('Booking Schema', () => {
    it('should validate correct booking data', () => {
      const validBooking = {
        apartmentSlug: 'test-apartment',
        checkIn: '2024-01-15',
        checkOut: '2024-01-20',
        guests: 2,
        guestInfo: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+421123456789',
        },
        totalPrice: 500,
        status: 'confirmed' as const,
      };

      const result = bookingSchema.safeParse(validBooking);
      expect(result.success).toBe(true);
    });

    it('should validate guest information', () => {
      const bookingWithInvalidEmail = {
        apartmentSlug: 'test-apartment',
        checkIn: '2024-01-15',
        checkOut: '2024-01-20',
        guests: 2,
        guestInfo: {
          name: 'John Doe',
          email: 'invalid-email', // Invalid email
          phone: '+421123456789',
        },
        totalPrice: 500,
        status: 'confirmed' as const,
      };

      const result = bookingSchema.safeParse(bookingWithInvalidEmail);
      expect(result.success).toBe(false);
    });
  });

  describe('Contact Schema', () => {
    it('should validate correct contact data', () => {
      const validContact = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+421123456789',
        subject: 'Test Subject',
        message: 'This is a test message',
      };

      const result = contactSchema.safeParse(validContact);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidContact = {
        name: 'John Doe',
        email: 'invalid-email',
        subject: 'Test Subject',
        message: 'This is a test message',
      };

      const result = contactSchema.safeParse(invalidContact);
      expect(result.success).toBe(false);
    });

    it('should require minimum message length', () => {
      const shortMessageContact = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'Hi', // Too short
      };

      const result = contactSchema.safeParse(shortMessageContact);
      expect(result.success).toBe(false);
    });
  });

  describe('Schema Integration', () => {
    it('should handle nested object validation', () => {
      const complexData = {
        apartment: {
          name: 'Test Apartment',
          slug: 'test-apartment',
          price: 100,
          maxGuests: 4,
          bedrooms: 2,
          bathrooms: 1,
          amenities: ['wifi'],
          images: ['image1.jpg'],
          isActive: true,
        },
        booking: {
          apartmentSlug: 'test-apartment',
          checkIn: '2024-01-15',
          checkOut: '2024-01-20',
          guests: 2,
          guestInfo: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+421123456789',
          },
          totalPrice: 500,
          status: 'confirmed' as const,
        },
      };

      const apartmentResult = apartmentSchema.safeParse(complexData.apartment);
      const bookingResult = bookingSchema.safeParse(complexData.booking);

      expect(apartmentResult.success).toBe(true);
      expect(bookingResult.success).toBe(true);
    });

    it('should provide detailed error messages', () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        subject: 'Test',
        message: 'Hi',
      };

      const result = contactSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
        expect(result.error.issues[0]?.path).toContain('name');
      }
    });
  });
});
