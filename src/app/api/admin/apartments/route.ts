import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'

export async function GET() {
  try {
    // Check admin authorization
    await requireAdmin()

    const apartments = await prisma.apartment.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(apartments)

  } catch (error) {
    console.error('Fetch apartments error:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch apartments' },
      { status: 500 }
    )
  }
}

