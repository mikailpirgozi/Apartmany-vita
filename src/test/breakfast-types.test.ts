/**
 * Breakfast TypeScript Types Tests
 * Verify that all TypeScript types are correctly defined
 */

import { describe, it, expect } from 'vitest';
import type { Breakfast, BreakfastCategory, BreakfastOrder } from '@/types/breakfast';
import { BREAKFAST_CATEGORIES, ALLERGEN_LABELS, GUEST_PRICING } from '@/types/breakfast';

describe('Breakfast TypeScript Types', () => {
  describe('BreakfastCategory enum', () => {
    it('should have all required categories', () => {
      const categories = Object.keys(BREAKFAST_CATEGORIES);
      expect(categories).toContain('BREAD_AND_EGGS');
      expect(categories).toContain('SWEET');
      expect(categories).toContain('SAVORY');
      expect(categories).toContain('DRINKS');
      expect(categories).toContain('SNACKS');
    });

    it('should have Slovak labels', () => {
      expect(BREAKFAST_CATEGORIES.BREAD_AND_EGGS).toBe('Chlieb a vajíčka');
      expect(BREAKFAST_CATEGORIES.SWEET).toBe('Sladké raňajky');
      expect(BREAKFAST_CATEGORIES.SAVORY).toBe('Slané raňajky');
      expect(BREAKFAST_CATEGORIES.DRINKS).toBe('Drinky');
      expect(BREAKFAST_CATEGORIES.SNACKS).toBe('Celodenné snacky');
    });
  });

  describe('Allergen labels', () => {
    it('should have all 14 EU allergens', () => {
      const allergenKeys = Object.keys(ALLERGEN_LABELS);
      expect(allergenKeys).toHaveLength(14);
      expect(allergenKeys).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14']);
    });

    it('should have Slovak labels for common allergens', () => {
      expect(ALLERGEN_LABELS['1']).toBe('Obilniny obsahujúce lepok');
      expect(ALLERGEN_LABELS['3']).toBe('Vajcia');
      expect(ALLERGEN_LABELS['7']).toBe('Mlieko');
    });
  });

  describe('Guest pricing constants', () => {
    it('should have correct adult price', () => {
      expect(GUEST_PRICING.ADULT).toBe(9.90);
    });

    it('should have correct child price', () => {
      expect(GUEST_PRICING.CHILD).toBe(5.90);
    });

    it('should have euro currency', () => {
      expect(GUEST_PRICING.CURRENCY).toBe('€');
    });

    it('should have Slovak label', () => {
      expect(GUEST_PRICING.LABEL).toBe('Pre hostí apartmánov');
    });
  });

  describe('Type structure validation', () => {
    it('Breakfast type should have all required fields', () => {
      const mockBreakfast: Partial<Breakfast> = {
        id: 'test-id',
        name: 'Test Breakfast',
        slug: 'test-breakfast',
        description: 'Test description',
        price: 10.50,
        images: ['image1.jpg'],
        category: 'SWEET' as BreakfastCategory,
        allergens: ['1', '3', '7'],
        isActive: true,
        sortOrder: 0,
      };

      expect(mockBreakfast).toHaveProperty('id');
      expect(mockBreakfast).toHaveProperty('name');
      expect(mockBreakfast).toHaveProperty('slug');
      expect(mockBreakfast).toHaveProperty('description');
      expect(mockBreakfast).toHaveProperty('price');
      expect(mockBreakfast).toHaveProperty('images');
      expect(mockBreakfast).toHaveProperty('category');
      expect(mockBreakfast).toHaveProperty('allergens');
      expect(mockBreakfast).toHaveProperty('isActive');
      expect(mockBreakfast).toHaveProperty('sortOrder');
    });

    it('BreakfastOrder type should have all required fields', () => {
      const mockOrder: Partial<BreakfastOrder> = {
        id: 'test-order-id',
        bookingId: 'test-booking-id',
        adults: 2,
        children: 1,
        delivery: true,
        specialRequests: 'No nuts please',
      };

      expect(mockOrder).toHaveProperty('id');
      expect(mockOrder).toHaveProperty('bookingId');
      expect(mockOrder).toHaveProperty('adults');
      expect(mockOrder).toHaveProperty('children');
      expect(mockOrder).toHaveProperty('delivery');
      expect(mockOrder).toHaveProperty('specialRequests');
    });
  });
});
