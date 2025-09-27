import { NextRequest, NextResponse } from 'next/server'
import { subscribeToNewsletter } from '@/services/newsletter'
import { z } from 'zod'

const subscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  language: z.string().default('sk'),
  preferences: z.object({
    promotions: z.boolean().default(true),
    updates: z.boolean().default(true),
    events: z.boolean().default(false)
  }).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request data
    const validatedData = subscribeSchema.parse(body)
    
    // Subscribe to newsletter
    const result = await subscribeToNewsletter(
      validatedData.email,
      validatedData.name,
      validatedData.language
    )
    
    if (result.success) {
      return NextResponse.json(
        { 
          success: true, 
          message: result.message 
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: result.message 
        },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error('Newsletter subscription API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid request data',
          errors: error.issues 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
