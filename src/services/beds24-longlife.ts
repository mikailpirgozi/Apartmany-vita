/**
 * Beds24 Long Life Token Service
 * Official implementation following Sören's recommendations
 * Uses Long Life Token for simplified authentication
 */

import { eachDayOfInterval, parseISO, format } from 'date-fns';

export interface Beds24LongLifeConfig {
  longLifeToken: string;
  baseUrl: string;
  propId: string;
}

export interface AvailabilityRequest {
  propId: string;
  roomId: string;
  startDate: string;
  endDate: string;
}

export interface AvailabilityResponse {
  available: string[];
  booked: string[];
  prices: Record<string, number>;
  minStay?: number;
  maxStay?: number;
}

class Beds24LongLifeService {
  private readonly config: Beds24LongLifeConfig;
  private lastApiCall: number = 0;
  private readonly minDelayBetweenCalls = 2000; // 2 seconds per Beds24 guidelines

  constructor() {
    // Use Long Life Token from environment
    const longLifeToken = process.env.BEDS24_LONG_LIFE_TOKEN;
    
    if (!longLifeToken) {
      throw new Error('BEDS24_LONG_LIFE_TOKEN environment variable is required');
    }
    
    this.config = {
      longLifeToken,
      baseUrl: process.env.BEDS24_BASE_URL || 'https://api.beds24.com/v2',
      propId: process.env.BEDS24_PROP_ID || '357931'
    };

    console.log('Beds24LongLifeService initialized:', {
      baseUrl: this.config.baseUrl,
      propId: this.config.propId,
      hasLongLifeToken: !!this.config.longLifeToken,
      tokenLength: this.config.longLifeToken.length
    });
  }

  /**
   * Rate limiting - ensure we don't exceed Beds24 API limits
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastApiCall;
    
    if (timeSinceLastCall < this.minDelayBetweenCalls) {
      const waitTime = this.minDelayBetweenCalls - timeSinceLastCall;
      console.log(`Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastApiCall = Date.now();
  }

  /**
   * Make authenticated API request using Long Life Token
   */
  private async makeApiRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    await this.enforceRateLimit();

