/**
 * Beds24 API Integration Service
 * Handles availability, pricing, and booking management
 */

import { eachDayOfInterval, parseISO, format } from 'date-fns';

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
  numAdults?: number;
  numChildren?: number;
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
  private lastApiCall: number = 0;
  private readonly minDelayBetweenCalls = 2000; // 2 seconds per Beds24 guidelines
  private readonly maxRequestsPerMinute = 30; // ENHANCED: Per official documentation
  private requestCount: number = 0;
  private requestWindowStart: number = Date.now();
  
  // ENHANCED: Rate limiting per official OpenAPI specification
  private rateLimitInfo: {
    fiveMinLimit?: number;
    fiveMinRemaining?: number;
    fiveMinResetsIn?: number;
    requestCost?: number;
  } = {};

  constructor() {
    // PRIORITY 1: Try Long Life Token (official method)
    const longLifeToken = process.env.BEDS24_LONG_LIFE_TOKEN;
    
    if (longLifeToken) {
      console.log('Using Long Life Token authentication (official method)');
      this.config = {
        accessToken: longLifeToken,
        refreshToken: '', // Not needed for Long Life Token
        baseUrl: process.env.BEDS24_BASE_URL || 'https://api.beds24.com/v2',
        propId: process.env.BEDS24_PROP_ID || '357931',
        tokenExpiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000) // Long life token expires in 1 year
      };
      return;
    }

    // FALLBACK: Use legacy refresh token system
    const accessToken = process.env.BEDS24_ACCESS_TOKEN;
    const refreshToken = process.env.BEDS24_REFRESH_TOKEN;
    
    if (!accessToken || !refreshToken) {
      throw new Error('Either BEDS24_LONG_LIFE_TOKEN or both BEDS24_ACCESS_TOKEN and BEDS24_REFRESH_TOKEN environment variables are required');
    }
    
    console.log('Using legacy refresh token authentication (fallback method)');
    
    this.config = {
      accessToken,
      refreshToken,
      baseUrl: process.env.BEDS24_BASE_URL || 'https://api.beds24.com/v2',
      propId: process.env.BEDS24_PROP_ID || '357931',
      // FIXED: Set token as expired initially to force refresh on first use
      tokenExpiresAt: Date.now() - 1000 // Already expired, will trigger refresh
    };

    // Debug logging
    console.log('Beds24Service initialized:', {
      baseUrl: this.config.baseUrl,
      propId: this.config.propId,
      hasAccessToken: !!this.config.accessToken,
      hasRefreshToken: !!this.config.refreshToken,
      tokenExpiresAt: this.config.tokenExpiresAt ? new Date(this.config.tokenExpiresAt).toISOString() : 'not set',
      willRefreshOnFirstUse: this.config.tokenExpiresAt ? this.config.tokenExpiresAt < Date.now() : false
    });
  }

  /**
   * Process rate limiting headers from Beds24 API response
   * ENHANCED: Per official OpenAPI specification
   */
  private processRateLimitHeaders(response: Response): void {
    const fiveMinLimit = response.headers.get('X-FiveMinCreditLimit');
    const fiveMinRemaining = response.headers.get('X-FiveMinCreditLimit-Remaining');
    const fiveMinResetsIn = response.headers.get('X-FiveMinCreditLimit-ResetsIn');
    const requestCost = response.headers.get('X-RequestCost');

    if (fiveMinLimit) this.rateLimitInfo.fiveMinLimit = parseInt(fiveMinLimit);
    if (fiveMinRemaining) this.rateLimitInfo.fiveMinRemaining = parseInt(fiveMinRemaining);
    if (fiveMinResetsIn) this.rateLimitInfo.fiveMinResetsIn = parseInt(fiveMinResetsIn);
    if (requestCost) this.rateLimitInfo.requestCost = parseInt(requestCost);

    console.log('Rate limit info:', this.rateLimitInfo);
  }

  /**
   * Rate limiting per Beds24 guidelines - wait between API calls
   * ENHANCED: Per official Beds24 API V2 documentation
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastApiCall;
    
    // ENHANCED: Check requests per minute limit
    if (now - this.requestWindowStart >= 60000) { // Reset window every minute
      this.requestCount = 0;
      this.requestWindowStart = now;
    }
    
    if (this.requestCount >= this.maxRequestsPerMinute) {
      const waitTime = 60000 - (now - this.requestWindowStart);
      console.log(`Rate limiting: exceeded ${this.maxRequestsPerMinute} requests per minute, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.requestWindowStart = Date.now();
    }
    
    // Wait between individual calls
    if (timeSinceLastCall < this.minDelayBetweenCalls) {
      const delayNeeded = this.minDelayBetweenCalls - timeSinceLastCall;
      console.log(`Rate limiting: waiting ${delayNeeded}ms before next API call`);
      await new Promise(resolve => setTimeout(resolve, delayNeeded));
    }
    
    this.lastApiCall = Date.now();
    this.requestCount++;
  }

  /**
   * Check if access token is expired and refresh if needed
   */
  public async ensureValidToken(): Promise<string> {
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
   * RESTORED: Original working implementation
   */
  private async refreshAccessToken(): Promise<void> {
    try {
      console.log('Refreshing Beds24 access token...');
      
      // RESTORED: Use GET method with refreshToken in header (original working version)
      const response = await fetch(`${this.config.baseUrl}/authentication/token`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'refreshToken': this.config.refreshToken,
          'User-Agent': 'ApartmanyVita/1.0'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Token refresh failed:', errorText);
        throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // RESTORED: Handle official response format per OpenAPI specification
      if (data.token && data.expiresIn) {
        // Official response format: { token: string, expiresIn: number }
        const config = this.config as Beds24Config & { 
          accessToken: string; 
          tokenExpiresAt: number; 
        };
        config.accessToken = data.token;
        config.tokenExpiresAt = Date.now() + (data.expiresIn * 1000);
        
        console.log('Access token refreshed successfully');
      } else if (data.success && data.data) {
        // Fallback for alternative response format
        const config = this.config as Beds24Config & { 
          accessToken: string; 
          refreshToken: string; 
          tokenExpiresAt: number; 
        };
        config.accessToken = data.data.accessToken;
        config.refreshToken = data.data.refreshToken;
        config.tokenExpiresAt = Date.now() + (data.data.expiresIn * 1000);
        
        console.log('Access token refreshed successfully (fallback format)');
      } else if (data.token && data.refreshToken) {
        // Legacy response format
        const config = this.config as Beds24Config & { 
          accessToken: string; 
          refreshToken: string; 
          tokenExpiresAt: number; 
        };
        config.accessToken = data.token;
        config.refreshToken = data.refreshToken;
        config.tokenExpiresAt = Date.now() + (data.expiresIn * 1000);
        
        console.log('Access token refreshed successfully (alternative format)');
      } else {
        console.error('Unexpected refresh response format:', data);
        throw new Error('Invalid refresh response format');
      }
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Get inventory and availability for specific date range - SIMPLIFIED APPROACH
   * FIXED: Direct approach using bookings API for accurate availability
   */
  async getInventory(request: AvailabilityRequest & { 
    adults?: number; 
    children?: number; 
    isCalendar?: boolean;
  }): Promise<AvailabilityResponse> {
    try {
      console.log('🔍 Fetching inventory (SIMPLIFIED):', {
        propId: request.propId,
        roomId: request.roomId,
        dateRange: `${request.startDate} to ${request.endDate}`,
        adults: request.adults,
        children: request.children,
        isCalendar: request.isCalendar
      });

      // For calendar display, use offers API to get blocked dates
      if (request.isCalendar) {
        console.log('📅 Calendar mode: using offers API for blocked dates');
        
        try {
          const offersResponse = await this.getInventoryOffers({
            ...request,
            adults: request.adults || 2,
            children: request.children || 0,
            isCalendar: true
          });
          
          console.log('📅 Offers API result for calendar:', {
            roomId: request.roomId,
            available: offersResponse.available.length,
            booked: offersResponse.booked.length
          });
          
          // If offers API has any available dates, use it
          if (offersResponse.available.length > 0) {
            console.log('✅ Offers API shows availability - using offers data');
            return offersResponse;
          }
          
          // If offers shows all blocked, try calendar API for comparison
          console.log('⚠️ Offers API shows all blocked - trying Calendar API');
          try {
            const calendarResponse = await this.getInventoryCalendar({
              propId: request.propId,
              roomId: request.roomId,
              startDate: request.startDate,
              endDate: request.endDate
            });
            
            console.log('📅 Calendar API result:', {
              available: calendarResponse.available.length,
              booked: calendarResponse.booked.length
            });
            
            // Use calendar API result (respects individual apartment settings)
            return calendarResponse;
            
          } catch (calendarError) {
            console.warn('⚠️ Calendar API also failed, using offers result:', calendarError);
            return offersResponse;
          }
          
        } catch (offersError) {
          console.warn('⚠️ Offers API failed for calendar, falling back to calendar API:', offersError);
        }
      }

      // For booking or fallback, use bookings API
      const bookingsResponse = await this.getBookings({
        propId: request.propId,
        roomId: request.roomId,
        startDate: request.startDate,
        endDate: request.endDate
      });

      console.log('📅 Bookings API result:', {
        available: bookingsResponse.available.length,
        booked: bookingsResponse.booked.length
      });

      // For calendar display fallback, use base prices without discounts
      if (request.isCalendar) {
        const basePrice = this.getCalendarPrice(request.roomId);
        const calendarPrices: Record<string, number> = {};
        
        // Set base price for all dates (available and booked)
        const startDate = new Date(request.startDate);
        const endDate = new Date(request.endDate);
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          calendarPrices[dateStr] = basePrice;
        }
        
        console.log(`📅 Calendar mode: using base price ${basePrice}€ for all dates`);
        
        return {
          available: bookingsResponse.available,
          booked: bookingsResponse.booked,
          prices: calendarPrices,
          minStay: 1,
          maxStay: 30
        };
      }

      // For booking mode, try to get dynamic pricing from offers API
      if (request.adults && request.adults > 0) {
        try {
          console.log('💰 Trying offers API for dynamic pricing...');
          const offersResponse = await this.getInventoryOffers({
            ...request,
            adults: request.adults,
            children: request.children || 0
          });
          
          // Use availability from bookings but pricing from offers
          return {
            available: bookingsResponse.available,
            booked: bookingsResponse.booked,
            prices: offersResponse.prices,
            minStay: 1,
            maxStay: 30
          };
        } catch (offersError) {
          console.warn('⚠️ Offers API failed, using fallback pricing:', offersError);
        }
      }

      // Fallback: use bookings availability with calculated pricing
      console.log('💰 Using fallback pricing calculation');
      return bookingsResponse;
      
    } catch (error) {
      console.error('❌ Error in inventory fetch:', error);
      throw error;
    }
  }

  /**
   * Get inventory calendar for pricing - API V2 (CORRECTED per Beds24 docs)
   */
  async getInventoryCalendar(request: AvailabilityRequest): Promise<AvailabilityResponse> {
    try {
      await this.enforceRateLimit();
      const accessToken = await this.ensureValidToken();
      
      // ENHANCED: Use correct endpoint with all include parameters (based on successful tests)
      const calendarUrl = new URL(`${this.config.baseUrl}/inventory/rooms/calendar`);
      calendarUrl.searchParams.set('startDate', request.startDate);
      calendarUrl.searchParams.set('endDate', request.endDate);
      calendarUrl.searchParams.set('propertyId', request.propId);
      
      if (request.roomId) {
        calendarUrl.searchParams.set('roomId', request.roomId);
      }
      
      // Add all include parameters for complete data (based on successful schema tests)
      calendarUrl.searchParams.set('includePrices', 'true');
      calendarUrl.searchParams.set('includeNumAvail', 'true');
      calendarUrl.searchParams.set('includeMinStay', 'true');
      calendarUrl.searchParams.set('includeMaxStay', 'true');
      calendarUrl.searchParams.set('includeMultiplier', 'true');
      calendarUrl.searchParams.set('includeOverride', 'true');
      calendarUrl.searchParams.set('includeChannels', 'true');

      console.log('Calendar URL (ENHANCED with all includes):', calendarUrl.toString());
      console.log('Calendar API request details:', {
        url: calendarUrl.toString(),
        hasToken: !!accessToken,
        tokenLength: accessToken?.length || 0,
        tokenPrefix: accessToken?.substring(0, 10) + '...'
      });

      const calendarResponse = await fetch(calendarUrl.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'token': accessToken,
          'User-Agent': 'ApartmanyVita/1.0'
        }
      });

      // ENHANCED: Process rate limiting headers per official specification
      this.processRateLimitHeaders(calendarResponse);

      console.log('Calendar response status:', calendarResponse.status);

      if (!calendarResponse.ok) {
        const errorText = await calendarResponse.text();
        console.error('Calendar API error:', errorText);
        
        // STRICT: No fallbacks - throw error immediately
        if (calendarResponse.status === 401) {
          throw new Error('Beds24 Authentication failed - invalid API credentials');
        } else if (calendarResponse.status === 429) {
          throw new Error('Beds24 Rate limit exceeded - too many requests');
        } else if (calendarResponse.status >= 500) {
          throw new Error('Beds24 Server error - service temporarily unavailable');
        } else {
          throw new Error(`Beds24 Calendar API error: ${calendarResponse.status} - ${errorText}`);
        }
      }

      const calendarData = await calendarResponse.json();
      console.log('Calendar data received:', calendarData);
      
      return this.parseInventoryCalendarResponseV2(calendarData, request);
    } catch (error) {
      console.error('Error fetching calendar from Beds24:', error);
      // STRICT: No fallbacks - rethrow error
      throw error;
    }
  }

  /**
   * Get bookings for availability checking - API V2
   */
  async getBookings(request: AvailabilityRequest): Promise<AvailabilityResponse> {
    try {
      await this.enforceRateLimit();
      const accessToken = await this.ensureValidToken();
      
      const bookingsUrl = new URL(`${this.config.baseUrl}/bookings`);
      bookingsUrl.searchParams.set('propId', request.propId);
      if (request.roomId) {
        bookingsUrl.searchParams.set('roomId', request.roomId);
      }
      bookingsUrl.searchParams.set('checkIn', request.startDate);
      bookingsUrl.searchParams.set('checkOut', request.endDate);

      console.log('Bookings URL:', bookingsUrl.toString());

      const response = await fetch(bookingsUrl.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'token': accessToken,
          'User-Agent': 'ApartmanyVita/1.0'
        }
      });

      console.log('Bookings response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Bookings API error:', errorText);
        // STRICT: No fallbacks - throw error immediately
        throw new Error(`Beds24 Bookings API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Bookings data received:', data);
      
      return this.parseBookingsResponseV2(data, request);
    } catch (error) {
      console.error('Error fetching bookings from Beds24:', error);
      // STRICT: No fallbacks - rethrow error
      throw error;
    }
  }

  /**
   * Get inventory offers for dynamic pricing - COMBINE Bookings + Calendar API
   * Use Bookings API for real reservations + Calendar API for blocked dates
   */
  async getInventoryOffers(request: AvailabilityRequest & { 
    adults: number; 
    children?: number;
    isCalendar?: boolean; 
  }): Promise<AvailabilityResponse> {
    try {
      console.log('⚠️ Offers API not working - combining Bookings + Calendar API for complete availability');
      
      // Get real bookings from Bookings API
      const bookingsResponse = await this.getBookings({
        propId: request.propId,
        roomId: request.roomId,
        startDate: request.startDate,
        endDate: request.endDate
      });

      // Get blocked dates from Calendar API
      const calendarResponse = await this.getInventoryCalendar({
        propId: request.propId,
        roomId: request.roomId,
        startDate: request.startDate,
        endDate: request.endDate
      });

      // Combine results: booked dates from both sources
      const combinedBooked = new Set([
        ...bookingsResponse.booked,
        ...calendarResponse.booked
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
        bookedFromBookings: bookingsResponse.booked.length,
        bookedFromCalendar: calendarResponse.booked.length
      });

      return {
        available,
        booked,
        prices: bookingsResponse.prices, // Use prices from bookings
        minStay: bookingsResponse.minStay,
        maxStay: bookingsResponse.maxStay
      };
      
    } catch (error) {
      console.error('Error in combined API fallback:', error);
      throw error;
    }
  }

  /**
   * Get properties information - API V2 (NEW per Beds24 docs)
   */
  async getProperties(propId?: string, includeAllRooms: boolean = true): Promise<unknown> {
    try {
      await this.enforceRateLimit();
      const accessToken = await this.ensureValidToken();
      
      // ENHANCED: Add all include parameters based on successful schema tests
      const propertiesUrl = new URL(`${this.config.baseUrl}/properties`);
      
      if (propId) {
        propertiesUrl.searchParams.set('id', propId);
      }
      if (includeAllRooms) {
        propertiesUrl.searchParams.set('includeAllRooms', 'true');
      }
      
      // Add all include parameters for complete data (based on successful tests)
      propertiesUrl.searchParams.set('includeTexts', 'true');
      propertiesUrl.searchParams.set('includePriceRules', 'true');
      propertiesUrl.searchParams.set('includeOffers', 'true');
      propertiesUrl.searchParams.set('includeUpsellItems', 'true');
      
      console.log('Properties URL (ENHANCED with all includes):', propertiesUrl.toString());
      
      const response = await fetch(propertiesUrl.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'token': accessToken,
          'User-Agent': 'ApartmanyVita/1.0'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Properties API error:', errorText);
        throw new Error(`Failed to get properties: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Properties data received (with all includes):', data);
      return data;
    } catch (error) {
      console.error('Error fetching properties from Beds24:', error);
      throw error;
    }
  }

  /**
   * Parse properties data to extract room configurations and amenities (NEW)
   */
  async getApartmentConfigurations(): Promise<Record<string, {
    propId: string;
    roomId: string;
    name: string;
    maxPeople: number;
    maxAdult: number | null;
    maxChildren: number | null;
    rackRate: number;
    minPrice: number;
    maxStay: number;
    minStay: number | null;
    checkInStart: string;
    checkInEnd: string;
    checkOutEnd: string;
    amenities: string[];
    bedConfiguration: string[];
    roomSize: number | null;
    currency: string;
    bookingRules: {
      allowGuestCancellation: boolean;
      bookingType: string;
      vatRatePercentage: number;
    };
  }>> {
    try {
      const propertiesData = await this.getProperties();
      const configurations: Record<string, {
        propId: string;
        roomId: string;
        name: string;
        maxPeople: number;
        maxAdult: number | null;
        maxChildren: number | null;
        rackRate: number;
        minPrice: number;
        maxStay: number;
        minStay: number | null;
        checkInStart: string;
        checkInEnd: string;
        checkOutEnd: string;
        amenities: string[];
        bedConfiguration: string[];
        roomSize: number | null;
        currency: string;
        bookingRules: {
          allowGuestCancellation: boolean;
          bookingType: string;
          vatRatePercentage: number;
        };
      }> = {};

      if (propertiesData && typeof propertiesData === 'object' && 'data' in propertiesData) {
        const properties = (propertiesData as { data: unknown[] }).data;

        for (const property of properties) {
          if (property && typeof property === 'object') {
            const prop = property as Record<string, unknown>;
            
            if ('roomTypes' in prop && Array.isArray(prop.roomTypes)) {
              for (const roomType of prop.roomTypes) {
                if (roomType && typeof roomType === 'object') {
                  const room = roomType as Record<string, unknown>;
                  
                  // Extract amenities from featureCodes
                  const amenities: string[] = [];
                  const bedConfiguration: string[] = [];
                  
                  if ('featureCodes' in room && Array.isArray(room.featureCodes)) {
                    for (const featureCode of room.featureCodes) {
                      if (Array.isArray(featureCode)) {
                        const feature = featureCode.join('_');
                        if (feature.includes('BED_')) {
                          bedConfiguration.push(feature);
                        } else {
                          amenities.push(feature);
                        }
                      }
                    }
                  }

                  // Map to our apartment naming convention
                  let apartmentKey = '';
                  const roomName = String(room.name || '').toLowerCase();
                  if (roomName.includes('deluxe')) {
                    apartmentKey = 'deluxe-apartman';
                  } else if (roomName.includes('lite')) {
                    apartmentKey = 'lite-apartman';
                  } else if (roomName.includes('design')) {
                    apartmentKey = 'design-apartman';
                  }

                  if (apartmentKey) {
                    configurations[apartmentKey] = {
                      propId: String(prop.id || ''),
                      roomId: String(room.id || ''),
                      name: String(room.name || ''),
                      maxPeople: Number(room.maxPeople || 2),
                      maxAdult: room.maxAdult ? Number(room.maxAdult) : null,
                      maxChildren: room.maxChildren ? Number(room.maxChildren) : null,
                      rackRate: Number(room.rackRate || 0),
                      minPrice: Number(room.minPrice || 0),
                      maxStay: Number(room.maxStay || 365),
                      minStay: room.minStay ? Number(room.minStay) : null,
                      checkInStart: String(prop.checkInStart || '16:00'),
                      checkInEnd: String(prop.checkInEnd || '24:00'),
                      checkOutEnd: String(prop.checkOutEnd || '10:00'),
                      amenities,
                      bedConfiguration,
                      roomSize: room.roomSize ? Number(room.roomSize) : null,
                      currency: String(prop.currency || 'EUR'),
                      bookingRules: {
                        allowGuestCancellation: Boolean(
                          prop.bookingRules && 
                          typeof prop.bookingRules === 'object' && 
                          'allowGuestCancellation' in prop.bookingRules &&
                          prop.bookingRules.allowGuestCancellation &&
                          typeof prop.bookingRules.allowGuestCancellation === 'object' &&
                          'type' in prop.bookingRules.allowGuestCancellation &&
                          prop.bookingRules.allowGuestCancellation.type !== 'never'
                        ),
                        bookingType: String(
                          prop.bookingRules && 
                          typeof prop.bookingRules === 'object' && 
                          'bookingType' in prop.bookingRules 
                            ? prop.bookingRules.bookingType 
                            : 'autoConfirmed'
                        ),
                        vatRatePercentage: Number(
                          prop.bookingRules && 
                          typeof prop.bookingRules === 'object' && 
                          'vatRatePercentage' in prop.bookingRules 
                            ? prop.bookingRules.vatRatePercentage 
                            : 0
                        )
                      }
                    };
                  }
                }
              }
            }
          }
        }
      }

      console.log('Parsed apartment configurations:', configurations);
      return configurations;
    } catch (error) {
      console.error('Error parsing apartment configurations:', error);
      throw error;
    }
  }

  /**
   * Get availability and pricing from offers endpoint - API V2
   */
  async getOffersAvailability(request: AvailabilityRequest): Promise<AvailabilityResponse> {
    const accessToken = await this.ensureValidToken();
    
    console.log('🎯 Fetching offers availability:', {
      url: `${this.config.baseUrl}/inventory/rooms/offers`,
      request
    });

    // Build URL with proper parameters
    const url = new URL(`${this.config.baseUrl}/inventory/rooms/offers`);
    
    // Add required parameters
    url.searchParams.append('arrival', request.startDate);
    url.searchParams.append('departure', request.endDate);
    url.searchParams.append('numAdults', (request.numAdults || 2).toString());
    url.searchParams.append('numChildren', (request.numChildren || 0).toString());
    
    // Add optional parameters
    if (request.propId) {
      url.searchParams.append('propertyId', request.propId);
    }
    if (request.roomId) {
      url.searchParams.append('roomId', request.roomId);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'token': accessToken
      }
    });

    console.log('Offers response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Offers API error:', errorText);
      throw new Error(`Beds24 Offers API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Offers data received:', JSON.stringify(data, null, 2));
    
    return await this.parseInventoryOffersResponseV2(data, { ...request, adults: request.numAdults || 2, children: request.numChildren || 0 }, false);
  }

  /**
   * Parse offers response from Beds24 V2 /inventory/rooms/offers endpoint
   */
  private parseOffersResponse(data: unknown, request: AvailabilityRequest): AvailabilityResponse {
    const available: string[] = [];
    const booked: string[] = [];
    const prices: Record<string, number> = {};

      console.log('Parsing offers response:', { data, request });

    // Generate date range first
    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);
    
    // Handle offers response format
    let offersData: unknown[] = [];
    
    if (data && typeof data === 'object') {
      if ('data' in data && Array.isArray((data as { data: unknown[] }).data)) {
        offersData = (data as { data: unknown[] }).data;
      } else if (Array.isArray(data)) {
        offersData = data;
      }
    }

    console.log('Found offers items:', offersData.length);
    
    // Create a map of roomId -> offers
    const roomOffersMap: Record<string, { available: boolean; price?: number }> = {};
    
    offersData.forEach((item: unknown) => {
      if (item && typeof item === 'object') {
        const itemObj = item as Record<string, unknown>;
        
        const roomId = itemObj.roomId?.toString();
        const offers = itemObj.offers;
        
        if (roomId && Array.isArray(offers) && offers.length > 0) {
          // Take the first offer (usually the best/default one)
          const firstOffer = offers[0];
          if (firstOffer && typeof firstOffer === 'object') {
            const offerObj = firstOffer as Record<string, unknown>;
            const unitsAvailable = typeof offerObj.unitsAvailable === 'number' ? offerObj.unitsAvailable : 0;
            const price = typeof offerObj.price === 'number' ? offerObj.price : undefined;
            
            roomOffersMap[roomId] = {
              available: unitsAvailable > 0,
              price
            };
          }
        }
      }
    });
    
    // Generate all dates in range and check availability
    for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      
      // Check if we have offers for the requested room
      const roomId = request.roomId;
      if (roomId && roomOffersMap[roomId]) {
        const roomOffer = roomOffersMap[roomId];
        if (roomOffer.available) {
          available.push(dateStr);
          if (roomOffer.price) {
            prices[dateStr] = roomOffer.price;
          }
        } else {
          booked.push(dateStr);
        }
      } else {
        // No specific room data, assume available but add default price
        available.push(dateStr);
        prices[dateStr] = 100; // Default fallback price
      }
    }

    console.log('Parsed offers result:', {
      available: available.length,
      booked: booked.length,
      pricesCount: Object.keys(prices).length,
      roomOffersMap
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
   * Get availability for specific date range - API V2 (STRICT - no fallbacks)
   */
  async getAvailability(request: AvailabilityRequest): Promise<AvailabilityResponse> {
    try {
      await this.enforceRateLimit();
      
      console.log('🔍 Getting availability from Beds24 (STRICT mode):', {
        propId: request.propId,
        roomId: request.roomId,
        dateRange: `${request.startDate} to ${request.endDate}`,
        numAdults: request.numAdults
      });

      // STRICT: Use specific API based on request type - no fallbacks
      if (request.numAdults && request.numAdults > 0) {
        console.log('💰 Using Offers API for dynamic pricing');
        return await this.getInventoryOffers({
          propId: request.propId,
          roomId: request.roomId,
          startDate: request.startDate,
          endDate: request.endDate,
          adults: request.numAdults,
          children: request.numChildren || 0
        });
      } else {
        console.log('📅 Using Calendar API for availability with manual blocks');
        return await this.getInventoryCalendar({
          propId: request.propId,
          roomId: request.roomId,
          startDate: request.startDate,
          endDate: request.endDate
        });
      }
      
    } catch (error) {
      console.error('❌ Error in availability fetch:', error);
      throw error;
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
          'Accept': 'application/json',
          'token': accessToken,
          'User-Agent': 'ApartmanyVita/1.0'
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
          'Accept': 'application/json',
          'token': accessToken,
          'User-Agent': 'ApartmanyVita/1.0'
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
          'Accept': 'application/json',
          'token': accessToken,
          'User-Agent': 'ApartmanyVita/1.0'
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
          'Accept': 'application/json',
          'token': accessToken,
          'User-Agent': 'ApartmanyVita/1.0'
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
   * Parse inventory availability response from Beds24 V2 /inventory/availability endpoint
   */
  private parseInventoryAvailabilityResponseV2(data: unknown, request: AvailabilityRequest): AvailabilityResponse {
    const available: string[] = [];
    const booked: string[] = [];
    const prices: Record<string, number> = {};

    console.log('Parsing availability response:', { data, request });

    // Generate date range first
    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);
    
    // Handle availability response format - new format from API testing
    let availabilityData: unknown[] = [];
    
    if (data && typeof data === 'object') {
      if ('data' in data && Array.isArray((data as { data: unknown[] }).data)) {
        availabilityData = (data as { data: unknown[] }).data;
      } else if (Array.isArray(data)) {
        availabilityData = data;
      }
    }

    console.log('Found availability items:', availabilityData.length);
    
    // Find the specific room data by roomId
    let roomData: unknown = null;
    const targetRoomId = request.roomId ? parseInt(request.roomId) : null;
    
    for (const item of availabilityData) {
      if (item && typeof item === 'object') {
        const itemObj = item as Record<string, unknown>;
        if (targetRoomId && 'roomId' in itemObj && itemObj.roomId === targetRoomId) {
          roomData = itemObj;
          break;
        }
      }
    }

    if (!roomData) {
      console.warn(`Room ${request.roomId} not found in availability data`);
      // Return all dates as booked if room not found
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        booked.push(dateStr);
        prices[dateStr] = this.getCalendarPrice(request.roomId);
      }
      return { available, booked, prices, minStay: 1, maxStay: 30 };
    }

    console.log('Found room data:', roomData);
    
    // Parse availability data for the specific room
    const roomObj = roomData as Record<string, unknown>;
    let availabilityMap: Record<string, boolean> = {};
    
    if ('availability' in roomObj && typeof roomObj.availability === 'object' && roomObj.availability) {
      availabilityMap = roomObj.availability as Record<string, boolean>;
    }
    
    // Generate all dates in range and check availability
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      
      const isAvailable = availabilityMap[dateStr] === true;
      if (isAvailable) {
        available.push(dateStr);
      } else {
        booked.push(dateStr);
      }
      
      // Set calendar price (base price without discounts)
      prices[dateStr] = this.getCalendarPrice(request.roomId);
    }

    console.log('Parsed availability:', { 
      roomId: request.roomId,
      available: available.length, 
      booked: booked.length,
      availableDates: available,
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
   * Parse inventory offers response from Beds24 V2 /inventory/rooms/offers endpoint (SIMPLIFIED)
   * FIXED: Simplified logic, proper booking verification, correct pricing
   */
  private async parseInventoryOffersResponseV2(data: unknown, request: AvailabilityRequest & { adults: number; children?: number }, isCalendar?: boolean): Promise<AvailabilityResponse> {
    const available: string[] = [];
    const booked: string[] = [];
    const prices: Record<string, number> = {};

    console.log('🔍 Parsing offers response (SIMPLIFIED):', { 
      roomId: request.roomId, 
      dateRange: `${request.startDate} to ${request.endDate}`,
      adults: request.adults,
      isCalendar: isCalendar
    });

    // STEP 1: Get actual bookings to determine real availability
    let bookedDatesFromBookings: string[] = [];
    try {
      const bookingsResponse = await this.getBookings({
        propId: request.propId,
        roomId: request.roomId,
        startDate: request.startDate,
        endDate: request.endDate
      });
      
      bookedDatesFromBookings = bookingsResponse.booked;
      console.log(`📅 Real booked dates from bookings API: ${bookedDatesFromBookings.length} dates`);
    } catch (bookingsError) {
      console.warn('⚠️ Could not fetch bookings, assuming no bookings:', bookingsError);
    }

    // STEP 2: Generate all dates in requested range
    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);
    const allDates: string[] = [];
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      allDates.push(d.toISOString().split('T')[0]);
    }

    console.log(`📅 Processing ${allDates.length} dates from ${request.startDate} to ${request.endDate}`);

    // STEP 3: Check if we have offers data from Beds24
    let offersData: unknown[] = [];
    if (data && typeof data === 'object') {
      if ('data' in data && Array.isArray((data as { data: unknown[] }).data)) {
        offersData = (data as { data: unknown[] }).data;
      } else if (Array.isArray(data)) {
        offersData = data;
      }
    }
    
    const hasOffers = offersData.length > 0;
    console.log(`📊 Offers check: ${hasOffers ? 'HAS offers' : 'NO offers'} (${offersData.length} items)`);
    
    // STEP 4: Process each date
    allDates.forEach(dateStr => {
      // Check if date is booked from actual bookings
      const isBookedInBookings = bookedDatesFromBookings.includes(dateStr);
      
      if (isBookedInBookings) {
        booked.push(dateStr);
        console.log(`❌ ${dateStr} is BOOKED (from bookings API)`);
      } else if (!hasOffers && !isCalendar) {
        // For booking: If no offers from Beds24, dates are BLOCKED
        booked.push(dateStr);
        console.log(`🚫 ${dateStr} is BLOCKED (no offers from Beds24)`);
      } else if (!hasOffers && isCalendar) {
        // For calendar: If no offers, assume available but check past dates
        const currentDate = new Date();
        const checkDate = new Date(dateStr);
        
        if (checkDate < currentDate) {
          booked.push(dateStr);
          console.log(`📅 ${dateStr} is PAST (calendar view)`);
        } else {
          available.push(dateStr);
          console.log(`📅 ${dateStr} is AVAILABLE (calendar fallback)`);
        }
      } else {
        available.push(dateStr);
        console.log(`✅ ${dateStr} is AVAILABLE`);
      }
      
      // STRICT: Only set price if we have actual Beds24 price data
      const beds24Price = this.extractBeds24Price(data, request.adults);
      if (beds24Price && beds24Price > 0) {
        prices[dateStr] = beds24Price;
        console.log(`💰 Using Beds24 price for ${dateStr}: ${beds24Price}€`);
      } else {
        console.log(`⚠️ No Beds24 price data for ${dateStr} - skipping price`);
      }
    });

    console.log('✅ Parsing complete:', {
      totalDates: allDates.length,
      available: available.length,
      booked: booked.length,
      pricesSet: Object.keys(prices).length
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
   * Extract price from Beds24 offers data (helper method)
   * @param data - Beds24 offers response data
   * @param guestCount - Number of guests (for future guest-specific pricing)
   */
  private extractBeds24Price(data: unknown, guestCount: number): number | null {
    try {
      if (!data || typeof data !== 'object') return null;
      
      console.log(`Extracting Beds24 price for ${guestCount} guests`);
      
      let offersData: unknown[] = [];
      
      if ('data' in data && Array.isArray((data as { data: unknown[] }).data)) {
        offersData = (data as { data: unknown[] }).data;
      } else if (Array.isArray(data)) {
        offersData = data;
      }
      
      for (const offer of offersData) {
        if (offer && typeof offer === 'object') {
          const offerObj = offer as Record<string, unknown>;
          
          // Look for offers array
          let actualOffers: unknown[] = [];
          if ('offers' in offerObj && Array.isArray(offerObj.offers)) {
            actualOffers = offerObj.offers;
          } else {
            actualOffers = [offerObj];
          }
          
          for (const actualOffer of actualOffers) {
            if (actualOffer && typeof actualOffer === 'object') {
              const actualOfferObj = actualOffer as Record<string, unknown>;
              
              // Extract price
              if ('price' in actualOfferObj && typeof actualOfferObj.price === 'number') {
                return actualOfferObj.price;
              }
              if ('totalPrice' in actualOfferObj && typeof actualOfferObj.totalPrice === 'number') {
                return actualOfferObj.totalPrice;
              }
            }
          }
        }
      }
      
      return null;
    } catch (error) {
      console.warn('Error extracting Beds24 price:', error);
      return null;
    }
  }

  /**
   * Parse bookings response from Beds24 V2 /bookings endpoint
   */
  private parseBookingsResponseV2(data: unknown, request: AvailabilityRequest): AvailabilityResponse {
    const available: string[] = [];
    const booked: string[] = [];
    const prices: Record<string, number> = {};

    console.log('Parsing bookings response:', { data, request });

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

    console.log('Found booking items:', bookingsData.length);
    
    // Process bookings to find booked dates
    const bookedDatesSet = new Set<string>();
    
    bookingsData.forEach((booking: unknown) => {
      if (booking && typeof booking === 'object') {
        const bookingObj = booking as Record<string, unknown>;
        
        const arrival = bookingObj.arrival as string;
        const departure = bookingObj.departure as string;
        const status = bookingObj.status as string;
        const roomId = bookingObj.roomId?.toString();
        
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
            
            console.log(`📅 Booking found: ${arrival} to ${departure} (${status}) - roomId: ${roomId}`);
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
      
      // STRICT: Only set price if we have actual booking price data
      // No fallback prices - only real data from Beds24
    }

    console.log('Parsed bookings result:', {
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
   * Parse inventory calendar response from Beds24 V2 /inventory/calendar endpoint
   * ENHANCED: Properly handle blocked dates and empty responses
   */
  private parseInventoryCalendarResponseV2(data: unknown, request: AvailabilityRequest): AvailabilityResponse {
    const available: string[] = [];
    const booked: string[] = [];
    const prices: Record<string, number> = {};

    console.log('🔍 Parsing calendar response:', { 
      dataType: typeof data,
      isArray: Array.isArray(data),
      request: { roomId: request.roomId, startDate: request.startDate, endDate: request.endDate }
    });

    // Handle calendar response format
    let calendarData: unknown[] = [];
    const responseInfo = { success: false, count: 0, type: 'unknown' };
    
    if (data && typeof data === 'object') {
      // Extract response metadata
      if ('success' in data) responseInfo.success = Boolean((data as Record<string, unknown>).success);
      if ('count' in data) responseInfo.count = Number((data as Record<string, unknown>).count);
      if ('type' in data) responseInfo.type = String((data as Record<string, unknown>).type);
      
      // Extract calendar data array - FIXED: Handle nested calendar structure
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

    console.log('📅 Calendar API response:', { 
      success: responseInfo.success,
      type: responseInfo.type,
      count: responseInfo.count,
      dataItems: calendarData.length,
      hasCalendarData: calendarData.length > 0
    });
    
    // Create a map of date -> calendar info
    const calendarMap: Record<string, { 
      available: boolean; 
      price?: number; 
      blocked?: boolean;
      status?: string;
      numAvail?: number;
    }> = {};
    
    // Process calendar data items - FIXED: Handle date ranges (from/to)
    calendarData.forEach((item: unknown, index: number) => {
      if (item && typeof item === 'object') {
        const itemObj = item as Record<string, unknown>;
        
        let dates: string[] = [];
        let isAvailable: boolean = true;
        let price: number | null = null;
        let isBlocked: boolean = false;
        let status: string | null = null;
        let numAvail: number | null = null;
        
        // Handle date ranges (from/to) - NEW LOGIC
        if ('from' in itemObj && 'to' in itemObj && 
            typeof itemObj.from === 'string' && typeof itemObj.to === 'string') {
          // Generate all dates in range
          
          // Use date-fns for reliable date iteration with proper timezone handling
          const startDate = parseISO(itemObj.from);
          const endDate = parseISO(itemObj.to);
          const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
          dates = dateRange.map((date: Date) => format(date, 'yyyy-MM-dd'));
          
          console.log(`📅 Calendar range ${index + 1}: ${itemObj.from} to ${itemObj.to} (${dates.length} dates)`);
        }
        // Handle single dates (legacy format)
        else if ('date' in itemObj && typeof itemObj.date === 'string') {
          dates = [itemObj.date];
        } else if ('day' in itemObj && typeof itemObj.day === 'string') {
          dates = [itemObj.day];
        }
        
        // Status field
        if ('status' in itemObj && typeof itemObj.status === 'string') {
          status = itemObj.status;
        }
        
        // Number available field - KEY FIELD FOR BLOCKING
        if ('numAvail' in itemObj && typeof itemObj.numAvail === 'number') {
          numAvail = itemObj.numAvail;
        }
        
        // Availability determination (multiple checks)
        if ('available' in itemObj) {
          if (typeof itemObj.available === 'boolean') {
            isAvailable = itemObj.available;
          } else if (typeof itemObj.available === 'number') {
            isAvailable = itemObj.available > 0;
          }
        }
        
        // Check for blocked status
        if (status === 'blocked' || status === 'unavailable' || status === 'closed') {
          isBlocked = true;
          isAvailable = false;
        }
        
        // Check numAvail (0 = not available) - CRITICAL CHECK
        if (numAvail !== null && numAvail === 0) {
          isAvailable = false;
          isBlocked = true;
          console.log(`🚫 Found blocked dates with numAvail=0: ${dates.join(', ')}`);
        }
        
        // Price field variations (try different field names)
        if ('price1' in itemObj && typeof itemObj.price1 === 'number') {
          price = itemObj.price1;
        } else if ('price' in itemObj && typeof itemObj.price === 'number') {
          price = itemObj.price;
        } else if ('rate' in itemObj && typeof itemObj.rate === 'number') {
          price = itemObj.rate;
        } else if ('amount' in itemObj && typeof itemObj.amount === 'number') {
          price = itemObj.amount;
        }
        
        // Apply settings to all dates in range
        dates.forEach(date => {
          calendarMap[date] = { 
            available: isAvailable,
            blocked: isBlocked,
            status: status || undefined,
            numAvail: numAvail || undefined,
            price: price // FIXED: Don't use || undefined which converts 0 to undefined
          };
          
          // DEBUG: Log price setting for month end dates
          if (date === '2025-12-31' || date === '2025-10-31' || date === '2025-11-30') {
            console.log(`🎯 SETTING PRICE FOR MONTH END: ${date} = ${price}€`, {
              date,
              available: isAvailable,
              blocked: isBlocked,
              price,
              rawItem: itemObj
            });
          }
        });
        
        if (index < 5) { // Log first few items for debugging
          console.log(`📅 Calendar item ${index + 1}:`, {
            dateRange: dates.length > 1 ? `${dates[0]} to ${dates[dates.length-1]}` : dates[0],
            dateCount: dates.length,
            available: isAvailable,
            blocked: isBlocked,
            status,
            numAvail,
            price,
            rawItem: itemObj
          });
        }
      }
    });
    
    // Generate all dates in range and check availability - use date-fns for reliability
    const requestStartDate = parseISO(request.startDate);
    const requestEndDate = parseISO(request.endDate);
    const allDatesInRange = eachDayOfInterval({ start: requestStartDate, end: requestEndDate });
    
    let totalDates = 0;
    allDatesInRange.forEach((dateObj: Date) => {
      const dateStr = format(dateObj, 'yyyy-MM-dd');
      totalDates++;
      
      const calendar = calendarMap[dateStr];
      if (calendar) {
        // We have explicit calendar data for this date
        if (calendar.available && !calendar.blocked) {
          available.push(dateStr);
          console.log(`✅ ${dateStr}: Available (calendar data)`);
        } else {
          booked.push(dateStr);
          console.log(`🚫 ${dateStr}: Blocked (${calendar.status || 'unavailable'}, numAvail: ${calendar.numAvail})`);
        }
        
        // Add price if available - FIXED: Check all possible price fields
        let finalPrice = calendar.price;
        if (!finalPrice && calendar) {
          // Check alternative price field names in case of type issues
          finalPrice = (calendar as any).price1 || (calendar as any).rate || (calendar as any).amount;
        }
        
        if (finalPrice && finalPrice > 0) {
          prices[dateStr] = finalPrice;
          
          // DEBUG: Log final price setting for month end dates
          if (dateStr === '2025-12-31' || dateStr === '2025-10-31' || dateStr === '2025-11-30') {
            console.log(`🎯 FINAL PRICE SET FOR MONTH END ${dateStr}: €${finalPrice}`);
          }
        } else if (dateStr === '2025-12-31' || dateStr === '2025-10-31' || dateStr === '2025-11-30') {
          console.log(`❌ NO PRICE FOR MONTH END ${dateStr} in calendar data:`, calendar);
        }
      } else {
        // No calendar data for this date - DO NOT ASSUME AVAILABILITY WITHOUT PRICE
        console.log(`❓ ${dateStr}: No calendar data - not showing as available without price data`);
        // Skip dates without explicit calendar data to avoid showing €0 prices
      }
    });

    console.log('📅 Calendar parsing summary:', { 
      totalDates,
      calendarItems: calendarData.length,
      available: available.length, 
      booked: booked.length,
      pricesFound: Object.keys(prices).length,
      availableDates: available.slice(0, 5),
      bookedDates: booked.slice(0, 5)
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
   * Parse inventory response from Beds24 V2 inventory endpoint (legacy)
   */
  private parseInventoryResponseV2(data: unknown, request: AvailabilityRequest): AvailabilityResponse {
    const available: string[] = [];
    const booked: string[] = [];
    const prices: Record<string, number> = {};

    console.log('Parsing inventory response:', { data, request });

    // Generate date range first
    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);
    
    console.log('Date range:', { startDate: startDate.toISOString(), endDate: endDate.toISOString() });

    // Handle inventory response format
    let inventoryData: unknown[] = [];
    
    if (data && typeof data === 'object') {
      // API V2 returns inventory data in 'data' field
      if ('data' in data && Array.isArray((data as { data: unknown[] }).data)) {
        inventoryData = (data as { data: unknown[] }).data;
      } else if ('inventory' in data && Array.isArray((data as { inventory: unknown[] }).inventory)) {
        inventoryData = (data as { inventory: unknown[] }).inventory;
      } else if (Array.isArray(data)) {
        inventoryData = data;
      }
    }

    console.log('Found inventory items:', inventoryData.length);
    
    // Create a map of date -> inventory info
    const inventoryMap: Record<string, { available: number; price: number }> = {};
    
    inventoryData.forEach((item: unknown) => {
      if (item && typeof item === 'object') {
        const itemObj = item as Record<string, unknown>;
        
        // Try different field names for date, availability and price
        let date: string | null = null;
        let availableCount: number = 0;
        let price: number | null = null;
        
        // Date field variations
        if ('date' in itemObj && typeof itemObj.date === 'string') {
          date = itemObj.date;
        } else if ('day' in itemObj && typeof itemObj.day === 'string') {
          date = itemObj.day;
        }
        
        // Availability field variations
        if ('available' in itemObj && typeof itemObj.available === 'number') {
          availableCount = itemObj.available;
        } else if ('availability' in itemObj && typeof itemObj.availability === 'number') {
          availableCount = itemObj.availability;
        } else if ('qty' in itemObj && typeof itemObj.qty === 'number') {
          availableCount = itemObj.qty;
        }
        
        // Price field variations
        if ('price' in itemObj && typeof itemObj.price === 'number') {
          price = itemObj.price;
        } else if ('rate' in itemObj && typeof itemObj.rate === 'number') {
          price = itemObj.rate;
        } else if ('amount' in itemObj && typeof itemObj.amount === 'number') {
          price = itemObj.amount;
        }
        
        if (date) {
          inventoryMap[date] = {
            available: availableCount,
            price: price || this.getCalendarPrice(request.roomId)
          };
        }
      }
    });
    
    // Generate all dates in range and check availability
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      
      const inventory = inventoryMap[dateStr];
      if (inventory && inventory.available > 0) {
        available.push(dateStr);
        prices[dateStr] = inventory.price;
      } else {
        booked.push(dateStr);
        prices[dateStr] = inventory?.price || this.getCalendarPrice(request.roomId);
      }
    }

    console.log('Parsed inventory:', { 
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
   * Parse availability response from Beds24 V2 bookings endpoint (fallback)
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
      
      // Set price if found, otherwise use default with discounts
      if (datePrice !== undefined) {
        prices[dateStr] = datePrice;
      } else {
        // Use fallback pricing with guest count and discounts applied
        const guestCount = request.numAdults || 2;
        let basePrice = this.getCalendarPrice(request.roomId);
        
        // Apply guest count adjustment for fallback
        if (guestCount > 2) {
          const guestMultiplier = 1 + ((guestCount - 2) * 0.15);
          basePrice = basePrice * guestMultiplier;
        }
        
        // Apply stay length and seasonal discounts
        const finalPrice = this.applyDiscounts(basePrice, request.startDate, request.endDate);
        prices[dateStr] = finalPrice;
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
   * Get base price for calendar display - STRICT: Only real Beds24 data
   * NO FALLBACKS - Must load actual prices from Beds24 API
   */
  getCalendarPrice(roomId?: string): number {
    // NO FALLBACK PRICES - Return 0 to indicate missing data
    console.warn(`⚠️ getCalendarPrice called for roomId ${roomId} - NO FALLBACK PRICES, must use real Beds24 data`);
    return 0; // Return 0 to force loading from Beds24 API
  }

  /**
   * Load actual room prices from Beds24 API
   * This method fetches real prices from Beds24 for a specific room
   */
  async getRoomPricesFromBeds24(roomId: string, propId: string = '357931'): Promise<Record<string, number>> {
    try {
      await this.enforceRateLimit();
      
      console.log(`💰 Loading actual prices from Beds24 for room ${roomId}`);
      
      // Get current month prices as sample
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Use offers API to get actual pricing
      const offersResponse = await this.getInventoryOffers({
        propId,
        roomId,
        startDate: startDateStr,
        endDate: endDateStr,
        adults: 2, // Standard 2 adults
        children: 0
      });
      
      console.log(`💰 Loaded ${Object.keys(offersResponse.prices).length} price points from Beds24`);
      
      // Find minimum price for this room
      const prices = Object.values(offersResponse.prices);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      
      console.log(`💰 Room ${roomId} minimum price from Beds24: €${minPrice}`);
      
      return offersResponse.prices;
      
    } catch (error) {
      console.error(`❌ Failed to load prices from Beds24 for room ${roomId}:`, error);
      throw error;
    }
  }

  /**
   * Get minimum price for a room from Beds24 API
   */
  async getRoomMinimumPrice(roomId: string, propId: string = '357931'): Promise<number> {
    try {
      const prices = await this.getRoomPricesFromBeds24(roomId, propId);
      const priceValues = Object.values(prices);
      
      if (priceValues.length === 0) {
        throw new Error(`No price data available for room ${roomId}`);
      }
      
      return Math.min(...priceValues);
    } catch (error) {
      console.error(`❌ Failed to get minimum price for room ${roomId}:`, error);
      throw error;
    }
  }

  /**
   * Apply stay length and seasonal discounts to base price
   * BEDS24 INTEGRATION: Beds24 has fixed daily rates, we apply our own stay length discounts
   */
  private applyDiscounts(basePrice: number, startDate?: string, endDate?: string): number {
    if (!startDate || !endDate) return Math.round(basePrice);
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    
    let stayDiscount = 0;
    let seasonalDiscount = 0;
    
    // STAY LENGTH DISCOUNTS (our own logic, not in Beds24)
    if (nights >= 30) {
      stayDiscount = 0.25; // 25% monthly discount
      console.log(`🏠 Monthly stay discount: 25% for ${nights} nights`);
    } else if (nights >= 14) {
      stayDiscount = 0.15; // 15% extended stay discount
      console.log(`📅 Extended stay discount: 15% for ${nights} nights`);
    } else if (nights >= 7) {
      stayDiscount = 0.10; // 10% weekly discount
      console.log(`🗓️ Weekly stay discount: 10% for ${nights} nights`);
    }
    
    // SEASONAL DISCOUNTS (our own logic, not in Beds24)
    const month = start.getMonth() + 1;
    if (month >= 11 || month <= 2) {
      seasonalDiscount = 0.15; // 15% off-season discount
      console.log(`❄️ Off-season discount: 15% for month ${month}`);
    }
    
    // CHOOSE HIGHEST DISCOUNT (not combine)
    const totalDiscount = Math.max(stayDiscount, seasonalDiscount);
    
    const finalPrice = Math.round(basePrice * (1 - totalDiscount));
    // Determine which discount was applied
    let discountType = 'none';
    if (totalDiscount === stayDiscount && stayDiscount > 0) {
      discountType = 'stay';
    } else if (totalDiscount === seasonalDiscount && seasonalDiscount > 0) {
      discountType = 'seasonal';
    }
    
    console.log(`✅ Applied highest discount: ${discountType} ${Math.round(totalDiscount * 100)}% (stay: ${Math.round(stayDiscount * 100)}%, seasonal: ${Math.round(seasonalDiscount * 100)}%)`);
    console.log(`💰 Price calculation: ${Math.round(basePrice)}€ → ${finalPrice}€`);
    
    return finalPrice;
  }

  /**
   * Calculate total price for a stay with proper discount application
   * NEW: Proper implementation of Beds24 + our discounts
   */
  calculateStayPrice(
    roomId: string,
    startDate: string,
    endDate: string,
    guestCount: number = 2,
    beds24DailyPrices?: Record<string, number>
  ): { totalPrice: number; dailyPrices: Array<{ date: string; basePrice: number; finalPrice: number; discount: number }> } {
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    
    console.log(`💰 Calculating stay price for ${nights} nights, ${guestCount} guests`);
    
    // Get base price for the room
    const basePrice = this.getCalendarPrice(roomId);
    
    // Calculate stay length discount (applies to entire stay)
    let stayDiscount = 0;
    if (nights >= 30) {
      stayDiscount = 0.25; // 25% monthly discount
    } else if (nights >= 14) {
      stayDiscount = 0.15; // 15% extended stay discount  
    } else if (nights >= 7) {
      stayDiscount = 0.10; // 10% weekly discount
    }
    
    // Calculate seasonal discount
    const month = start.getMonth() + 1;
    let seasonalDiscount = 0;
    if (month >= 11 || month <= 2) {
      seasonalDiscount = 0.15; // 15% off-season discount
    }
    
    // CHOOSE HIGHEST DISCOUNT (not combine)
    const totalDiscount = Math.max(stayDiscount, seasonalDiscount);
    
    console.log(`🎯 Discount selection: stay ${Math.round(stayDiscount * 100)}% vs seasonal ${Math.round(seasonalDiscount * 100)}% → using highest: ${Math.round(totalDiscount * 100)}%`);
    
    // Generate daily prices
    const dailyPrices: Array<{ date: string; basePrice: number; finalPrice: number; discount: number }> = [];
    let totalPrice = 0;
    
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      
      // Use Beds24 price if available, otherwise base price
      let dayBasePrice = beds24DailyPrices?.[dateStr] || basePrice;
      
      // Apply Beds24 guest pricing: €20 per extra person above 2
      if (guestCount > 2) {
        const extraGuests = guestCount - 2;
        const extraGuestCharge = 20; // €20 per extra person from Beds24 API
        dayBasePrice = dayBasePrice + (extraGuests * extraGuestCharge);
      }
      
      // Apply total discount to each day
      const finalPrice = Math.round(dayBasePrice * (1 - totalDiscount));
      const discountAmount = Math.round(dayBasePrice * totalDiscount);
      
      dailyPrices.push({
        date: dateStr,
        basePrice: Math.round(dayBasePrice),
        finalPrice,
        discount: discountAmount
      });
      
      totalPrice += finalPrice;
    }
    
    console.log(`💰 Final calculation: ${totalPrice}€ total for ${nights} nights (avg: ${Math.round(totalPrice / nights)}€/night)`);
    
    return {
      totalPrice,
      dailyPrices
    };
  }

  /**
   * Get realistic dynamic pricing based on stay length, season, and guest count
   * FIXED: Now considers stay length, seasonal adjustments, and guest count
   */
  private getDefaultPrice(roomId?: string, startDate?: string, endDate?: string, guestCount?: number): number {
    console.log(`🔍 getDefaultPrice called with: roomId=${roomId}, guestCount=${guestCount}, startDate=${startDate}, endDate=${endDate}`);
    
    // Get base price
    let basePrice = this.getCalendarPrice(roomId);
    
    // Apply guest count pricing (MORE GUESTS = HIGHER PRICE)
    if (guestCount && guestCount > 2) {
      const guestMultiplier = 1 + ((guestCount - 2) * 0.15); // +15% per extra guest above 2
      basePrice = basePrice * guestMultiplier;
      console.log(`👥 Guest count pricing: ${guestCount} guests → ${Math.round(basePrice * 100) / 100}€/night`);
    }
    
    // Apply unified discount logic
    const finalPrice = this.applyDiscounts(basePrice, startDate, endDate);
    console.log(`💰 Final price for roomId ${roomId}: ${finalPrice}€/night`);
    return finalPrice;
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

// Singleton instance with lazy initialization
let _beds24Service: Beds24Service | null = null;

export function getBeds24Service(): Beds24Service | null {
  try {
    if (!_beds24Service) {
      _beds24Service = new Beds24Service();
    }
    return _beds24Service;
  } catch (error) {
    console.error('Failed to initialize Beds24Service:', error);
    return null;
  }
}

// For backward compatibility
export const beds24Service = {
  get: () => getBeds24Service()
};

// Helper functions for apartment-specific operations
export async function getApartmentAvailability(
  apartmentSlug: string, 
  startDate: Date, 
  endDate: Date,
  isCalendar: boolean = true
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

  const service = beds24Service.get();
  if (!service) {
    throw new Error('Beds24Service not available');
  }
  
  return service.getInventory({
    propId: apartment.propId,
    roomId: apartment.roomId,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    adults: 2, // Default guest count for calendar display
    children: 0,
    isCalendar: isCalendar // Pass calendar flag for proper pricing
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

  const service = beds24Service.get();
  if (!service) {
    throw new Error('Beds24Service not available');
  }
  
  return service.createBooking({
    ...bookingData,
    propId: apartment.propId,
    roomId: apartment.roomId
  });
}
