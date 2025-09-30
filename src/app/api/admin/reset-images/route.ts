import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'

/**
 * Reset all apartment images to empty array
 * Use this to clear placeholder images
 */
export async function POST() {
  try {
    // Check admin authorization
    await requireAdmin()

    // Update all apartments to have empty images
    const result = await prisma.apartment.updateMany({
      data: {
        images: []
      }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully cleared images from ${result.count} apartments`,
      count: result.count
    })

  } catch (error) {
    console.error('Reset images error:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to reset images' },
      { status: 500 }
    )
  }
}

