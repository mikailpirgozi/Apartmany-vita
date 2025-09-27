/**
 * Beds24 API Integration Service
 * Handles availability, pricing, and booking management
 */

export interface Beds24Config {
  accessToken: string;
  refreshToken: string;
  baseUrl: string;
  propId: string;
  tokenExpiresAt?: number;
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
      accessToken: process.env.BEDS24_ACCESS_TOKEN || 'Q3PuTuxgj6Qmm5/Rfvb+A4EhRS+1TIQUVoBJr3OUUHkAQhy2pw7HaKqnlqa9YdmFHTqSZrf4RUJQ3AwtSvu6ygq9PiFMX85Qiji64k7U9D016gmpgNm09HC58AGc9bfJZcKpBZ1diWotIQT6yCnmUDRLwNZz8tf1fJYgs3XzHjk=',
      refreshToken: process.env.BEDS24_REFRESH_TOKEN || 'ho1+r9D5VpRkMe3iibOAOuVcRwPvnsELK39UDu7XjiyRGvbnirpbZ67dj4rLejPZ0Lxh2jKAQG29U2ihlpeBvO337Ag5+W+/x58tvI9jrb9Wc/5IKZioc5Uwzog5RSYyiQYTju0dwU8GTWJPhxmRFdud7E75N1QNIl5ZtRa89Sk=',
      baseUrl: process.env.BEDS24_BASE_URL || 'https://api.beds24.com/v2',
      propId: process.env.BEDS24_PROP_ID || '357931',
      tokenExpiresAt: Date.now() + (86400 * 1000) // 24 hours from now
    };

    // Debug logging
    console.log('Beds24Service config:', {
      baseUrl: this.config.baseUrl,
      accessTokenLength: this.config.accessToken?.length,
      refreshTokenLength: this.config.refreshToken?.length,
      accessTokenStart: this.config.accessToken?.substring(0, 20) + '...',
      tokenExpiresAt: new Date(this.config.tokenExpiresAt || 0).toISOString()
    });

    if (!this.config.accessToken || !this.config.refreshToken) {
      throw new Error('BEDS24_ACCESS_TOKEN and BEDS24_REFRESH_TOKEN are required');
    }
  }

  /**
   * Check if access token is expired and refresh if needed
   */
  private async ensureValidToken(): Promise<string> {
    const now = Date.now();
    const expiresAt = this.config.tokenExpiresAt || 0;
    
    // If token expires in next 5 minutes, refresh it
    if (now >= (expiresAt - 5 * 60 * 1000)) {
      console.log('Access token expired or expiring soon, refreshing...');
      await this.refreshAccessToken();
    }
    
    return this.config.accessToken;
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    try {
      console.log('Refreshing Beds24 access token...');
      
      const response = await fetch(`${this.config.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refreshToken: this.config.refreshToken
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Token refresh failed:', errorText);
        throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        // Update config with new tokens
        const config = this.config as Beds24Config & { 
          accessToken: string; 
          refreshToken: string; 
          tokenExpiresAt: number; 
        };
        config.accessToken = data.data.accessToken;
        config.refreshToken = data.data.refreshToken;
        config.tokenExpiresAt = Date.now() + (data.data.expiresIn * 1000);
        
        console.log('Access token refreshed successfully');
      } else {
        throw new Error('Invalid refresh response format');
      }
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Get availability for specific date range - API V2
   */
  async getAvailability(request: AvailabilityRequest): Promise<AvailabilityResponse> {
    try {
      const accessToken = await this.ensureValidToken();
      
      console.log('Fetching availability:', {
        url: `${this.config.baseUrl}/bookings`,
        request
      });

      // API V2 format with access token
      const response = await fetch(`${this.config.baseUrl}/bookings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'token': accessToken
        }
      });

      console.log('Availability response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Availability API error:', errorText);
        throw new Error(`Beds24 API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Availability data received:', data);
      
      return this.parseAvailabilityResponseV2(data, request);
    } catch (error) {
      console.error('Error fetching availability from Beds24:', error);
      throw new Error('Failed to fetch availability data');
    }
  }

  /**
   * Get dynamic room rates for date range - API V2
   */
  async getRoomRates(propId: string, roomId: string, _startDate: string, _endDate: string): Promise<Record<string, number>> {
    try {
      const accessToken = await this.ensureValidToken();
      
      // Beds24 V2 API doesn't have a separate rates endpoint
      // Rates are included in the bookings response
      // For now, return empty rates object
      console.log('Rates endpoint not available in Beds24 V2 API');
      return {};
    } catch (error) {
      console.error('Error fetching rates from Beds24:', error);
      return {};
    }
  }

  /**
   * Create new booking in Beds24 - API V2
   */
  async createBooking(bookingData: BookingData): Promise<Beds24Booking> {
    try {
      const accessToken = await this.ensureValidToken();
      
      const requestBody = [{
        propId: bookingData.propId,
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
      }];

      console.log('Creating booking:', {
        url: `${this.config.baseUrl}/bookings`,
        requestBody
      });

      // API V2 expects array format for bookings
      const response = await fetch(`${this.config.baseUrl}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': accessToken
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Booking creation response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Booking creation API error:', errorText);
        throw new Error(`Beds24 booking error: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      console.log('Booking creation data received:', data);
      
      // Handle array response
      const booking = Array.isArray(data) ? data[0] : data;
      
      return {
        bookId: booking.bookId,
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
   * Update booking status in Beds24 - API V2
   */
  async updateBookingStatus(bookId: string, status: 'confirmed' | 'cancelled'): Promise<void> {
    try {
      const accessToken = await this.ensureValidToken();
      const statusCode = status === 'confirmed' ? 2 : 3;
      
      const response = await fetch(`${this.config.baseUrl}/bookings/${bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'token': accessToken
        },
        body: JSON.stringify({
          status: statusCode
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
   * Get booking details from Beds24 - API V2
   */
  async getBooking(bookId: string): Promise<Beds24Booking | null> {
    try {
      const accessToken = await this.ensureValidToken();
      
      console.log('Fetching booking:', {
        url: `${this.config.baseUrl}/bookings/${bookId}`,
        bookId
      });

      const response = await fetch(`${this.config.baseUrl}/bookings/${bookId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'token': accessToken
        }
      });

      console.log('Get booking response status:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorText = await response.text();
        console.error('Get booking API error:', errorText);
        throw new Error(`Failed to get booking: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      console.log('Get booking data received:', data);
      return this.parseBookingResponseV2(data);
    } catch (error) {
      console.error('Error fetching booking from Beds24:', error);
      throw error;
    }
  }

  /**
   * Parse availability response from Beds24 V2
   */
  private parseAvailabilityResponseV2(data: unknown, request: AvailabilityRequest): AvailabilityResponse {
    const available: string[] = [];
    const booked: string[] = [];
    const prices: Record<string, number> = {};

    // Parse Beds24 V2 response format
    if (data && typeof data === 'object' && 'bookings' in data && Array.isArray((data as { bookings: unknown[] }).bookings)) {
      const bookings = (data as { bookings: unknown[] }).bookings;
      
      // Generate date range
      const startDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        
        // Check if date is booked
        const isBooked = bookings.some((booking: unknown) => {
          if (booking && typeof booking === 'object' && 'arrival' in booking && 'departure' in booking) {
            const bookingObj = booking as { arrival: string; departure: string };
            const arrival = new Date(bookingObj.arrival);
            const departure = new Date(bookingObj.departure);
            return d >= arrival && d < departure;
          }
          return false;
        });
        
        if (isBooked) {
          booked.push(dateStr);
        } else {
          available.push(dateStr);
        }
      }
    }

    return {
      available,
      booked,
      prices,
      minStay: 1,
      maxStay: 30
    };
  }

  /**
   * Parse rates response from Beds24 V2
   */
  private parseRatesResponseV2(data: unknown, propId: string, roomId: string): Record<string, number> {
    const rates: Record<string, number> = {};

    // Parse Beds24 V2 rates response format
    if (data && typeof data === 'object' && 'rates' in data && Array.isArray((data as { rates: unknown[] }).rates)) {
      (data as { rates: unknown[] }).rates.forEach((rateData: unknown) => {
        if (rateData && typeof rateData === 'object' && 'date' in rateData && 'price' in rateData) {
          const rateDataObj = rateData as { date: string; price: number; propId?: string; roomId?: string };
          
          // Filter by property and room if specified
          if (propId && rateDataObj.propId && rateDataObj.propId !== propId) return;
          if (roomId && rateDataObj.roomId && rateDataObj.roomId !== roomId) return;
          
          if (rateDataObj.date && rateDataObj.price) {
            rates[rateDataObj.date] = rateDataObj.price;
          }
        }
      });
    }

    return rates;
  }

  /**
   * Parse booking response from Beds24 V2
   */
  private parseBookingResponseV2(data: unknown): Beds24Booking {
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
      price?: number;
      guestFirstName?: string;
      guestName?: string;
      guestEmail?: string;
    };
    
    return {
      bookId: dataObj.bookId,
      status: statusMap[dataObj.status] || 'new',
      checkIn: dataObj.arrival,
      checkOut: dataObj.departure,
      totalPrice: dataObj.price || 0,
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
  // Map apartment slugs to Beds24 Property ID + Room ID - 3 samostatné Properties
  const apartmentMapping: Record<string, { propId: string; roomId: string }> = {
    'design-apartman': {
      propId: process.env.BEDS24_PROP_ID_DESIGN || '227484',
      roomId: process.env.BEDS24_ROOM_ID_DESIGN || '483027'
    },
    'lite-apartman': {
      propId: process.env.BEDS24_PROP_ID_LITE || '168900', 
      roomId: process.env.BEDS24_ROOM_ID_LITE || '357932'
    },
    'deluxe-apartman': {
      propId: process.env.BEDS24_PROP_ID_DELUXE || '161445',
      roomId: process.env.BEDS24_ROOM_ID_DELUXE || '357931'
    }
  };

  const apartment = apartmentMapping[apartmentSlug];
  if (!apartment) {
    throw new Error(`No Beds24 mapping found for apartment: ${apartmentSlug}`);
  }

  return beds24Service.getAvailability({
    propId: apartment.propId,
    roomId: apartment.roomId,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  });
}

export async function createApartmentBooking(
  apartmentSlug: string,
  bookingData: Omit<BookingData, 'propId' | 'roomId'>
): Promise<Beds24Booking> {
  const apartmentMapping: Record<string, { propId: string; roomId: string }> = {
    'design-apartman': {
      propId: process.env.BEDS24_PROP_ID_DESIGN || '227484',
      roomId: process.env.BEDS24_ROOM_ID_DESIGN || '483027'
    },
    'lite-apartman': {
      propId: process.env.BEDS24_PROP_ID_LITE || '168900', 
      roomId: process.env.BEDS24_ROOM_ID_LITE || '357932'
    },
    'deluxe-apartman': {
      propId: process.env.BEDS24_PROP_ID_DELUXE || '161445',
      roomId: process.env.BEDS24_ROOM_ID_DELUXE || '357931'
    }
  };

  const apartment = apartmentMapping[apartmentSlug];
  if (!apartment) {
    throw new Error(`No Beds24 mapping found for apartment: ${apartmentSlug}`);
  }

  return beds24Service.createBooking({
    ...bookingData,
    propId: apartment.propId,
    roomId: apartment.roomId
  });
}
