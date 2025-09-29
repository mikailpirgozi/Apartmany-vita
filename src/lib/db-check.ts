/**
 * Database connection validation
 * Ensures DATABASE_URL is properly configured before Prisma operations
 */

export function validateDatabaseUrl(): { valid: boolean; error?: string } {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    return {
      valid: false,
      error: 'DATABASE_URL is not defined in environment variables'
    };
  }
  
  // Check if URL starts with valid protocol
  const validProtocols = [
    'postgresql://',
    'postgres://',
    'prisma://',
    'prisma+postgres://'
  ];
  
  const hasValidProtocol = validProtocols.some(protocol => 
    dbUrl.startsWith(protocol)
  );
  
  if (!hasValidProtocol) {
    return {
      valid: false,
      error: `DATABASE_URL must start with one of: ${validProtocols.join(', ')}. Current: ${dbUrl.substring(0, 20)}...`
    };
  }
  
  // Basic format validation for postgresql://
  if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
    // Format: postgresql://user:password@host:port/database
    const urlPattern = /^postgres(ql)?:\/\/[^:]+:[^@]+@[^:]+:\d+\/[^?]+/;
    if (!urlPattern.test(dbUrl)) {
      return {
        valid: false,
        error: 'DATABASE_URL format is invalid. Expected: postgresql://user:password@host:port/database'
      };
    }
  }
  
  return { valid: true };
}

/**
 * Get database connection info (safe for logging)
 */
export function getDatabaseInfo() {
  const dbUrl = process.env.DATABASE_URL || '';
  
  if (!dbUrl) {
    return {
      configured: false,
      protocol: 'N/A',
      length: 0
    };
  }
  
  const protocol = dbUrl.split('://')[0];
  const hostPart = dbUrl.split('@')[1]?.split('/')[0] || 'unknown';
  
  return {
    configured: true,
    protocol,
    hostPrefix: hostPart.substring(0, 20),
    urlLength: dbUrl.length,
    urlPrefix: dbUrl.substring(0, 25)
  };
}
