import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { requireAdmin } from '@/lib/admin'
import sharp from 'sharp'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    await requireAdmin()

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 20MB before compression)
    const maxSize = 20 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 20MB.' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Compress and optimize image with sharp
    // Resize to max 1920px width (4K ready), maintain aspect ratio
    // Convert to WebP for better compression (60-70% smaller than JPEG)
    const optimizedBuffer = await sharp(buffer)
      .resize(1920, null, {
        withoutEnlargement: true, // Don't upscale smaller images
        fit: 'inside'
      })
      .webp({
        quality: 85, // High quality, good compression
        effort: 6    // Higher effort = better compression (0-6)
      })
      .toBuffer()

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/\.[^/.]+$/, '') // Remove extension
    const fileName = `apartments/${timestamp}-${originalName}.webp`

    // Upload optimized image to Vercel Blob
    const blob = await put(fileName, optimizedBuffer, {
      access: 'public',
      addRandomSuffix: true,
      contentType: 'image/webp'
    })

    // Log compression stats
    const originalSizeMB = (file.size / 1024 / 1024).toFixed(2)
    const optimizedSizeMB = (optimizedBuffer.length / 1024 / 1024).toFixed(2)
    const savings = (((file.size - optimizedBuffer.length) / file.size) * 100).toFixed(1)
    
    console.log(`📸 Image optimized: ${originalSizeMB}MB → ${optimizedSizeMB}MB (${savings}% savings)`)

    return NextResponse.json({
      url: blob.url,
      success: true,
      stats: {
        originalSize: file.size,
        optimizedSize: optimizedBuffer.length,
        savings: `${savings}%`
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}

