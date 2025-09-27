import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Meno musí mať aspoň 2 znaky').optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  preferences: z.record(z.any()).optional()
})

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        preferences: true,
        createdAt: true,
        _count: {
          select: {
            bookings: {
              where: { status: 'COMPLETED' }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Používateľ nenájdený' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { message: 'Nastala chyba pri načítavaní profilu' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    // Convert dateOfBirth string to Date if provided
    const updateData: Record<string, unknown> = { ...validatedData }
    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth as string)
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        preferences: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: 'Profil bol úspešne aktualizovaný',
      user: updatedUser
    })
  } catch (error) {
    console.error('Profile update error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Neplatné údaje', errors: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Nastala chyba pri aktualizácii profilu' },
      { status: 500 }
    )
  }
}
