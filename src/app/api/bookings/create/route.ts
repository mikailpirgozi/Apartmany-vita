import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limiter';

const BEDS24_API_BASE = 'https://api.beds24.com/v2';
const API_TOKEN = process.env.BEDS24_ACCESS_TOKEN || 'XwJnUUA7YS9aHRIBFPhVWiIEBlb/+whEpT0SRe7m5IWp30A9+uJlz54IN+KTAYSFNkftzJQ9ODvTYrafP6c2o3sUExKkk288hi7lKcuJZ8zxfh3CxnUZckm/W3dGGs1ibWb1BIr/ch69m5RKYemFu/Rn6KfTjwgMUi+zyCgifcg=';

// Validation schema based on Beds24 newBooking schema
const createBookingSchema = z.object({
  apartment: z.string().min(1, "Apartment is required"),
  arrival: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid arrival date format (YYYY-MM-DD)"),
  departure: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid departure date format (YYYY-MM-DD)"),
  numAdult: z.number().min(1).max(99),
  numChild: z.number().min(0).max(99).default(0),
  
  // Guest information (required)
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(100),
  phone: z.string().min(1).max(100),
  
  // Guest information (optional)
  title: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  address: z.string().max(250).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postcode: z.string().max(100).optional(),
  country: z.string().max(100).default("Slovakia"),
  country2: z.string().max(2).default("SK"),
  
  // Booking details
  price: z.number().min(0).max(99999999.99),
  arrivalTime: z.string().max(100).optional(),
  comments: z.string().max(1000).optional(),
  voucher: z.string().max(100).optional(),
  
  // System fields
  status: z.enum(["confirmed", "request", "new"]).default("new"),
  lang: z.string().length(2).default("sk")
});

// interface Beds24BookingResponse {
//   success: boolean;
//   bookId?: string;
//   error?: string;
//   data?: unknown;
// }

/**
 * Create new booking in Beds24
 * POST /api/bookings/create
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimit = await checkRateLimit(request, RATE_LIMITS.BOOKING);
    if (rateLimit.limited) {
      return NextResponse.json({
        success: false,
        error: rateLimit.message
      }, { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': RATE_LIMITS.BOOKING.maxRequests.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString()
        }
      });
    }
    
    const body = await request.json();
    console.log('📝 Creating booking with data:', body);

    // Validate request data
    const validatedData = createBookingSchema.parse(body);

    // Map apartment to Beds24 roomId
    const apartmentMapping: Record<string, { propId: string; roomId: string }> = {
      'design-apartman': { propId: '227484', roomId: '483027' },
      'lite-apartman': { propId: '168900', roomId: '357932' },
      'deluxe-apartman': { propId: '161445', roomId: '357931' }
    };

    const apartmentConfig = apartmentMapping[validatedData.apartment];
    if (!apartmentConfig) {
      return NextResponse.json({
        success: false,
        error: `Unknown apartment: ${validatedData.apartment}`
      }, { status: 400 });
    }

    // Prepare booking data for Beds24 API (based on newBooking schema)
    const bookingData = {
      roomId: parseInt(apartmentConfig.roomId),
      arrival: validatedData.arrival,
      departure: validatedData.departure,
      numAdult: validatedData.numAdult,
      numChild: validatedData.numChild,
      
      // Guest information
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email,
      phone: validatedData.phone,
      title: validatedData.title || "",
      company: validatedData.company || "",
      address: validatedData.address || "",
      city: validatedData.city || "",
      state: validatedData.state || "",
      postcode: validatedData.postcode || "",
      country: validatedData.country,
      country2: validatedData.country2,
      
      // Booking details
      price: validatedData.price,
      status: validatedData.status,
      lang: validatedData.lang,
      arrivalTime: validatedData.arrivalTime || "",
      comments: validatedData.comments || "",
      voucher: validatedData.voucher || "",
      
      // Additional fields for tracking
      apiMessage: `Booking created via Apartmany Vita website at ${new Date().toISOString()}`,
      referer: "apartmanvita.sk"
    };

    console.log('📤 Sending booking data to Beds24:', bookingData);

    // Create booking in Beds24 (API expects array of bookings)
    const response = await fetch(`${BEDS24_API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': API_TOKEN
      },
      body: JSON.stringify([bookingData])  // Wrap in array
    });

    console.log('📥 Beds24 response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Beds24 booking creation failed:', errorText);
      
      return NextResponse.json({
        success: false,
        error: `Booking creation failed: ${response.status} ${response.statusText}`,
        details: errorText
      }, { status: response.status });
    }

    const responseData = await response.json();
    console.log('✅ Beds24 booking response:', responseData);

    // Beds24 returns array of booking results
    if (Array.isArray(responseData) && responseData.length > 0) {
      const bookingResult = responseData[0];
      
      if (bookingResult.success && bookingResult.new && bookingResult.new.id) {
        return NextResponse.json({
          success: true,
          bookingId: bookingResult.new.id.toString(),
          message: "Booking created successfully",
          apartment: validatedData.apartment,
          arrival: validatedData.arrival,
          departure: validatedData.departure,
          guestName: `${validatedData.firstName} ${validatedData.lastName}`,
          totalPrice: validatedData.price,
          status: bookingResult.new.status,
          beds24Response: bookingResult.info || []
        });
      } else {
        return NextResponse.json({
          success: false,
          error: "Booking creation failed",
          details: bookingResult
        }, { status: 400 });
      }
    } else {
      return NextResponse.json({
        success: false,
        error: "Invalid response format from Beds24",
        details: responseData
      }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Booking creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: "Validation error",
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
