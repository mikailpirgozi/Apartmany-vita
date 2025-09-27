import { NextRequest, NextResponse } from 'next/server';
import { getApartmentAvailability } from '@/services/beds24';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apartment = searchParams.get('apartment');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');

    if (!apartment || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'Missing required parameters: apartment, checkIn, checkOut' },
        { status: 400 }
      );
    }

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    const availability = await getApartmentAvailability(apartment, startDate, endDate);

    return NextResponse.json(availability);
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}