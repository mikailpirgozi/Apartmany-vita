import { NextResponse } from 'next/server';

/**
 * Debug endpoint to check for newline characters in environment variables
 * WARNING: Only use in development or with proper authentication
 */
export async function GET() {
  const envVars = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'BEDS24_LONG_LIFE_TOKEN',
    'BEDS24_ACCESS_TOKEN',
    'BEDS24_REFRESH_TOKEN',
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXT_PUBLIC_BASE_URL',
    'NEXT_PUBLIC_APP_URL'
  ];

  const results: Record<string, {
    exists: boolean;
    hasNewline: boolean;
    hasWhitespace: boolean;
    length: number;
    prefix?: string;
    suffix?: string;
  }> = {};

  for (const varName of envVars) {
    const value = process.env[varName];
    
    if (!value) {
      results[varName] = {
        exists: false,
        hasNewline: false,
        hasWhitespace: false,
        length: 0
      };
      continue;
    }

    results[varName] = {
      exists: true,
      hasNewline: value.includes('\n') || value.includes('\r'),
      hasWhitespace: value !== value.trim(),
      length: value.length,
      prefix: value.substring(0, 10),
      suffix: `...${value.substring(value.length - 4)}`
    };
  }

  // Count issues
  const issues = Object.entries(results).filter(([_, data]) => 
    data.exists && (data.hasNewline || data.hasWhitespace)
  );

  const warnings: string[] = [];
  
  issues.forEach(([varName, data]) => {
    if (data.hasNewline) {
      warnings.push(`⚠️ ${varName} contains newline character (\\n or \\r)`);
    }
    if (data.hasWhitespace) {
      warnings.push(`⚠️ ${varName} has leading/trailing whitespace`);
    }
  });

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    totalChecked: envVars.length,
    totalIssues: issues.length,
    status: issues.length === 0 ? '✅ All Clean' : '❌ Issues Found',
    warnings,
    details: results
  });
}
