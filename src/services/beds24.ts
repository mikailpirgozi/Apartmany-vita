/**
 * Beds24 API Integration Service
 * Handles availability, pricing, and booking management
 */

export interface Beds24Config {
  apiKey: string;
  baseUrl: string;
  propId: string;
}

export interface AvailabilityRequest {
  propId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  roomId?: string;
}

export interface AvailabilityResponse {
  available: string[];  // Array of available dates
  booked: string[];     // Array of booked dates
  prices: Record<string, number>; // Date -> price mapping
  minStay: number;
  maxStay: number;
}

export interface BookingData {
  propId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  numAdult: number;
  numChild: number;
  guestFirstName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  totalPrice: number;
  bookingId?: string;
}

export interface Beds24Booking {
  bookId: string;
  status: 'new' | 'confirmed' | 'cancelled';
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  guestName: string;
  guestEmail: string;
}

class Beds24Service {
  private readonly config: Beds24Config;

  constructor() {
    this.config = {
      apiKey: process.env.BEDS24_API_KEY || 'VitaAPI2024Mikipiki',
      baseUrl: process.env.BEDS24_BASE_URL || 'https://beds24.com/api/v2',
      propId: process.env.BEDS24_PROP_ID || '294444'
    };

    if (!this.config.apiKey) {
      throw new Error('BEDS24_API_KEY is required');
    }
  }

