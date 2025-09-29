import { NextRequest, NextResponse } from 'next/server';
import { getBeds24LongLifeService } from '@/services/beds24-longlife';

/**
 * Test endpoint for Long Life Token authentication
 * Tests the official Beds24 authentication method
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Long Life Token authentication...');

    // Check if Long Life Token is configured
    const hasLongLifeToken = !!process.env.BEDS24_LONG_LIFE_TOKEN;
    
    if (!hasLongLifeToken) {
      return NextResponse.json({
        success: false,
        error: 'BEDS24_LONG_LIFE_TOKEN not configured',
        instructions: [
          '1. Go to https://beds24.com/control3.php?pagetype=apiv2',
          '2. Create an Invite Code with READ,WRITE scopes',
          '3. Convert it at /invite-to-token',
          '4. Set BEDS24_LONG_LIFE_TOKEN in your environment'
        ]
      }, { status: 400 });
    }

    // Initialize Long Life Service
    const longLifeService = getBeds24LongLifeService();
    
    if (!longLifeService) {
      return NextResponse.json({
        success: false,
        error: 'Failed to initialize Long Life Token service'
      }, { status: 500 });
    }

    // Test authentication
    const authTest = await longLifeService.testAuthentication();
    
    if (!authTest.success) {
      return NextResponse.json({
        success: false,
        error: 'Long Life Token authentication failed',
        details: authTest.message
      }, { status: 401 });
    }

    // Test availability call
    const { searchParams } = new URL(request.url);
    const apartment = searchParams.get('apartment') || 'design-apartman';
    
    // Apartment mapping
    const apartmentMapping: Record<string, { propId: string; roomId: string }> = {
      'design-apartman': { propId: '227484', roomId: '483027' },
      'lite-apartman': { propId: '168900', roomId: '357932' },
      'deluxe-apartman': { propId: '161445', roomId: '357931' },
      'maly-apartman': { propId: '161445', roomId: '357931' }
    };

    const apartmentConfig = apartmentMapping[apartment];
    if (!apartmentConfig) {
      return NextResponse.json({
        success: false,
        error: `Unknown apartment: ${apartment}`
      }, { status: 400 });
    }

    // Test availability for next 7 days
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const availabilityTest = await longLifeService.getInventoryCalendar({
      propId: apartmentConfig.propId,
      roomId: apartmentConfig.roomId,
      startDate: today.toISOString().split('T')[0],
      endDate: nextWeek.toISOString().split('T')[0]
    });

    return NextResponse.json({
      success: true,
      message: 'Long Life Token authentication and API calls successful! 🎉',
      data: {
        authentication: authTest.data,
        availability: {
          apartment,
          propId: apartmentConfig.propId,
          roomId: apartmentConfig.roomId,
          dateRange: {
            start: today.toISOString().split('T')[0],
            end: nextWeek.toISOString().split('T')[0]
          },
          availableDays: availabilityTest.available.length,
          bookedDays: availabilityTest.booked.length,
          totalDays: 7,
          prices: Object.keys(availabilityTest.prices).length
        }
      },
      environment: {
        hasLongLifeToken: true,
        longLifeTokenLength: process.env.BEDS24_LONG_LIFE_TOKEN?.length || 0,
        baseUrl: process.env.BEDS24_BASE_URL || 'https://api.beds24.com/v2'
      },
      instructions: {
        success: 'Long Life Token is working correctly!',
        nextSteps: [
          '✅ Your Long Life Token authentication is working',
          '✅ API calls are successful',
          '✅ You can now use this in production',
          '💡 Consider removing legacy BEDS24_ACCESS_TOKEN and BEDS24_REFRESH_TOKEN'
        ]
      }
    });

  } catch (error) {
    console.error('Long Life Token test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      troubleshooting: [
        '1. Check if BEDS24_LONG_LIFE_TOKEN is set correctly',
        '2. Verify the token was generated with READ,WRITE scopes',
        '3. Make sure the token is not expired',
        '4. Check network connectivity to api.beds24.com'
      ]
    }, { status: 500 });
  }
}
