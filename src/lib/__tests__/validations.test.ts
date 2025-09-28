/**
 * Validation Module Tests
 * Tests for Zod schemas and validation functions
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  apartmentSchema,
  bookingSchema,
  contactSchema,
  newsletterSchema,
  reviewSchema,
  userSchema,
} from '@/lib/validations';

describe('Validation Schemas', () => {
  describe('Apartment Schema', () => {
    it('should validate correct apartment data', () => {
      const validApartment = {
        name: 'Test Apartment',
        slug: 'test-apartment',
        description: 'A beautiful test apartment',
        price: 100,
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 1,
        amenities: ['wifi', 'parking'],
        images: ['image1.jpg', 'image2.jpg'],
        location: {
          address: 'Test Street 123',
          city: 'Test City',
          country: 'Test Country',
          coordinates: {
            lat: 48.1486,
            lng: 17.1077,
          },
        },
        beds24PropertyId: '12345',
        beds24RoomId: '67890',
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
        status: 'confirmed',
      };

      const result = bookingSchema.safeParse(validBooking);
      expect(result.success).toBe(true);
    });

    it('should reject invalid booking dates', () => {
      const invalidBooking = {
        apartmentSlug: 'test-apartment',
        checkIn: '2024-01-20',
        checkOut: '2024-01-15', // Check-out before check-in
        guests: 2,
        guestInfo: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+421123456789',
        },
        totalPrice: 500,
        status: 'confirmed',
      };

      const result = bookingSchema.safeParse(invalidBooking);
      expect(result.success).toBe(false);
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
        status: 'confirmed',
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

  describe('Newsletter Schema', () => {
    it('should validate correct email', () => {
      const validEmail = {
        email: 'test@example.com',
      };

      const result = newsletterSchema.safeParse(validEmail);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidEmail = {
        email: 'not-an-email',
      };

      const result = newsletterSchema.safeParse(invalidEmail);
      expect(result.success).toBe(false);
    });

    it('should reject empty email', () => {
      const emptyEmail = {
        email: '',
      };

      const result = newsletterSchema.safeParse(emptyEmail);
      expect(result.success).toBe(false);
    });
  });

  describe('Review Schema', () => {
    it('should validate correct review data', () => {
      const validReview = {
        apartmentSlug: 'test-apartment',
        rating: 5,
        title: 'Great stay!',
        comment: 'We had an amazing time at this apartment.',
        guestName: 'John Doe',
        guestEmail: 'john@example.com',
      };

      const result = reviewSchema.safeParse(validReview);
      expect(result.success).toBe(true);
    });

    it('should validate rating range', () => {
      const invalidRating = {
        apartmentSlug: 'test-apartment',
        rating: 6, // Rating out of range
        title: 'Great stay!',
        comment: 'We had an amazing time at this apartment.',
        guestName: 'John Doe',
        guestEmail: 'john@example.com',
      };

      const result = reviewSchema.safeParse(invalidRating);
      expect(result.success).toBe(false);
    });

    it('should require minimum comment length', () => {
      const shortComment = {
        apartmentSlug: 'test-apartment',
        rating: 5,
        title: 'Great stay!',
        comment: 'Good', // Too short
        guestName: 'John Doe',
        guestEmail: 'john@example.com',
      };

      const result = reviewSchema.safeParse(shortComment);
      expect(result.success).toBe(false);
    });
  });

  describe('User Schema', () => {
    it('should validate correct user data', () => {
      const validUser = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+421123456789',
        preferences: {
          newsletter: true,
          notifications: false,
        },
      };

      const result = userSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('should validate name requirements', () => {
      const shortName = {
        name: 'J', // Too short
        email: 'john@example.com',
      };

      const result = userSchema.safeParse(shortName);
      expect(result.success).toBe(false);
    });

    it('should validate phone format', () => {
      const invalidPhone = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123', // Invalid phone format
      };

      const result = userSchema.safeParse(invalidPhone);
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
          location: {
            address: 'Test Street 123',
            city: 'Test City',
            country: 'Test Country',
            coordinates: {
              lat: 48.1486,
              lng: 17.1077,
            },
          },
          beds24PropertyId: '12345',
          beds24RoomId: '67890',
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
          status: 'confirmed',
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
        rating: 10,
      };

      const result = reviewSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues).toHaveLength(4); // Multiple validation errors
        expect(result.error.issues[0].path).toContain('apartmentSlug');
        expect(result.error.issues[1].path).toContain('rating');
        expect(result.error.issues[2].path).toContain('guestEmail');
        expect(result.error.issues[3].path).toContain('comment');
      }
    });
  });
});
