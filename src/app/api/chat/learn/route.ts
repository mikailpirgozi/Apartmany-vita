import { NextRequest, NextResponse } from 'next/server'
import { saveChatLearning } from '@/services/chatbot'
import { z } from 'zod'

const learnSchema = z.object({
  question: z.string().min(1).max(500),
  answer: z.string().min(1).max(1000),
  context: z.string().optional(),
  language: z.string().default('sk'),
  source: z.enum(['customer', 'owner', 'system']).default('customer')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request data
    const validatedData = learnSchema.parse(body)
    
    // Save learning data
    await saveChatLearning(
      validatedData.question,
      validatedData.answer,
      validatedData.context || '',
      validatedData.language,
      validatedData.source
    )
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Learn API error:', error)
    
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
