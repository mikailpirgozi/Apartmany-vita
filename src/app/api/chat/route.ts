import { NextRequest, NextResponse } from 'next/server'
import { getChatbotResponse } from '@/services/chatbot'
import { z } from 'zod'

const chatSchema = z.object({
  message: z.string().min(1).max(500),
  conversationHistory: z.array(z.object({
    id: z.string(),
    text: z.string(),
    isBot: z.boolean(),
    timestamp: z.string().transform(str => new Date(str))
  })).optional().default([]),
  language: z.string().default('sk'),
  sessionId: z.string().optional(),
  userId: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request data
    const validatedData = chatSchema.parse(body)
    
    // Get chatbot response
    const response = await getChatbotResponse(
      validatedData.message,
      validatedData.conversationHistory,
      validatedData.language,
      validatedData.sessionId,
      validatedData.userId
    )
    
    return NextResponse.json(response, {
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
  } catch (error) {
    console.error('Chat API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: 'Neplatné dáta v požiadavke',
          suggestions: ['Skúsiť znovu', 'Kontaktovať podporu']
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        message: 'Nastala technická chyba. Prosím kontaktujte nás priamo na +421-900-123-456 alebo info@apartmanvita.sk',
        suggestions: ['Kontaktovať telefonicky', 'Poslať email', 'Skúsiť neskôr']
      },
      { status: 500 }
    )
  }
}

// Handle preflight requests
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
