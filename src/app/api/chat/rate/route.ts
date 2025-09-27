import { NextRequest, NextResponse } from 'next/server'
import { rateChatMessage } from '@/services/chatbot'
import { z } from 'zod'

const rateSchema = z.object({
  messageId: z.string(),
  rating: z.number().min(1).max(5),
  wasHelpful: z.boolean().optional(),
  needsImprovement: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request data
    const validatedData = rateSchema.parse(body)
    
    // Rate the message
    await rateChatMessage(
      validatedData.messageId,
      validatedData.rating,
      validatedData.wasHelpful,
      validatedData.needsImprovement
    )
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Rate API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Neplatné dáta v požiadavke' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Nastala technická chyba' },
      { status: 500 }
    )
  }
}
