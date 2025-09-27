import { NextRequest, NextResponse } from 'next/server';
import { getApartmentAvailability } from '@/services/beds24';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apartment = searchParams.get('apartment');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');

    console.log('Availability API called with:', { apartment, checkIn, checkOut });

    if (!apartment || !checkIn || !checkOut) {
      console.log('Missing parameters:', { apartment, checkIn, checkOut });
      return NextResponse.json(
        { error: 'Missing required parameters: apartment, checkIn, checkOut' },
        { status: 400 }
      );
    }

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.log('Invalid date format:', { checkIn, checkOut });
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    console.log('Calling getApartmentAvailability with:', { apartment, startDate, endDate });
    const availability = await getApartmentAvailability(apartment, startDate, endDate);
    console.log('Availability result:', availability);

    return NextResponse.json(availability);
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}