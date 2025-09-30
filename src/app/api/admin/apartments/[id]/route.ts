import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { Decimal } from '@prisma/client/runtime/library'

const updateApartmentSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  floor: z.number().int().min(0),
  size: z.number().int().min(1),
  maxGuests: z.number().int().min(1),
  maxChildren: z.number().int().min(0),
  basePrice: z.string().refine((val) => {
    const num = parseFloat(val)
    return !isNaN(num) && num > 0
  }, 'Base price must be a positive number'),
  isActive: z.boolean(),
  beds24Id: z.string().nullable().optional(),
  amenities: z.array(z.string()),
  images: z.array(z.string())
})

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is admin
    const userIsAdmin = await isAdmin()
    
    if (!userIsAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await context.params
    const body = await request.json()

    // Validate input
    const validatedData = updateApartmentSchema.parse(body)

    // Check if apartment exists
    const existingApartment = await prisma.apartment.findUnique({
      where: { id }
    })

    if (!existingApartment) {
      return NextResponse.json(
        { error: 'Apartment not found' },
        { status: 404 }
      )
    }

    // Check if slug is unique (if changed)
    if (validatedData.slug !== existingApartment.slug) {
      const slugExists = await prisma.apartment.findUnique({
        where: { slug: validatedData.slug }
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 400 }
        )
      }
    }

    // Update apartment
    const updatedApartment = await prisma.apartment.update({
      where: { id },
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        floor: validatedData.floor,
        size: validatedData.size,
        maxGuests: validatedData.maxGuests,
        maxChildren: validatedData.maxChildren,
        basePrice: new Decimal(validatedData.basePrice),
        isActive: validatedData.isActive,
        beds24Id: validatedData.beds24Id || null,
        amenities: validatedData.amenities,
        images: validatedData.images,
        updatedAt: new Date()
      }
    })

    // Serialize response (convert Decimal to string)
    const serializedApartment = {
      ...updatedApartment,
      basePrice: updatedApartment.basePrice.toString()
    }

    return NextResponse.json({
      success: true,
      apartment: serializedApartment
    })

  } catch (error) {
    console.error('Error updating apartment:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