  /**
   * Get availability for specific date range
   */
  async getAvailability(request: AvailabilityRequest): Promise<AvailabilityResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': this.config.apiKey
        },
        body: JSON.stringify({
          authentication: {
            apiKey: this.config.apiKey,
            propKey: request.propId
          },
          request: {
            startDate: request.startDate,
            endDate: request.endDate,
            includeInactive: false,
            roomId: request.roomId
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Beds24 API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return this.parseAvailabilityResponse(data);
    } catch (error) {
      console.error('Error fetching availability from Beds24:', error);
      throw new Error('Failed to fetch availability data');
    }
  }

  /**
   * Get dynamic room rates for date range
   */
  async getRoomRates(propId: string, roomId: string, startDate: string, endDate: string): Promise<Record<string, number>> {
    try {
      const response = await fetch(`${this.config.baseUrl}/rates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': this.config.apiKey
        },
        body: JSON.stringify({
          authentication: {
            apiKey: this.config.apiKey,
            propKey: propId
          },
          request: {
            startDate,
            endDate,
            roomId
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Beds24 rates API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseRatesResponse(data);
    } catch (error) {
      console.error('Error fetching rates from Beds24:', error);
      return {};
    }
  }

  /**
   * Create new booking in Beds24
   */
  async createBooking(bookingData: BookingData): Promise<Beds24Booking> {
    try {
      const response = await fetch(`${this.config.baseUrl}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': this.config.apiKey
        },
        body: JSON.stringify({
          authentication: {
            apiKey: this.config.apiKey,
            propKey: bookingData.propId
          },
          booking: {
            roomId: bookingData.roomId,
            arrival: bookingData.checkIn,
            departure: bookingData.checkOut,
            numAdult: bookingData.numAdult,
            numChild: bookingData.numChild,
            guestFirstName: bookingData.guestFirstName,
            guestName: bookingData.guestName,
            guestEmail: bookingData.guestEmail,
            guestPhone: bookingData.guestPhone,
            price: bookingData.totalPrice,
            status: 1, // New booking
            apiReference: bookingData.bookingId
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Beds24 booking error: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      
      return {
        bookId: data.bookId,
        status: 'new',
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        totalPrice: bookingData.totalPrice,
        guestName: `${bookingData.guestFirstName} ${bookingData.guestName}`,
        guestEmail: bookingData.guestEmail
      };
    } catch (error) {
      console.error('Error creating booking in Beds24:', error);
      throw error;
    }
  }

  /**
   * Update booking status in Beds24
   */
  async updateBookingStatus(bookId: string, status: 'confirmed' | 'cancelled'): Promise<void> {
    try {
      const statusCode = status === 'confirmed' ? 2 : 3;
      
      const response = await fetch(`${this.config.baseUrl}/bookings/${bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'token': this.config.apiKey
        },
        body: JSON.stringify({
          authentication: {
            apiKey: this.config.apiKey
          },
          booking: {
            status: statusCode
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update booking status: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating booking status in Beds24:', error);
      throw error;
    }
  }

  /**
   * Get booking details from Beds24
   */
  async getBooking(bookId: string): Promise<Beds24Booking | null> {
    try {
      const response = await fetch(`${this.config.baseUrl}/bookings/${bookId}`, {
        method: 'GET',
        headers: {
          'token': this.config.apiKey
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to get booking: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseBookingResponse(data);
    } catch (error) {
      console.error('Error fetching booking from Beds24:', error);
      throw error;
    }
  }

  /**
   * Parse availability response from Beds24
   */
  private parseAvailabilityResponse(data: unknown): AvailabilityResponse {
    const available: string[] = [];
    const booked: string[] = [];
    const prices: Record<string, number> = {};

    // Parse Beds24 response format
    if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as { data: unknown[] }).data)) {
      (data as { data: unknown[] }).data.forEach((dayData: unknown) => {
        if (dayData && typeof dayData === 'object' && 'date' in dayData) {
          const dayDataObj = dayData as { date: string; avail: number; price?: string };
          const date = dayDataObj.date;
          const isAvailable = dayDataObj.avail > 0;
          
          if (isAvailable) {
            available.push(date);
            if (dayDataObj.price) {
              prices[date] = parseFloat(dayDataObj.price);
            }
          } else {
            booked.push(date);
          }
        }
      });
    }

    const dataObj = data as { minStay?: number; maxStay?: number };
    return {
      available,
      booked,
      prices,
      minStay: dataObj.minStay || 1,
      maxStay: dataObj.maxStay || 30
    };
  }

  /**
   * Parse rates response from Beds24
   */
  private parseRatesResponse(data: unknown): Record<string, number> {
    const rates: Record<string, number> = {};

    if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as { data: unknown[] }).data)) {
      (data as { data: unknown[] }).data.forEach((rateData: unknown) => {
        if (rateData && typeof rateData === 'object' && 'date' in rateData && 'price' in rateData) {
          const rateDataObj = rateData as { date: string; price: string };
          if (rateDataObj.date && rateDataObj.price) {
            rates[rateDataObj.date] = parseFloat(rateDataObj.price);
          }
        }
      });
    }

    return rates;
  }

  /**
   * Parse booking response from Beds24
   */
  private parseBookingResponse(data: unknown): Beds24Booking {
    const statusMap: Record<number, 'new' | 'confirmed' | 'cancelled'> = {
      1: 'new',
      2: 'confirmed',
      3: 'cancelled'
    };

    const dataObj = data as {
      bookId: string;
      status: number;
      arrival: string;
      departure: string;
      price?: string;
      guestFirstName?: string;
      guestName?: string;
      guestEmail?: string;
    };
    
    return {
      bookId: dataObj.bookId,
      status: statusMap[dataObj.status] || 'new',
      checkIn: dataObj.arrival,
      checkOut: dataObj.departure,
      totalPrice: parseFloat(dataObj.price || '0'),
      guestName: `${dataObj.guestFirstName || ''} ${dataObj.guestName || ''}`.trim(),
      guestEmail: dataObj.guestEmail || ''
    };
  }
}

// Singleton instance
export const beds24Service = new Beds24Service();

// Helper functions for apartment-specific operations
export async function getApartmentAvailability(
  apartmentSlug: string, 
  startDate: Date, 
  endDate: Date
): Promise<AvailabilityResponse> {
  // Map apartment slugs to Beds24 room IDs - OPRAVENÉ ÚDAJE
  const apartmentRoomMapping: Record<string, string> = {
    'maly-apartman': process.env.BEDS24_ROOM_MALY || '615761',
    'design-apartman': process.env.BEDS24_ROOM_DESIGN || '483027',
    'lite-apartman': process.env.BEDS24_ROOM_LITE || '357932',
    'deluxe-apartman': process.env.BEDS24_ROOM_DELUXE || '357931'
  };

  const roomId = apartmentRoomMapping[apartmentSlug];
  if (!roomId) {
    throw new Error(`No Beds24 room mapping found for apartment: ${apartmentSlug}`);
  }

  return beds24Service.getAvailability({
    propId: process.env.BEDS24_PROP_ID!,
    roomId,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  });
}

export async function createApartmentBooking(
  apartmentSlug: string,
  bookingData: Omit<BookingData, 'propId' | 'roomId'>
): Promise<Beds24Booking> {
  const apartmentRoomMapping: Record<string, string> = {
    'maly-apartman': process.env.BEDS24_ROOM_MALY || '615761',
    'design-apartman': process.env.BEDS24_ROOM_DESIGN || '483027',
    'lite-apartman': process.env.BEDS24_ROOM_LITE || '357932',
    'deluxe-apartman': process.env.BEDS24_ROOM_DELUXE || '357931'
  };

  const roomId = apartmentRoomMapping[apartmentSlug];
  if (!roomId) {
    throw new Error(`No Beds24 room mapping found for apartment: ${apartmentSlug}`);
  }

  return beds24Service.createBooking({
    ...bookingData,
    propId: process.env.BEDS24_PROP_ID!,
    roomId
  });
}
