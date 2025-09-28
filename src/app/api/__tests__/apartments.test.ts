/**
 * Apartments API Tests
 * Tests for apartment-related API endpoints
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Next.js
vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: vi.fn((data, init) => ({ data, init })),
    error: vi.fn((message, status) => ({ error: message, status })),
  },
}));

// Mock database
vi.mock('@/lib/db', () => ({
  prisma: {
    apartment: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Mock cache
vi.mock('@/lib/cache', () => ({
  getCachedData: vi.fn(),
  setCachedData: vi.fn(),
  invalidateCache: vi.fn(),
}));

// Mock auth
vi.mock('@/lib/auth', () => ({
  getServerSession: vi.fn(),
}));

import { GET, POST, PUT, DELETE } from '@/app/api/apartments/route';
import { prisma } from '@/lib/db';
import { getCachedData, setCachedData } from '@/lib/cache';
import { getServerSession } from '@/lib/auth';

describe('Apartments API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/apartments', () => {
    it('should return apartments list', async () => {
      const mockApartments = [
        {
          id: '1',
          name: 'Test Apartment 1',
          slug: 'test-apartment-1',
          price: 100,
          maxGuests: 4,
          isActive: true,
        },
        {
          id: '2',
          name: 'Test Apartment 2',
          slug: 'test-apartment-2',
          price: 150,
          maxGuests: 6,
          isActive: true,
        },
      ];

      vi.mocked(getCachedData).mockResolvedValue(null);
      vi.mocked(prisma.apartment.findMany).mockResolvedValue(mockApartments);
      vi.mocked(setCachedData).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/apartments');
      const response = await GET(request);

      expect(response.data).toEqual(mockApartments);
      expect(prisma.apartment.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        select: expect.any(Object),
      });
    });

    it('should return cached apartments if available', async () => {
      const cachedApartments = [
        {
          id: '1',
          name: 'Cached Apartment',
          slug: 'cached-apartment',
          price: 100,
          maxGuests: 4,
          isActive: true,
        },
      ];

      vi.mocked(getCachedData).mockResolvedValue(cachedApartments);

      const request = new NextRequest('http://localhost:3000/api/apartments');
      const response = await GET(request);

      expect(response.data).toEqual(cachedApartments);
      expect(prisma.apartment.findMany).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      vi.mocked(getCachedData).mockResolvedValue(null);
      vi.mocked(prisma.apartment.findMany).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/apartments');
      const response = await GET(request);

      expect(response.error).toBe('Failed to fetch apartments');
      expect(response.status).toBe(500);
    });

    it('should filter apartments by search query', async () => {
      const mockApartments = [
        {
          id: '1',
          name: 'Bratislava Apartment',
          slug: 'bratislava-apartment',
          price: 100,
          maxGuests: 4,
          isActive: true,
        },
      ];

      vi.mocked(getCachedData).mockResolvedValue(null);
      vi.mocked(prisma.apartment.findMany).mockResolvedValue(mockApartments);

      const request = new NextRequest('http://localhost:3000/api/apartments?search=bratislava');
      const response = await GET(request);

      expect(response.data).toEqual(mockApartments);
      expect(prisma.apartment.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          OR: [
            { name: { contains: 'bratislava', mode: 'insensitive' } },
            { description: { contains: 'bratislava', mode: 'insensitive' } },
            { location: { city: { contains: 'bratislava', mode: 'insensitive' } } },
          ],
        },
        select: expect.any(Object),
      });
    });
  });

  describe('GET /api/apartments/[slug]', () => {
    it('should return specific apartment', async () => {
      const mockApartment = {
        id: '1',
        name: 'Test Apartment',
        slug: 'test-apartment',
        description: 'A beautiful apartment',
        price: 100,
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 1,
        amenities: ['wifi', 'parking'],
        images: ['image1.jpg'],
        location: {
          address: 'Test Street 123',
          city: 'Test City',
          country: 'Test Country',
        },
        isActive: true,
      };

      vi.mocked(getCachedData).mockResolvedValue(null);
      vi.mocked(prisma.apartment.findUnique).mockResolvedValue(mockApartment);
      vi.mocked(setCachedData).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/apartments/test-apartment');
      const response = await GET(request, { params: { slug: 'test-apartment' } });

      expect(response.data).toEqual(mockApartment);
      expect(prisma.apartment.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-apartment' },
        include: expect.any(Object),
      });
    });

    it('should return 404 for non-existent apartment', async () => {
      vi.mocked(getCachedData).mockResolvedValue(null);
      vi.mocked(prisma.apartment.findUnique).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/apartments/non-existent');
      const response = await GET(request, { params: { slug: 'non-existent' } });

      expect(response.error).toBe('Apartment not found');
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/apartments', () => {
    it('should create new apartment with admin access', async () => {
      const mockSession = {
        user: { id: '1', role: 'admin' },
      };

      const newApartment = {
        name: 'New Apartment',
        slug: 'new-apartment',
        description: 'A new apartment',
        price: 120,
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 1,
        amenities: ['wifi'],
        images: ['image1.jpg'],
        location: {
          address: 'New Street 123',
          city: 'New City',
          country: 'New Country',
        },
        beds24PropertyId: '12345',
        beds24RoomId: '67890',
      };

      const createdApartment = { id: '2', ...newApartment, isActive: true };

      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.apartment.create).mockResolvedValue(createdApartment);
      vi.mocked(setCachedData).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/apartments', {
        method: 'POST',
        body: JSON.stringify(newApartment),
      });
      const response = await POST(request);

      expect(response.data).toEqual(createdApartment);
      expect(prisma.apartment.create).toHaveBeenCalledWith({
        data: newApartment,
        include: expect.any(Object),
      });
    });

    it('should reject creation without admin access', async () => {
      const mockSession = {
        user: { id: '1', role: 'user' },
      };

      vi.mocked(getServerSession).mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/apartments', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Apartment' }),
      });
      const response = await POST(request);

      expect(response.error).toBe('Unauthorized');
      expect(response.status).toBe(403);
    });

    it('should reject creation without authentication', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/apartments', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Apartment' }),
      });
      const response = await POST(request);

      expect(response.error).toBe('Unauthorized');
      expect(response.status).toBe(401);
    });

    it('should handle validation errors', async () => {
      const mockSession = {
        user: { id: '1', role: 'admin' },
      };

      vi.mocked(getServerSession).mockResolvedValue(mockSession);

      const invalidApartment = {
        name: '', // Invalid: empty name
        price: -100, // Invalid: negative price
      };

      const request = new NextRequest('http://localhost:3000/api/apartments', {
        method: 'POST',
        body: JSON.stringify(invalidApartment),
      });
      const response = await POST(request);

      expect(response.error).toBe('Invalid apartment data');
      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/apartments/[slug]', () => {
    it('should update apartment with admin access', async () => {
      const mockSession = {
        user: { id: '1', role: 'admin' },
      };

      const updateData = {
        name: 'Updated Apartment',
        price: 150,
      };

      const updatedApartment = {
        id: '1',
        slug: 'test-apartment',
        ...updateData,
        isActive: true,
      };

      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.apartment.update).mockResolvedValue(updatedApartment);
      vi.mocked(setCachedData).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/apartments/test-apartment', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      const response = await PUT(request, { params: { slug: 'test-apartment' } });

      expect(response.data).toEqual(updatedApartment);
      expect(prisma.apartment.update).toHaveBeenCalledWith({
        where: { slug: 'test-apartment' },
        data: updateData,
        include: expect.any(Object),
      });
    });

    it('should return 404 for non-existent apartment', async () => {
      const mockSession = {
        user: { id: '1', role: 'admin' },
      };

      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.apartment.update).mockRejectedValue(new Error('Record not found'));

      const request = new NextRequest('http://localhost:3000/api/apartments/non-existent', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated' }),
      });
      const response = await PUT(request, { params: { slug: 'non-existent' } });

      expect(response.error).toBe('Apartment not found');
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/apartments/[slug]', () => {
    it('should delete apartment with admin access', async () => {
      const mockSession = {
        user: { id: '1', role: 'admin' },
      };

      const deletedApartment = {
        id: '1',
        slug: 'test-apartment',
        name: 'Test Apartment',
        isActive: false,
      };

      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.apartment.update).mockResolvedValue(deletedApartment);

      const request = new NextRequest('http://localhost:3000/api/apartments/test-apartment', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: { slug: 'test-apartment' } });

      expect(response.data).toEqual({ message: 'Apartment deleted successfully' });
      expect(prisma.apartment.update).toHaveBeenCalledWith({
        where: { slug: 'test-apartment' },
        data: { isActive: false },
      });
    });

    it('should reject deletion without admin access', async () => {
      const mockSession = {
        user: { id: '1', role: 'user' },
      };

      vi.mocked(getServerSession).mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/apartments/test-apartment', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: { slug: 'test-apartment' } });

      expect(response.error).toBe('Unauthorized');
      expect(response.status).toBe(403);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON in POST request', async () => {
      const mockSession = {
        user: { id: '1', role: 'admin' },
      };

      vi.mocked(getServerSession).mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/apartments', {
        method: 'POST',
        body: 'invalid-json',
      });
      const response = await POST(request);

      expect(response.error).toBe('Invalid JSON');
      expect(response.status).toBe(400);
    });

    it('should handle database connection errors', async () => {
      vi.mocked(getCachedData).mockResolvedValue(null);
      vi.mocked(prisma.apartment.findMany).mockRejectedValue(new Error('Connection failed'));

      const request = new NextRequest('http://localhost:3000/api/apartments');
      const response = await GET(request);

      expect(response.error).toBe('Failed to fetch apartments');
      expect(response.status).toBe(500);
    });
  });
});
