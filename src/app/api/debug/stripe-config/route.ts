import { NextResponse } from 'next/server';

/**
 * Debug endpoint to check Stripe configuration
 * WARNING: Only use in development or with proper authentication
 */
export async function GET() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const config = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    
    stripeSecretKey: {
      exists: !!stripeSecretKey,
      length: stripeSecretKey?.length || 0,
      prefix: stripeSecretKey?.substring(0, 8) || 'NOT_SET',
      isTest: stripeSecretKey?.startsWith('sk_test_') || false,
      isLive: stripeSecretKey?.startsWith('sk_live_') || false,
      isDummy: stripeSecretKey === 'sk_test_dummy_key_for_build',
      // Last 4 characters for verification (safe to show)
      suffix: stripeSecretKey ? `...${stripeSecretKey.substring(stripeSecretKey.length - 4)}` : 'NOT_SET'
    },
    
    stripePublishableKey: {
      exists: !!stripePublishableKey,
      length: stripePublishableKey?.length || 0,
      prefix: stripePublishableKey?.substring(0, 8) || 'NOT_SET',
      isTest: stripePublishableKey?.startsWith('pk_test_') || false,
      isLive: stripePublishableKey?.startsWith('pk_live_') || false,
      isDummy: stripePublishableKey === 'pk_test_dummy_key_for_build'
    },
    
    stripeWebhookSecret: {
      exists: !!stripeWebhookSecret,
      length: stripeWebhookSecret?.length || 0,
      prefix: stripeWebhookSecret?.substring(0, 8) || 'NOT_SET'
    },

    baseUrls: {
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'NOT_SET',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NOT_SET',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT_SET'
    },

    warnings: [] as string[]
  };

  // Add warnings
  if (!stripeSecretKey || stripeSecretKey === 'sk_test_dummy_key_for_build') {
    config.warnings.push('⚠️ STRIPE_SECRET_KEY is not configured or using dummy key!');
  }

  if (!stripePublishableKey || stripePublishableKey === 'pk_test_dummy_key_for_build') {
    config.warnings.push('⚠️ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured or using dummy key!');
  }

  if (stripeSecretKey?.startsWith('sk_test_') && process.env.NODE_ENV === 'production') {
    config.warnings.push('⚠️ Using TEST Stripe keys in PRODUCTION environment!');
  }

  if (!stripeWebhookSecret) {
    config.warnings.push('⚠️ STRIPE_WEBHOOK_SECRET is not configured!');
  }

  // Test Stripe connection
  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeSecretKey || 'sk_test_dummy_key_for_build', {
      apiVersion: '2025-08-27.basil',
      typescript: true,
    });

    // Try to list payment methods (lightweight API call)
    await stripe.paymentMethods.list({ limit: 1 });
    
    return NextResponse.json({
      ...config,
      stripeConnection: {
        status: '✅ Connected',
        message: 'Successfully connected to Stripe API'
      }
    });
  } catch (error) {
    const stripeError = error as { type?: string; message?: string; code?: string };
    
    return NextResponse.json({
      ...config,
      stripeConnection: {
        status: '❌ Connection Failed',
        error: {
          type: stripeError.type,
          message: stripeError.message,
          code: stripeError.code
        }
      }
    }, { status: 500 });
  }
}
