/**
 * Working Utils Tests
 * Tests for actual utility functions that exist
 */

import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

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

    it('should merge Tailwind classes correctly', () => {
      const result = cn('px-4 py-2', 'px-6');
      expect(result).toBe('py-2 px-6');
    });

    it('should handle complex class combinations', () => {
      const result = cn(
        'flex items-center',
        'bg-blue-500 text-white',
        'hover:bg-blue-600',
        'disabled:opacity-50'
      );
      expect(result).toContain('flex');
      expect(result).toContain('items-center');
      expect(result).toContain('bg-blue-500');
      expect(result).toContain('text-white');
    });
  });
});
