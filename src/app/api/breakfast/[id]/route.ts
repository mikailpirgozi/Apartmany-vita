import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/breakfast/[id] - Get single breakfast
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const breakfast = await prisma.breakfast.findUnique({
      where: { id: params.id },
    })

    if (!breakfast) {
      return NextResponse.json(
        { error: 'Breakfast not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(breakfast)
  } catch (error) {
    console.error('Error fetching breakfast:', error)
    return NextResponse.json(
      { error: 'Failed to fetch breakfast' },
      { status: 500 }
    )
  }
}

// PATCH /api/breakfast/[id] - Update breakfast (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    const breakfast = await prisma.breakfast.update({
      where: { id: params.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.slug && { slug: body.slug }),
        ...(body.description && { description: body.description }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.weight !== undefined && { weight: body.weight }),
        ...(body.images !== undefined && { images: body.images }),
        ...(body.category && { category: body.category }),
        ...(body.allergens !== undefined && { allergens: body.allergens }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
        ...(body.guestPrice !== undefined && { guestPrice: body.guestPrice }),
      },
    })

    return NextResponse.json(breakfast)
  } catch (error) {
    console.error('Error updating breakfast:', error)
    return NextResponse.json(
      { error: 'Failed to update breakfast' },
      { status: 500 }
    )
  }
}

// DELETE /api/breakfast/[id] - Delete breakfast (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    await prisma.breakfast.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting breakfast:', error)
    return NextResponse.json(
      { error: 'Failed to delete breakfast' },
      { status: 500 }
    )
  }
}
