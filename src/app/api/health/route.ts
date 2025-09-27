import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Perform basic health checks
    const healthChecks = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      checks: {
        server: true,
        // Add more health checks as needed
        // database: await checkDatabase(),
        // external_apis: await checkExternalAPIs(),
      }
    }
    
    return NextResponse.json(healthChecks, { status: 200 })
  } catch {
    console.error('Health check failed')
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      },
      { status: 503 }
    )
  }
}

export async function HEAD() {
  // Simple health check for monitoring systems
  try {
    return new NextResponse(null, { status: 200 })
  } catch {
    return new NextResponse(null, { status: 503 })
  }
}
