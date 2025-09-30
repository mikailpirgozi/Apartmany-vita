import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

/**
 * API route to manually revalidate cached pages
 * Call this after updating apartment images
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { path, secret } = body

    // Verify secret (optional security)
    if (secret && secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 }
      )
    }

    // Revalidate specific path or all apartment-related paths
    if (path) {
      revalidatePath(path)
    } else {
      // Revalidate all main pages
      revalidatePath('/')
      revalidatePath('/apartments')
      revalidatePath('/apartments/[slug]', 'page')
    }

    return NextResponse.json({
      success: true,
      revalidated: path || 'all',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Revalidate error:', error)
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    )
  }
}

// Allow GET for easy testing
export async function GET() {
  try {
    revalidatePath('/')
    revalidatePath('/apartments')
    
    return NextResponse.json({
      success: true,
      message: 'Cache revalidated for homepage and apartments page',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Revalidate error:', error)
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    )
  }
}

