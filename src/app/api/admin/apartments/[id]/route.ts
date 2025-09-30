import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'
import { z } from 'zod'

const updateApartmentSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  floor: z.number().int().min(0).optional(),
  size: z.number().int().min(1).optional(),
  maxGuests: z.number().int().min(1).optional(),
  maxChildren: z.number().int().min(0).optional(),
  images: z.array(z.string().url()).optional(),
  amenities: z.array(z.string()).optional(),
  basePrice: z.number().positive().optional(),
  isActive: z.boolean().optional(),
})

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Check admin authorization
    await requireAdmin()

    const { id } = await params

    const apartment = await prisma.apartment.findUnique({
      where: { id }
    })

    if (!apartment) {
      return NextResponse.json(
        { error: 'Apartment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(apartment)

  } catch (error) {
    console.error('Fetch apartment error:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch apartment' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Check admin authorization
    await requireAdmin()

    const { id } = await params
    const body = await request.json()

    // Validate input
    const validatedData = updateApartmentSchema.parse(body)

    // Check if apartment exists
    const apartment = await prisma.apartment.findUnique({
      where: { id }
    })

    if (!apartment) {
      return NextResponse.json(
        { error: 'Apartment not found' },
        { status: 404 }
      )
    }

    // Update apartment
    const updatedApartment = await prisma.apartment.update({
      where: { id },
      data: validatedData
    })

    // Revalidate all pages that display apartments
    revalidatePath('/')
    revalidatePath('/apartments')
    revalidatePath(`/apartments/${apartment.slug}`)

    return NextResponse.json(updatedApartment)

  } catch (error) {
    console.error('Update apartment error:', error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update apartment' },
      { status: 500 }
    )
  }
}

