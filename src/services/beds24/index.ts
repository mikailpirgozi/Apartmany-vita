/**
 * Beds24 Service - Main Entry Point
 * Modular architecture for better maintainability
 */

export * from './types';
export * from './auth';
export * from './rate-limiter';

// Re-export the main service (will be created after splitting the original file)
// For now, import from the original file
import { getBeds24Service, createApartmentBooking } from '../beds24';

export { getBeds24Service, createApartmentBooking };