    const url = `${this.config.baseUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'token': this.config.longLifeToken, // Long Life Token in header
      'User-Agent': 'ApartmanyVita/2.0-LongLife',
      ...options.headers
    };

    console.log(`🚀 Making Long Life Token API request to: ${url}`);
    console.log(`🔑 Token (first 20 chars): ${this.config.longLifeToken.substring(0, 20)}...`);
    
    const response = await fetch(url, {
      ...options,
      headers
    });

    console.log(`📊 Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API request failed: ${response.status} ${response.statusText}`, errorText);
      
      // More detailed error logging
      console.error(`❌ Request details:`, {
        url,
        method: options.method || 'GET',
        headers: {
          ...headers,
          token: `${this.config.longLifeToken.substring(0, 20)}...` // Don't log full token
        },
        body: options.body
      });
      
      throw new Error(`Beds24 API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response;
  }

  /**
   * Get inventory calendar for availability and pricing
   * Simplified approach using Long Life Token
   */
  async getInventoryCalendar(request: AvailabilityRequest): Promise<AvailabilityResponse> {
    try {
      console.log('🔄 EXACT COPY of old system logic with Long Life Token:', request);

      // STEP 1: Try getInventoryOffers for dynamic pricing (EXACT COPY from old system)
      try {
        console.log('💰 Trying offers-style API for dynamic pricing (like old system)...');
        const offersResponse = await this.getInventoryOffersLongLife({
          ...request,
          adults: 2, // Default adults for pricing
          children: 0
        });
        
        console.log('✅ Offers-style API successful - using dynamic pricing');
        return offersResponse;
        
      } catch (offersError) {
        console.warn('⚠️ Offers-style API failed, using fallback (like old system):', offersError);
      }

      // STEP 2: Fallback - combine Bookings + Calendar API (EXACT COPY from old system)
      console.log('📋 Fallback: Combining Bookings + Calendar API...');
      
      // Get real bookings from Bookings API
      const bookingsEndpoint = `/bookings?propId=${request.propId}&roomId=${request.roomId}&checkIn=${request.startDate}&checkOut=${request.endDate}`;
      const bookingsResponse = await this.makeApiRequest(bookingsEndpoint, { method: 'GET' });
      const bookingsData = await bookingsResponse.json();
      const bookingsResult = this.parseBookingsResponse(bookingsData, request);

      // Get blocked dates from Calendar API
      const calendarEndpoint = `/inventory/rooms/calendar?startDate=${request.startDate}&endDate=${request.endDate}&propertyId=${request.propId}&roomId=${request.roomId}&includePrices=true&includeNumAvail=true&includeMinStay=true`;
      const calendarResponse = await this.makeApiRequest(calendarEndpoint, { method: 'GET' });
      const calendarData = await calendarResponse.json();
      const calendarResult = this.parseCalendarResponse(calendarData, request);

      // Combine results: booked dates from both sources
      const combinedBooked = new Set([
        ...bookingsResult.booked,
        ...calendarResult.booked
      ]);

      // Available dates = all dates minus booked dates
      const startDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);
      const available: string[] = [];
      const booked: string[] = Array.from(combinedBooked);

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (!combinedBooked.has(dateStr)) {
          available.push(dateStr);
        }
      }

      console.log('✅ Combined Bookings + Calendar API successful:', {
        totalDates: available.length + booked.length,
        available: available.length,
        booked: booked.length,
        bookedFromBookings: bookingsResult.booked.length,
        bookedFromCalendar: calendarResult.booked.length
      });

      // FIXED: Use real prices from calendar API, not hardcoded bookings prices
      return {
        available,
        booked,
        prices: calendarResult.prices, // FIXED: Use real Beds24 prices from Calendar API
        minStay: bookingsResult.minStay,
        maxStay: bookingsResult.maxStay
      };

    } catch (error) {
      console.error('Error getting inventory calendar:', error);
      throw error;
    }
  }

  /**
   * Get inventory offers for dynamic pricing - EXACT COPY from old system
   * Use Bookings API for real reservations + Calendar API for blocked dates
   */
  async getInventoryOffersLongLife(request: AvailabilityRequest & { 
    adults: number; 
    children?: number;
    isCalendar?: boolean; 
  }): Promise<AvailabilityResponse> {
    try {
      console.log('⚠️ Offers API not working - combining Bookings + Calendar API for complete availability (Long Life Token)');
      
      // Get real bookings from Bookings API
      const bookingsEndpoint = `/bookings?propId=${request.propId}&roomId=${request.roomId}&checkIn=${request.startDate}&checkOut=${request.endDate}`;
      const bookingsResponse = await this.makeApiRequest(bookingsEndpoint, { method: 'GET' });
      const bookingsData = await bookingsResponse.json();
      const bookingsResult = this.parseBookingsResponse(bookingsData, request);

      // Get blocked dates from Calendar API
      const calendarEndpoint = `/inventory/rooms/calendar?startDate=${request.startDate}&endDate=${request.endDate}&propertyId=${request.propId}&roomId=${request.roomId}&includePrices=true&includeNumAvail=true&includeMinStay=true`;
      const calendarResponse = await this.makeApiRequest(calendarEndpoint, { method: 'GET' });
      const calendarData = await calendarResponse.json();
      const calendarResult = this.parseCalendarResponse(calendarData, request);

      // Combine results: booked dates from both sources
      const combinedBooked = new Set([
        ...bookingsResult.booked,
        ...calendarResult.booked
      ]);

      // Available dates = all dates minus booked dates
      const startDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);
      const available: string[] = [];
      const booked: string[] = Array.from(combinedBooked);

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (!combinedBooked.has(dateStr)) {
          available.push(dateStr);
        }
      }

      console.log('✅ Combined Bookings + Calendar API successful (Long Life Token):', {
        totalDates: available.length + booked.length,
        available: available.length,
        booked: booked.length,
        bookedFromBookings: bookingsResult.booked.length,
        bookedFromCalendar: calendarResult.booked.length
      });

      // FIXED: Use real prices from calendar API, not hardcoded bookings prices
      return {
        available,
        booked,
        prices: calendarResult.prices, // FIXED: Use real Beds24 prices from Calendar API
        minStay: bookingsResult.minStay,
        maxStay: bookingsResult.maxStay
      };
      
    } catch (error) {
      console.error('Error in combined API fallback (Long Life Token):', error);
      throw error;
    }
  }

  /**
   * Parse bookings response - same logic as old system
   */
  private parseBookingsResponse(data: unknown, request: AvailabilityRequest): AvailabilityResponse {
    const available: string[] = [];
    const booked: string[] = [];
    const prices: Record<string, number> = {};

    console.log('🔍 Parsing bookings response with Long Life Token:', { data, request });

    // Generate date range first
    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);
    
    // Handle bookings response format
    let bookingsData: unknown[] = [];
    
    if (data && typeof data === 'object') {
      if ('data' in data && Array.isArray((data as { data: unknown[] }).data)) {
        bookingsData = (data as { data: unknown[] }).data;
      } else if (Array.isArray(data)) {
        bookingsData = data;
      }
    }

    console.log('📋 Found booking items:', bookingsData.length);
    
    // Process bookings to find booked dates
    const bookedDatesSet = new Set<string>();
    
    bookingsData.forEach((booking: unknown) => {
      if (booking && typeof booking === 'object') {
        const bookingObj = booking as Record<string, unknown>;
        
        const arrival = bookingObj.arrival as string;
        const departure = bookingObj.departure as string;
        const status = bookingObj.status as string;
        const roomId = bookingObj.roomId?.toString();
        const rateDescription = bookingObj.rateDescription as string;
        const price = bookingObj.price as number;
        
        // Only consider confirmed or new bookings for the specific room
        if (arrival && departure && (status === 'confirmed' || status === 'new')) {
          if (!request.roomId || roomId === request.roomId) {
            const arrivalDate = new Date(arrival);
            const departureDate = new Date(departure);
            
            // Mark all dates in booking range as booked
            for (let d = new Date(arrivalDate); d < departureDate; d.setDate(d.getDate() + 1)) {
              const dateStr = d.toISOString().split('T')[0];
              bookedDatesSet.add(dateStr);
            }
            
            // EXTRACT REAL PRICES from rateDescription (like old system)
            if (rateDescription && typeof rateDescription === 'string') {
              console.log(`💰 Parsing rate description for booking ${arrival}-${departure}:`, rateDescription);
              
              // Parse daily prices from rateDescription (format: "2025-10-03 (...) EUR 121.50")
              const priceMatches = rateDescription.match(/(\d{4}-\d{2}-\d{2}).*?EUR\s+([\d.]+)/g);
              if (priceMatches) {
                priceMatches.forEach(match => {
                  const dateMatch = match.match(/(\d{4}-\d{2}-\d{2})/);
                  const priceMatch = match.match(/EUR\s+([\d.]+)/);
                  
                  if (dateMatch && priceMatch) {
                    const date = dateMatch[1];
                    const dailyPrice = parseFloat(priceMatch[1]);
                    
                    if (dailyPrice > 0) {
                      prices[date] = dailyPrice;
                      console.log(`💰 Extracted price for ${date}: ${dailyPrice}€`);
                    }
                  }
                });
              }
            }
            
            // Fallback: use total price divided by nights if no daily prices found
            if (price && price > 0 && !rateDescription) {
              const nights = Math.ceil((new Date(departure).getTime() - new Date(arrival).getTime()) / (1000 * 60 * 60 * 24));
              const pricePerNight = price / nights;
              
              for (let d = new Date(arrivalDate); d < departureDate; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                if (!prices[dateStr]) {
                  prices[dateStr] = Math.round(pricePerNight * 100) / 100;
                  console.log(`💰 Calculated price for ${dateStr}: ${prices[dateStr]}€`);
                }
              }
            }
            
            console.log(`📅 Booking found: ${arrival} to ${departure} (${status}) - roomId: ${roomId}, price: ${price}€`);
          }
        }
      }
    });
    
    // Generate all dates in range and check availability
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      
      if (bookedDatesSet.has(dateStr)) {
        booked.push(dateStr);
        console.log(`📅 Date ${dateStr} is booked`);
      } else {
        available.push(dateStr);
      }
    }

    // Use internal pricing (Long Life Token is READ-only for pricing)
    const apartmentPricing: Record<string, number> = {
      '483027': 105, // design-apartman
      '357932': 75,  // lite-apartman
      '357931': 100, // deluxe-apartman
    };
    
    const basePrice = apartmentPricing[request.roomId] || 75;
    
    // STRICT: Only set price for AVAILABLE dates (same as old system)
    // No prices for booked dates - only real data from Beds24
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      
      // Only set price if date is available (not booked)
      if (!bookedDatesSet.has(dateStr)) {
        prices[dateStr] = basePrice;
      }
    }

    console.log('✅ Parsed bookings result with Long Life Token:', {
      available: available.length,
      booked: booked.length,
      pricesCount: Object.keys(prices).length,
      bookedDates: booked
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
   * Parse calendar response for manual blocks AND PRICES - same logic as old system
   */
  private parseCalendarResponse(data: unknown, request: AvailabilityRequest): AvailabilityResponse {
    const available: string[] = [];
    const booked: string[] = [];
    const prices: Record<string, number> = {};

    console.log('🔍 Parsing calendar response with Long Life Token:', { 
      dataType: typeof data,
      isArray: Array.isArray(data),
      request: { roomId: request.roomId, startDate: request.startDate, endDate: request.endDate }
    });

    // Generate date range first
    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);
    
    // Handle calendar response format - SAME AS OLD SYSTEM
    let calendarData: unknown[] = [];
    
    if (data && typeof data === 'object') {
      // Extract calendar data array - Handle nested calendar structure
      if ('data' in data && Array.isArray((data as { data: unknown[] }).data)) {
        const dataArray = (data as { data: unknown[] }).data;
        // Check if data contains room objects with calendar arrays
        if (dataArray.length > 0 && dataArray[0] && typeof dataArray[0] === 'object') {
          const roomData = dataArray[0] as Record<string, unknown>;
          if ('calendar' in roomData && Array.isArray(roomData.calendar)) {
            calendarData = roomData.calendar;
            console.log('📅 Found nested calendar data in room object');
          } else {
            // Fallback: treat data array as calendar data directly
            calendarData = dataArray;
            console.log('📅 Using data array as calendar data directly');
          }
        }
      } else if ('calendar' in data && Array.isArray((data as { calendar: unknown[] }).calendar)) {
        calendarData = (data as { calendar: unknown[] }).calendar;
        console.log('📅 Found calendar data in root calendar field');
      } else if (Array.isArray(data)) {
        calendarData = data;
        console.log('📅 Using root array as calendar data');
      }
    }

    console.log('📅 Found calendar items:', calendarData.length);
    
    // Create a map of date -> calendar info (SAME AS OLD SYSTEM)
    const calendarMap: Record<string, { 
      available: boolean; 
      price?: number; 
      blocked?: boolean;
      numAvail?: number;
    }> = {};
    
    // Process calendar data items - Handle date ranges (from/to) and prices
    calendarData.forEach((item: unknown, index: number) => {
      if (item && typeof item === 'object') {
        const itemObj = item as Record<string, unknown>;
        
        let dates: string[] = [];
        let isAvailable: boolean = true;
        let price: number | null = null;
        let isBlocked: boolean = false;
        let numAvail: number | null = null;
        
        // Handle date ranges (from/to) - SAME AS OLD SYSTEM
        if ('from' in itemObj && 'to' in itemObj && 
            typeof itemObj.from === 'string' && typeof itemObj.to === 'string') {
          // Generate all dates in range
          const fromDate = new Date(itemObj.from);
          const toDate = new Date(itemObj.to);
          
          for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
            dates.push(d.toISOString().split('T')[0]);
          }
          
          console.log(`📅 Calendar range ${index + 1}: ${itemObj.from} to ${itemObj.to} (${dates.length} dates)`);
        }
        // Handle single dates (legacy format)
        else if ('date' in itemObj && typeof itemObj.date === 'string') {
          dates = [itemObj.date];
        } else if ('day' in itemObj && typeof itemObj.day === 'string') {
          dates = [itemObj.day];
        }
        
        // Number available field - KEY FIELD FOR BLOCKING
        if ('numAvail' in itemObj && typeof itemObj.numAvail === 'number') {
          numAvail = itemObj.numAvail;
          isAvailable = numAvail > 0;
          isBlocked = numAvail === 0;
          console.log(`📊 numAvail for dates ${dates.join(',')}: ${numAvail} (${isBlocked ? 'BLOCKED' : 'AVAILABLE'})`);
        }
        
        // Price field variations (SAME AS OLD SYSTEM)
        if ('price1' in itemObj && typeof itemObj.price1 === 'number') {
          price = itemObj.price1;
        } else if ('price' in itemObj && typeof itemObj.price === 'number') {
          price = itemObj.price;
        } else if ('rate' in itemObj && typeof itemObj.rate === 'number') {
          price = itemObj.rate;
        } else if ('amount' in itemObj && typeof itemObj.amount === 'number') {
          price = itemObj.amount;
        }
        
        if (price && price > 0) {
          console.log(`💰 Found price for dates ${dates.join(',')}: ${price}€`);
        }
        
        // Apply settings to all dates in range
        dates.forEach(date => {
          calendarMap[date] = { 
            available: isAvailable,
            blocked: isBlocked,
            numAvail: numAvail || undefined,
            price: price || undefined
          };
        });
      }
    });
    
    // Generate all dates in range and check availability + prices
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const calendarInfo = calendarMap[dateStr];
      
      if (calendarInfo && calendarInfo.blocked) {
        booked.push(dateStr);
        console.log(`📅 Date ${dateStr} is manually blocked`);
      } else {
        available.push(dateStr);
        
        // Set price if available from calendar API
        if (calendarInfo && calendarInfo.price && calendarInfo.price > 0) {
          prices[dateStr] = calendarInfo.price;
          console.log(`💰 Calendar price for ${dateStr}: ${calendarInfo.price}€`);
        }
      }
    }

    console.log('✅ Parsed calendar result with Long Life Token:', {
      available: available.length,
      booked: booked.length,
      pricesFromCalendar: Object.keys(prices).length,
      blockedDates: booked
    });

    return {
      available,
      booked,
      prices, // Real prices from Calendar API
      minStay: 1,
      maxStay: 30
    };
  }

  /**
   * Test Long Life Token authentication
   */
  async testAuthentication(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      console.log('Testing Long Life Token authentication...');
      
      const response = await this.makeApiRequest('/properties');
      const data = await response.json();
      
      return {
        success: true,
        message: 'Long Life Token authentication successful',
        data: {
          propertiesCount: data.data?.length || 0,
          properties: data.data?.slice(0, 3) // First 3 properties for testing
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Authentication test failed'
      };
    }
  }
}

// Singleton instance
let beds24LongLifeServiceInstance: Beds24LongLifeService | null = null;

export function getBeds24LongLifeService(): Beds24LongLifeService | null {
  try {
    if (!beds24LongLifeServiceInstance) {
      beds24LongLifeServiceInstance = new Beds24LongLifeService();
    }
    return beds24LongLifeServiceInstance;
  } catch (error) {
    console.error('Failed to initialize Beds24LongLifeService:', error);
    return null;
  }
}

export default Beds24LongLifeService;
