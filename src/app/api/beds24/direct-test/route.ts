import { NextRequest, NextResponse } from 'next/server';

/**
 * Direct Beds24 API test - simulates exactly what our service does
 * GET /api/beds24/direct-test
 */
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.BEDS24_API_KEY || 'VitaAPI2024mikipiki';
    const baseUrl = process.env.BEDS24_BASE_URL || 'https://beds24.com/api/v2';
    const propId = process.env.BEDS24_PROP_ID || '161445';

    console.log('Direct Beds24 API test with:', { apiKey, baseUrl, propId });

    // Test 1: Basic properties endpoint
    const propertiesResponse = await fetch(`${baseUrl}/properties`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'token': apiKey
      }
    });

    console.log('Properties response status:', propertiesResponse.status);

    if (!propertiesResponse.ok) {
      const errorText = await propertiesResponse.text();
      console.log('Properties error response:', errorText);
      
      return NextResponse.json({
        success: false,
        message: 'Direct API test failed',
        error: `HTTP ${propertiesResponse.status}: ${propertiesResponse.statusText}`,
        details: errorText,
        testData: {
          apiKey: apiKey.substring(0, 10) + '...',
          baseUrl,
          propId
        }
      });
    }

    const propertiesData = await propertiesResponse.json();
    console.log('Properties data received:', propertiesData);

    // Test 2: Specific property access
    const propertyResponse = await fetch(`${baseUrl}/properties/${propId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'token': apiKey
      }
    });

    console.log('Property response status:', propertyResponse.status);

    let propertyData = null;
    if (propertyResponse.ok) {
      propertyData = await propertyResponse.json();
      console.log('Property data received:', propertyData);
    }

    return NextResponse.json({
      success: true,
      message: 'Direct API test successful',
      data: {
        properties: propertiesData,
        property: propertyData
      },
      testData: {
        apiKey: apiKey.substring(0, 10) + '...',
        baseUrl,
        propId
      }
    });

  } catch (error) {
    console.error('Direct Beds24 API test error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Direct API test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      testData: {
        apiKey: (process.env.BEDS24_API_KEY || 'VitaAPI2024mikipiki').substring(0, 10) + '...',
        baseUrl: process.env.BEDS24_BASE_URL || 'https://beds24.com/api/v2',
        propId: process.env.BEDS24_PROP_ID || '161445'
      }
    }, { status: 500 });
  }
}
