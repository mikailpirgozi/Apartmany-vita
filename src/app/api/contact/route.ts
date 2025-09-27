import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendEmail } from '@/services/email'
import { createRateLimit } from '@/lib/security'

// Contact form validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Meno musí mať aspoň 2 znaky').max(100, 'Meno je príliš dlhé'),
  email: z.string().email('Neplatný email'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Predmet musí mať aspoň 5 znakov').max(200, 'Predmet je príliš dlhý'),
  message: z.string().min(10, 'Správa musí mať aspoň 10 znakov').max(2000, 'Správa je príliš dlhá')
})

// Rate limiting for contact form
const contactRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5, // 5 requests per minute
  message: 'Príliš veľa správ odoslaných'
})

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await contactRateLimit(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = contactSchema.parse(body)
    
    // Get client IP for logging
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'

    // Prepare email content
    const emailContent = `
      Nová správa z kontaktného formulára:
      
      Meno: ${validatedData.name}
      Email: ${validatedData.email}
      Telefón: ${validatedData.phone || 'Neuvedené'}
      Predmet: ${validatedData.subject}
      
      Správa:
      ${validatedData.message}
      
      ---
      IP adresa: ${clientIP}
      Čas: ${new Date().toLocaleString('sk-SK', { timeZone: 'Europe/Bratislava' })}
    `

    // Send email to admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'info@apartmanyvita.sk',
      subject: `Kontaktný formulár: ${validatedData.subject}`,
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>')
    })

    // Send confirmation email to user
    const confirmationContent = `
      Ďakujeme za vašu správu!
      
      Vaša správa bola úspešne odoslaná. Odpovieme vám čo najskôr.
      
      Vaša správa:
      Predmet: ${validatedData.subject}
      Správa: ${validatedData.message}
      
      ---
      Apartmány Vita
      ${process.env.NEXT_PUBLIC_APP_URL || 'https://apartmanyvita.sk'}
    `

    await sendEmail({
      to: validatedData.email,
      subject: 'Potvrdenie prijatia správy - Apartmány Vita',
      text: confirmationContent,
      html: confirmationContent.replace(/\n/g, '<br>')
    })

    // Log the contact form submission (you might want to save to database)
    console.log(`Contact form submission from ${validatedData.email} (${clientIP})`)

    return NextResponse.json(
      { 
        message: 'Správa bola úspešne odoslaná',
        success: true 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Contact form error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: 'Neplatné údaje v formulári',
          errors: error.errors,
          success: false 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Nastala chyba pri odosielaní správy. Skúste to znovu.',
        success: false 
      },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  )
}
