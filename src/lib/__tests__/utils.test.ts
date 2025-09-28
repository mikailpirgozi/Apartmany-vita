/**
 * Utils Module Tests
 * Tests for utility functions and helpers
 */

import { describe, it, expect } from 'vitest';
import { cn, formatPrice, formatDate, slugify, validateEmail, debounce } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      const result = cn('class1', 'class2', 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'conditional', false && 'hidden');
      expect(result).toBe('base conditional');
    });

    it('should handle undefined and null values', () => {
      const result = cn('base', undefined, null, 'valid');
      expect(result).toBe('base valid');
    });

    it('should handle empty strings', () => {
      const result = cn('base', '', 'valid');
      expect(result).toBe('base valid');
    });
  });

  describe('formatPrice', () => {
    it('should format price in EUR', () => {
      const result = formatPrice(100);
      expect(result).toBe('100,00 €');
    });

    it('should format price with decimals', () => {
      const result = formatPrice(99.99);
      expect(result).toBe('99,99 €');
    });

    it('should handle zero price', () => {
      const result = formatPrice(0);
      expect(result).toBe('0,00 €');
    });

    it('should handle large numbers', () => {
      const result = formatPrice(1000);
      expect(result).toBe('1 000,00 €');
    });

    it('should handle negative prices', () => {
      const result = formatPrice(-50);
      expect(result).toBe('-50,00 €');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);
      expect(result).toBe('15. 1. 2024');
    });

    it('should handle different date formats', () => {
      const date = new Date('2024-12-25');
      const result = formatDate(date);
      expect(result).toBe('25. 12. 2024');
    });

    it('should handle single digit months and days', () => {
      const date = new Date('2024-01-05');
      const result = formatDate(date);
      expect(result).toBe('5. 1. 2024');
    });
  });

  describe('slugify', () => {
    it('should convert text to slug', () => {
      const result = slugify('Test Apartment Name');
      expect(result).toBe('test-apartment-name');
    });

    it('should handle special characters', () => {
      const result = slugify('Apartment with Special Characters!');
      expect(result).toBe('apartment-with-special-characters');
    });

    it('should handle accented characters', () => {
      const result = slugify('Apartmán s diakritikou');
      expect(result).toBe('apartman-s-diakritikou');
    });

    it('should handle multiple spaces', () => {
      const result = slugify('Multiple    Spaces');
      expect(result).toBe('multiple-spaces');
    });

    it('should handle empty string', () => {
      const result = slugify('');
      expect(result).toBe('');
    });

    it('should handle only special characters', () => {
      const result = slugify('!@#$%^&*()');
      expect(result).toBe('');
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
      expect(validateEmail('')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validateEmail('test@example')).toBe(false);
      expect(validateEmail('test@.com')).toBe(false);
      expect(validateEmail('.test@example.com')).toBe(false);
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', (done) => {
      let callCount = 0;
      const debouncedFn = debounce(() => {
        callCount++;
      }, 100);

      // Call multiple times quickly
      debouncedFn();
      debouncedFn();
      debouncedFn();

      // Should only be called once after delay
      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 150);
    });

    it('should handle multiple debounced calls', (done) => {
      let callCount = 0;
      const debouncedFn = debounce(() => {
        callCount++;
      }, 50);

      debouncedFn();
      
      setTimeout(() => {
        debouncedFn();
      }, 100);

      setTimeout(() => {
        expect(callCount).toBe(2);
        done();
      }, 200);
    });

    it('should pass arguments correctly', (done) => {
      let receivedArgs: any[] = [];
      const debouncedFn = debounce((...args: any[]) => {
        receivedArgs = args;
      }, 50);

      debouncedFn('arg1', 'arg2', 123);

      setTimeout(() => {
        expect(receivedArgs).toEqual(['arg1', 'arg2', 123]);
        done();
      }, 100);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid date in formatDate', () => {
      const invalidDate = new Date('invalid');
      const result = formatDate(invalidDate);
      expect(result).toBe('Invalid Date');
    });

    it('should handle null/undefined in formatPrice', () => {
      expect(() => formatPrice(null as any)).toThrow();
      expect(() => formatPrice(undefined as any)).toThrow();
    });

    it('should handle null/undefined in slugify', () => {
      expect(() => slugify(null as any)).toThrow();
      expect(() => slugify(undefined as any)).toThrow();
    });
  });

  describe('Performance', () => {
    it('should handle large number of class names efficiently', () => {
      const start = performance.now();
      const classes = Array.from({ length: 1000 }, (_, i) => `class-${i}`);
      cn(...classes);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(10); // Should complete in less than 10ms
    });

    it('should handle debounce with high frequency calls', (done) => {
      let callCount = 0;
      const debouncedFn = debounce(() => {
        callCount++;
      }, 10);

      // Call 100 times quickly
      for (let i = 0; i < 100; i++) {
        debouncedFn();
      }

      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 50);
    });
  });
});
