import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Debug endpoint to test full booking flow
 * Tests each step that could cause redirect
 */
interface DiagnosticStep {
  step: number;
  name: string;
  status: string;
  [key: string]: unknown;
}

interface Diagnostics {
  timestamp: string;
  environment: string | undefined;
  steps: DiagnosticStep[];
  duration?: number;
  overallStatus?: string;
  criticalError?: string;
}

export async function GET() {
  const startTime = Date.now();
  const diagnostics: Diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    steps: [] as DiagnosticStep[]
  };

  try {
    // Step 1: Test DATABASE_URL
    diagnostics.steps.push({
      step: 1,
      name: 'DATABASE_URL Check',
      hasUrl: !!process.env.DATABASE_URL,
      urlLength: process.env.DATABASE_URL?.length || 0,
      urlPrefix: process.env.DATABASE_URL?.substring(0, 30) || 'N/A',
      status: !!process.env.DATABASE_URL ? 'PASS' : 'FAIL'
    });

    // Step 2: Test Prisma Connection
    try {
      await prisma.$connect();
      diagnostics.steps.push({
        step: 2,
        name: 'Prisma Connection',
        status: 'PASS',
        message: 'Successfully connected to database'
      });
    } catch (error) {
      diagnostics.steps.push({
        step: 2,
        name: 'Prisma Connection',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error; // Stop here if connection fails
    }

    // Step 3: Test apartment query
    try {
      const apartment = await prisma.apartment.findUnique({
        where: { slug: 'deluxe-apartman' }
      });
      diagnostics.steps.push({
        step: 3,
        name: 'Apartment Query',
        status: apartment ? 'PASS' : 'FAIL',
        found: !!apartment,
        apartmentId: apartment?.id,
        apartmentName: apartment?.name
      });
    } catch (error) {
      diagnostics.steps.push({
        step: 3,
        name: 'Apartment Query',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }

    // Step 4: Test Beds24 API
    try {
      const beds24Response = await fetch('https://api.beds24.com/v2/authentication/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: 'test',
          redirectUrl: 'https://apartmany-vita.vercel.app'
        })
      });
      
      diagnostics.steps.push({
        step: 4,
        name: 'Beds24 API Connectivity',
        status: 'PASS',
        responseStatus: beds24Response.status,
        hasBeds24Token: !!process.env.BEDS24_ACCESS_TOKEN,
        hasRefreshToken: !!process.env.BEDS24_REFRESH_TOKEN
      });
    } catch (error) {
      diagnostics.steps.push({
        step: 4,
        name: 'Beds24 API Connectivity',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Step 5: Test pricing calculation
    try {
      const { calculateBookingPrice } = await import('@/services/pricing');
      const apartment = await prisma.apartment.findUnique({
        where: { slug: 'deluxe-apartman' }
      });
      
      if (!apartment) throw new Error('Apartment not found');
      
      const pricing = await calculateBookingPrice({
        apartmentId: apartment.id,
        checkIn: new Date('2025-10-13'),
        checkOut: new Date('2025-10-29'),
        guests: 2,
        children: 0
      });
      
      diagnostics.steps.push({
        step: 5,
        name: 'Pricing Calculation',
        status: 'PASS',
        total: pricing.total,
        nights: pricing.nights,
        hasBreakdown: !!pricing.breakdown
      });
    } catch (error) {
      diagnostics.steps.push({
        step: 5,
        name: 'Pricing Calculation',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined
      });
    }

    diagnostics.duration = Date.now() - startTime;
    diagnostics.overallStatus = diagnostics.steps.every(s => s.status === 'PASS') ? 'ALL_PASS' : 'SOME_FAILED';

  } catch (error) {
    diagnostics.overallStatus = 'CRITICAL_FAILURE';
    diagnostics.criticalError = error instanceof Error ? error.message : 'Unknown error';
    diagnostics.duration = Date.now() - startTime;
  } finally {
    await prisma.$disconnect();
  }

  return NextResponse.json(diagnostics, {
    headers: {
      'Cache-Control': 'no-store'
    }
  });
}
