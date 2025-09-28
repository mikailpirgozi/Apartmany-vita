/**
 * Working Validations Tests
 * Tests for actual validation schemas that exist
 */

import { describe, it, expect } from 'vitest';
import { 
  signInSchema, 
  signUpSchema, 
  profileSchema, 
  bookingSearchSchema, 
  guestInfoSchema, 
  newsletterSchema, 
  contactSchema 
} from '@/lib/validations';

describe('Validation Schemas', () => {
  describe('Sign In Schema', () => {
    it('should validate correct sign in data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const result = signInSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      };

      const result = signInSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123'
      };

      const result = signInSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Sign Up Schema', () => {
    it('should validate correct sign up data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const result = signUpSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'different123'
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short name', () => {
      const invalidData = {
        name: 'J',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Profile Schema', () => {
    it('should validate correct profile data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+421123456789'
      };

      const result = profileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should handle optional fields', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      const result = profileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Booking Search Schema', () => {
    it('should validate correct booking search data', () => {
      const validData = {
        checkIn: new Date('2024-01-15'),
        checkOut: new Date('2024-01-20'),
        guests: 2,
        children: 1
      };

      const result = bookingSearchSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date range', () => {
      const invalidData = {
        checkIn: new Date('2024-01-20'),
        checkOut: new Date('2024-01-15'),
        guests: 2,
        children: 0
      };

      const result = bookingSearchSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject too many guests', () => {
      const invalidData = {
        checkIn: new Date('2024-01-15'),
        checkOut: new Date('2024-01-20'),
        guests: 10,
        children: 0
      };

      const result = bookingSearchSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Guest Info Schema', () => {
    it('should validate correct guest info data', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+421123456789',
        specialRequests: 'Late check-in please'
      };

      const result = guestInfoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should handle optional special requests', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+421123456789'
      };

      const result = guestInfoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject short names', () => {
      const invalidData = {
        firstName: 'J',
        lastName: 'D',
        email: 'john@example.com',
        phone: '+421123456789'
      };

      const result = guestInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Newsletter Schema', () => {
    it('should validate correct email', () => {
      const validData = {
        email: 'test@example.com'
      };

      const result = newsletterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email'
      };

      const result = newsletterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Contact Schema', () => {
    it('should validate correct contact data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'This is a test message with enough characters'
      };

      const result = contactSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject short message', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'Hi'
      };

      const result = contactSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short subject', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Hi',
        message: 'This is a test message with enough characters'
      };

      const result = contactSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
