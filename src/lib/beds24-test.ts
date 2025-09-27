/**
 * Beds24 API Test Utility
 * Test connection and functionality with the provided API key
 */

const BEDS24_API_KEY = process.env.BEDS24_API_KEY || 'AbDalfEtyekmentOsVeb';
const BEDS24_BASE_URL = process.env.BEDS24_BASE_URL || 'https://beds24.com/api/v2';

export interface Beds24TestResult {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
}

/**
 * Test Beds24 API connection
 */
export async function testBeds24Connection(): Promise<Beds24TestResult> {
  try {
    console.log('Testing Beds24 API connection...');
    
    // Test basic API connectivity
    const response = await fetch(`${BEDS24_BASE_URL}/properties`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'token': BEDS24_API_KEY
      }
    });

    if (!response.ok) {
      return {
        success: false,
        message: 'API connection failed',
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      message: 'Beds24 API connection successful',
      data: data
    };
  } catch (error) {
    return {
      success: false,
      message: 'API connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test property access
 */
export async function testPropertyAccess(propId: string): Promise<Beds24TestResult> {
  try {
    const response = await fetch(`${BEDS24_BASE_URL}/properties/${propId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'token': BEDS24_API_KEY
      }
    });

    if (!response.ok) {
      return {
        success: false,
        message: 'Property access failed',
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      message: 'Property access successful',
      data: data
    };
  } catch (error) {
    return {
      success: false,
      message: 'Property access failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test room availability
 */
export async function testRoomAvailability(propId: string, roomId: string): Promise<Beds24TestResult> {
  try {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const response = await fetch(`${BEDS24_BASE_URL}/inventory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': BEDS24_API_KEY
      },
      body: JSON.stringify({
        authentication: {
          apiKey: BEDS24_API_KEY,
          propKey: propId
        },
        request: {
          startDate: today.toISOString().split('T')[0],
          endDate: nextWeek.toISOString().split('T')[0],
          includeInactive: false,
          roomId: roomId
        }
      })
    });

    if (!response.ok) {
      return {
        success: false,
        message: 'Room availability test failed',
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      message: 'Room availability test successful',
      data: data
    };
  } catch (error) {
    return {
      success: false,
      message: 'Room availability test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Run comprehensive Beds24 API tests
 */
export async function runBeds24Tests(propId?: string, roomId?: string): Promise<{
  connection: Beds24TestResult;
  property?: Beds24TestResult;
  availability?: Beds24TestResult;
}> {
  console.log('Starting Beds24 API tests...');
  
  const results: {
    connection: Beds24TestResult;
    property?: Beds24TestResult;
    availability?: Beds24TestResult;
  } = {
    connection: { success: false, message: 'Not tested' }
  };
  
  // Test 1: Basic connection
  results.connection = await testBeds24Connection();
  console.log('Connection test:', results.connection);
  
  // Test 2: Property access (if propId provided)
  if (propId) {
    results.property = await testPropertyAccess(propId);
    console.log('Property test:', results.property);
  }
  
  // Test 3: Room availability (if both propId and roomId provided)
  if (propId && roomId) {
    results.availability = await testRoomAvailability(propId, roomId);
    console.log('Availability test:', results.availability);
  }
  
  return results;
}
