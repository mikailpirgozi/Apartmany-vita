import { NextRequest, NextResponse } from 'next/server';

/**
 * Convert Beds24 invite code to long life token
 */
export async function POST(request: NextRequest) {
  try {
    const { inviteCode } = await request.json();
    
    if (!inviteCode) {
      return NextResponse.json({
        success: false,
        error: 'Invite code is required'
      }, { status: 400 });
    }

    console.log('Converting invite code to token:', inviteCode);

    // Step 1: Exchange invite code for refresh token
    const setupResponse = await fetch('https://api.beds24.com/v2/authentication/setup', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'code': inviteCode
      }
    });

    console.log('Setup response status:', setupResponse.status);

    if (!setupResponse.ok) {
      const errorText = await setupResponse.text();
      console.error('Setup API error:', errorText);
      return NextResponse.json({
        success: false,
        error: `Setup failed: ${errorText}`,
        status: setupResponse.status
      }, { status: setupResponse.status });
    }

    const setupData = await setupResponse.json();
    console.log('Setup data received:', setupData);

    // Extract refresh token
    const { refreshToken } = setupData;
    
    if (!refreshToken) {
      return NextResponse.json({
        success: false,
        error: 'No refresh token received from setup'
      }, { status: 500 });
    }

    // Step 2: Exchange refresh token for access token
    const tokenResponse = await fetch('https://api.beds24.com/v2/authentication/token', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refreshToken: refreshToken
      })
    });

    console.log('Token response status:', tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token API error:', errorText);
      // Don't return error, handle it below
    }

    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json();
      console.log('Token data received:', tokenData);
      
      return NextResponse.json({
        success: true,
        data: {
          refreshToken,
          accessToken: tokenData.accessToken,
          expiresIn: tokenData.expiresIn
        },
        message: 'Successfully converted invite code to tokens'
      });
    } else {
      // If token exchange fails, use the setup token directly
      console.log('Token exchange failed, using setup token directly');
      
      return NextResponse.json({
        success: true,
        data: {
          refreshToken,
          accessToken: setupData.token, // Use the token from setup response
          expiresIn: setupData.expiresIn,
          note: 'Using setup token as access token since token exchange failed'
        },
        message: 'Successfully converted invite code to tokens (using setup token)'
      });
    }
    
  } catch (error) {
    console.error('Invite to token conversion error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to convert invite code to token'
    }, { status: 500 });
  }
}
