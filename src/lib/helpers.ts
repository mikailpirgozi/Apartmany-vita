/**
 * Helper Functions
 * Reusable utility functions for common operations
 */

import { format, parseISO } from 'date-fns';
import { sk } from 'date-fns/locale';

/**
 * Format price to EUR currency
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('sk-SK', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format date to Slovak format
 */
export function formatDate(date: Date | string, formatStr: string = 'dd.MM.yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: sk });
}

/**
 * Format date range
 */
export function formatDateRange(checkIn: Date | string, checkOut: Date | string): string {
  const checkInFormatted = formatDate(checkIn, 'dd.MM.yyyy');
  const checkOutFormatted = formatDate(checkOut, 'dd.MM.yyyy');
  return `${checkInFormatted} - ${checkOutFormatted}`;
}

/**
 * Calculate number of nights
 */
export function calculateNights(checkIn: Date | string, checkOut: Date | string): number {
  const checkInDate = typeof checkIn === 'string' ? parseISO(checkIn) : checkIn;
  const checkOutDate = typeof checkOut === 'string' ? parseISO(checkOut) : checkOut;
  const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Slovak format)
 */
export function isValidPhone(phone: string): boolean {
  // Slovak phone: +421XXXXXXXXX or 0XXXXXXXXX
  const phoneRegex = /^(\+421|0)[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Format phone number to Slovak format
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\s/g, '');
  if (cleaned.startsWith('+421')) {
    return `+421 ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)} ${cleaned.slice(10)}`;
  }
  if (cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generate slug from text
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Get apartment name from slug
 */
export function getApartmentName(slug: string): string {
  const names: Record<string, string> = {
    'design-apartman': 'Design Apartmán',
    'lite-apartman': 'Lite Apartmán',
    'deluxe-apartman': 'Deluxe Apartmán'
  };
  return names[slug] || slug;
}

/**
 * Get booking status label
 */
export function getBookingStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'PENDING': 'Čaká na potvrdenie',
    'CONFIRMED': 'Potvrdené',
    'CANCELLED': 'Zrušené',
    'COMPLETED': 'Dokončené'
  };
  return labels[status] || status;
}

/**
 * Get booking status color
 */
export function getBookingStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'PENDING': 'yellow',
    'CONFIRMED': 'green',
    'CANCELLED': 'red',
    'COMPLETED': 'blue'
  };
  return colors[status] || 'gray';
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value}%`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Sleep/delay function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    backoff?: number;
  } = {}
): Promise<T> {
  const { maxAttempts = 3, delay = 1000, backoff = 2 } = options;
  
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxAttempts) {
        const waitTime = delay * Math.pow(backoff, attempt - 1);
        await sleep(waitTime);
      }
    }
  }
  
  throw lastError!;
}

/**
 * Safe JSON parse
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Get error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error occurred';
}

/**
 * Check if code is running on server
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Check if code is running on client
 */
export function isClient(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Get base URL
 */
export function getBaseUrl(): string {
  if (isServer()) {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }
  return window.location.origin;
}
