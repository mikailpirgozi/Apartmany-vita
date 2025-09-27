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
    // Use environment variables for tokens
    // Use correct tokens from environment
    const accessToken = process.env.BEDS24_ACCESS_TOKEN || 'XwJnUUA7YS9aHRIBFPhVWiIEBlb/+whEpT0SRe7m5IWp30A9+uJlz54IN+KTAYSFNkftzJQ9ODvTYrafP6c2o3sUExKkk288hi7lKcuJZ8zxfh3CxnUZckm/W3dGGs1ibWb1BIr/ch69m5RKYemFu/Rn6KfTjwgMUi+zyCgifcg=';
    const refreshToken = process.env.BEDS24_REFRESH_TOKEN || 'QsCylbIZO1MkEotBI6lEy5YMzGfJAuAK3FAb65FvW4bj2FsX9tY8svDSSCVm3oNKst+cXZx0hB/u9gPtn39beUSjcRLL6CRYujpgOfBhboFKbclRLGE6HBusZJL+zAw+/BAaZp2xRdLh65BJsnS9idjZ8khgLvQKzcHJg3d4anM=';
    
    this.config = {
      accessToken,
      refreshToken,
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
        request,
        propId: request.propId,
        roomId: request.roomId
      });

      // API V2 format with query parameters (working approach)
      const url = new URL(`${this.config.baseUrl}/bookings`);
      url.searchParams.append('propId', request.propId);
      if (request.roomId) {
        url.searchParams.append('roomId', request.roomId);
      }
      url.searchParams.append('checkIn', request.startDate);
      url.searchParams.append('checkOut', request.endDate);
      
      const response = await fetch(url.toString(), {
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
      
      // Parse availability first
      const availability = this.parseAvailabilityResponseV2(data, request);
      
      // Try to get rates for available dates
      try {
        const rates = await this.getRoomRates(request.propId, request.roomId, request.startDate, request.endDate);
        console.log('Rates fetched:', Object.keys(rates).length, 'dates');
        
        // Merge rates into availability prices
        Object.assign(availability.prices, rates);
      } catch (ratesError) {
        console.warn('Failed to fetch rates, continuing without them:', ratesError);
      }
      
      return availability;
    } catch (error) {
      console.error('Error fetching availability from Beds24:', error);
      throw new Error('Failed to fetch availability data');
    }
  }

  /**
   * Get dynamic room rates for date range - API V2
   */
  async getRoomRates(propId?: string, roomId?: string, startDate?: string, endDate?: string): Promise<Record<string, number>> {
    try {
      const accessToken = await this.ensureValidToken();
      
      if (!propId || !startDate || !endDate) {
        console.warn('Missing required parameters for rates request');
        return {};
      }
      
      // Use inventory endpoint with POST request for rates
      const requestBody = {
        authentication: {
          apiKey: this.config.accessToken,
          propKey: propId
        },
        request: {
          startDate,
          endDate,
          includeInactive: false,
          includeRates: true,
          ...(roomId && { roomId })
        }
      };
      
      console.log('Fetching rates from inventory:', {
        url: `${this.config.baseUrl}/inventory`,
        propId,
        roomId,
        dateRange: `${startDate} - ${endDate}`
      });
      
      const response = await fetch(`${this.config.baseUrl}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': accessToken
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Rates response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Rates API error:', errorText);
        return {};
      }

      const data = await response.json();
      console.log('Rates data received:', data);
      
      return this.parseRatesResponseV2(data, propId, roomId || '');
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
   * Parse availability response from Beds24 V2 inventory endpoint
   */
  private parseAvailabilityResponseV2(data: unknown, request: AvailabilityRequest): AvailabilityResponse {
    const available: string[] = [];
    const booked: string[] = [];
    const prices: Record<string, number> = {};

    console.log('Parsing inventory response:', { data, request });

    // Generate date range first
    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);
    
    console.log('Date range:', { startDate: startDate.toISOString(), endDate: endDate.toISOString() });

    // Handle booking response format (API returns bookings, not inventory)
    let bookings: unknown[] = [];
    
    if (data && typeof data === 'object') {
      // API V2 returns booking data in 'data' field
      if ('data' in data && Array.isArray((data as { data: unknown[] }).data)) {
        bookings = (data as { data: unknown[] }).data;
      } else if (Array.isArray(data)) {
        bookings = data;
      }
    }

    console.log('Found booking items:', bookings.length);
    
    // Generate all dates in range and check availability
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      
      // Check bookings for this date
      let datePrice: number | undefined;
      let isBooked = false; // Default to available
      
      bookings.forEach((booking: unknown) => {
        if (booking && typeof booking === 'object') {
          const bookingObj = booking as Record<string, unknown>;
          
          // Get booking dates and status
          const arrival = bookingObj.arrival as string;
          const departure = bookingObj.departure as string;
          const status = bookingObj.status as string;
          
          if (arrival && departure && (status === 'confirmed' || status === 'new')) {
            const arrivalDate = new Date(arrival);
            const departureDate = new Date(departure);
            const currentDate = new Date(dateStr);
            
            // Check if current date falls within booking period
            if (currentDate >= arrivalDate && currentDate < departureDate) {
              isBooked = true;
              
              // Extract price from booking if available
              if ('price' in bookingObj && typeof bookingObj.price === 'number') {
                const nights = Math.ceil((departureDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24));
                if (nights > 0) {
                  datePrice = bookingObj.price / nights; // Price per night
                }
              }
            }
          }
        }
      });

      if (isBooked) {
        booked.push(dateStr);
      } else {
        available.push(dateStr);
      }
      
      // Set price if found, otherwise use default
      if (datePrice !== undefined) {
        prices[dateStr] = datePrice;
      } else {
        // Set a default price based on apartment type
        prices[dateStr] = this.getDefaultPrice(request.roomId);
      }
    }

    console.log('Parsed availability:', { 
      available: available.length, 
      booked: booked.length,
      availableDates: available.slice(0, 5), // Show first 5 for debugging
      bookedDates: booked.slice(0, 5) // Show first 5 for debugging
    });

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

    console.log('Parsing rates response:', { data, propId, roomId });

    // Handle different possible response formats
    if (data && typeof data === 'object') {
      // Try different possible formats
      let inventoryData: unknown[] = [];
      
      if ('data' in data && Array.isArray((data as { data: unknown[] }).data)) {
        inventoryData = (data as { data: unknown[] }).data;
      } else if ('inventory' in data && Array.isArray((data as { inventory: unknown[] }).inventory)) {
        inventoryData = (data as { inventory: unknown[] }).inventory;
      } else if ('rates' in data && Array.isArray((data as { rates: unknown[] }).rates)) {
        inventoryData = (data as { rates: unknown[] }).rates;
      } else if (Array.isArray(data)) {
        inventoryData = data;
      }

      console.log('Found inventory data:', inventoryData.length, 'items');

      inventoryData.forEach((item: unknown) => {
        if (item && typeof item === 'object') {
          const itemObj = item as Record<string, unknown>;
          
          // Try different field names for date and price
          let date: string | null = null;
          let price: number | null = null;
          
          // Date field variations
          if ('date' in itemObj && typeof itemObj.date === 'string') {
            date = itemObj.date;
          } else if ('day' in itemObj && typeof itemObj.day === 'string') {
            date = itemObj.day;
          }
          
          // Price field variations
          if ('price' in itemObj && typeof itemObj.price === 'number') {
            price = itemObj.price;
          } else if ('rate' in itemObj && typeof itemObj.rate === 'number') {
            price = itemObj.rate;
          } else if ('amount' in itemObj && typeof itemObj.amount === 'number') {
            price = itemObj.amount;
          }
          
          // Property/Room filtering
          let matchesProperty = !propId;
          let matchesRoom = !roomId;
          
          if (propId && 'propId' in itemObj) {
            matchesProperty = itemObj.propId === propId;
          } else if (propId && 'propertyId' in itemObj) {
            matchesProperty = itemObj.propertyId === propId;
          }
          
          if (roomId && 'roomId' in itemObj) {
            matchesRoom = itemObj.roomId === roomId;
          }
          
          if (date && price && matchesProperty && matchesRoom) {
            rates[date] = price;
          }
        }
      });
    }

    console.log('Parsed rates:', Object.keys(rates).length, 'dates');
    return rates;
  }

  /**
   * Get default price for apartment type when API doesn't return pricing
   */
  private getDefaultPrice(roomId?: string): number {
    // Default prices based on apartment type
    const defaultPrices: Record<string, number> = {
      '161445': 120, // Deluxe Apartmán
      '168900': 90,  // Lite Apartmán  
      '227484': 110, // Design Apartmán
    };
    
    return roomId && defaultPrices[roomId] ? defaultPrices[roomId] : 75; // Default fallback price
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
  // Map apartment slugs to Beds24 Property ID + Room ID - 3 aktívne apartmány
  const apartmentMapping: Record<string, { propId: string; roomId: string }> = {
    // 'maly-apartman' - dočasne vypnutý
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
    // 'maly-apartman' - dočasne vypnutý
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
