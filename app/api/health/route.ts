import { NextResponse } from 'next/server'

/**
 * Health check endpoint
 * Used by deployment platforms and monitoring services
 */
export async function GET() {
  try {
    // Basic health check - can be extended with database checks, etc.
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    }

    return NextResponse.json(health, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
