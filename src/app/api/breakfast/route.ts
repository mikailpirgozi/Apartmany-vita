import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/breakfast - Get all breakfasts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const breakfasts = await prisma.breakfast.findMany({
      where: {
        ...(category && { category: category as 'BREAD_AND_EGGS' | 'SWEET' | 'SAVORY' | 'DRINKS' | 'SNACKS' }),
        ...(activeOnly && { isActive: true }),
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    })

    return NextResponse.json(breakfasts)
  } catch (error) {
    console.error('Error fetching breakfasts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch breakfasts' },
      { status: 500 }
    )
  }
}

// POST /api/breakfast - Create new breakfast (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    const breakfast = await prisma.breakfast.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        price: body.price,
        weight: body.weight,
        images: body.images || [],
        category: body.category,
        allergens: body.allergens || [],
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder ?? 0,
        guestPrice: body.guestPrice,
      },
    })

    return NextResponse.json(breakfast, { status: 201 })
  } catch (error) {
    console.error('Error creating breakfast:', error)
    return NextResponse.json(
      { error: 'Failed to create breakfast' },
      { status: 500 }
    )
  }
}
