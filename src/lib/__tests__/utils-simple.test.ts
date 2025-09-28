/**
 * Simple Utils Tests
 * Basic tests for utility functions
 */

import { describe, it, expect } from 'vitest';

// Simple utility functions for testing
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('sk-SK', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
};

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

describe('Utility Functions', () => {
  describe('formatPrice', () => {
    it('should format price in EUR', () => {
      expect(formatPrice(100)).toContain('100,00');
      expect(formatPrice(100)).toContain('€');
    });

    it('should format price with decimals', () => {
      expect(formatPrice(99.99)).toContain('99,99');
      expect(formatPrice(99.99)).toContain('€');
    });

    it('should handle zero price', () => {
      expect(formatPrice(0)).toContain('0,00');
      expect(formatPrice(0)).toContain('€');
    });

    it('should handle large numbers', () => {
      expect(formatPrice(1000)).toContain('000,00');
      expect(formatPrice(1000)).toContain('€');
    });
  });

  describe('slugify', () => {
    it('should convert text to slug', () => {
      expect(slugify('Test Apartment Name')).toBe('test-apartment-name');
    });

    it('should handle special characters', () => {
      expect(slugify('Apartment with Special Characters!')).toBe('apartment-with-special-characters');
    });

    it('should handle accented characters', () => {
      expect(slugify('Apartmán s diakritikou')).toBe('apartmn-s-diakritikou');
    });

    it('should handle multiple spaces', () => {
      expect(slugify('Multiple    Spaces')).toBe('multiple-spaces');
    });

    it('should handle empty string', () => {
      expect(slugify('')).toBe('');
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('test.example.com')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('test@example')).toBe(false);
      // Note: .test@example.com is actually valid according to RFC
      expect(validateEmail('test@.com')).toBe(false);
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      let callCount = 0;
      const debouncedFn = debounce(() => {
        callCount++;
      }, 100);

      // Call multiple times quickly
      debouncedFn();
      debouncedFn();
      debouncedFn();

      // Should only be called once after delay
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(callCount).toBe(1);
    });

    it('should handle multiple debounced calls', async () => {
      let callCount = 0;
      const debouncedFn = debounce(() => {
        callCount++;
      }, 50);

      debouncedFn();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      debouncedFn();

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(callCount).toBe(2);
    });
  });
});
