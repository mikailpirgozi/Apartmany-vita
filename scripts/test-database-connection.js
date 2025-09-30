#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests if DATABASE_URL is properly configured
 * 
 * Usage:
 *   node scripts/test-database-connection.js
 *   
 * Or with specific DATABASE_URL:
 *   DATABASE_URL="postgresql://..." node scripts/test-database-connection.js
 */

const { validateDatabaseUrl, getDatabaseInfo } = require('../src/lib/db-check.ts');

console.log('\n🔍 Testing Database Connection Configuration...\n');

// Get database info
const dbInfo = getDatabaseInfo();

console.log('📊 Database Info:');
console.log(JSON.stringify(dbInfo, null, 2));
console.log('');

// Validate database URL
const validation = validateDatabaseUrl();

if (validation.valid) {
  console.log('✅ DATABASE_URL is valid!');
  console.log('');
  console.log('Configuration details:');
  console.log(`   Protocol: ${dbInfo.protocol}://`);
  console.log(`   Host: ${dbInfo.hostPrefix}...`);
  console.log(`   URL Length: ${dbInfo.urlLength} characters`);
  console.log('');
  console.log('✨ Database configuration is ready for deployment!');
  process.exit(0);
} else {
  console.error('❌ DATABASE_URL validation failed!');
  console.error('');
  console.error('Error:', validation.error);
  console.error('');
  console.error('📝 Expected format:');
  console.error('   postgresql://username:password@host:port/database');
  console.error('   or');
  console.error('   prisma://accelerate.prisma-data.net/?api_key=...');
  console.error('');
  console.error('🔧 How to fix:');
  console.error('   1. Check your .env.local file (for local development)');
  console.error('   2. Check Vercel Environment Variables (for production)');
  console.error('   3. Ensure DATABASE_URL starts with a valid protocol');
  console.error('');
  process.exit(1);
}
