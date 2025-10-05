import { Resend } from 'resend'
import { Booking, User } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export interface AutomationTrigger {
  type: 'booking_confirmed' | 'checkin_reminder' | 'checkout_followup' | 'birthday' | 'abandoned_booking'
  delay?: number // in hours
  conditions?: Record<string, unknown>
}

export async function sendBookingConfirmationEmail(booking: Booking, user: User): Promise<boolean> {
  try {
    const template = generateBookingConfirmationTemplate(booking)
    
    await resend.emails.send({
      from: 'Apartmány Vita <reservations@apartmanvita.sk>',
      to: [user.email],
      subject: template.subject,
      html: template.html,
      text: template.text,
      tags: [
        { name: 'type', value: 'booking_confirmation' },
        { name: 'apartment', value: booking.apartment?.slug || 'unknown' },
        { name: 'booking_id', value: booking.id }
      ]
    })

    return true
  } catch (error) {
    console.error('Failed to send booking confirmation:', error)
    return false
  }
}

export async function sendCheckInInstructionsEmail(booking: Booking, user: User): Promise<boolean> {
  try {
    const template = generateCheckInInstructionsTemplate(booking)
    
    await resend.emails.send({
      from: 'Apartmány Vita <info@apartmanvita.sk>',
      to: [user.email],
      subject: template.subject,
      html: template.html,
      text: template.text,
      tags: [
        { name: 'type', value: 'checkin_instructions' },
        { name: 'apartment', value: booking.apartment?.slug || 'unknown' },
        { name: 'booking_id', value: booking.id }
      ]
    })

    return true
  } catch (error) {
    console.error('Failed to send check-in instructions:', error)
    return false
  }
}

export async function sendCheckOutFollowupEmail(booking: Booking, user: User): Promise<boolean> {
  try {
    const template = generateCheckOutFollowupTemplate()
    
    await resend.emails.send({
      from: 'Apartmány Vita <info@apartmanvita.sk>',
      to: [user.email],
      subject: template.subject,
      html: template.html,
      text: template.text,
      tags: [
        { name: 'type', value: 'checkout_followup' },
        { name: 'apartment', value: booking.apartment?.slug || 'unknown' },
        { name: 'booking_id', value: booking.id }
      ]
    })

    return true
  } catch (error) {
    console.error('Failed to send check-out followup:', error)
    return false
  }
}

export async function sendPromotionalEmail(
  recipients: string[],
  subject: string,
  content: string,
  language: string = 'sk'
): Promise<{ sent: number; failed: number }> {
  let sent = 0
  let failed = 0

  for (const recipient of recipients) {
    try {
      await resend.emails.send({
        from: 'Apartmány Vita <newsletter@apartmanvita.sk>',
        to: [recipient],
        subject,
        html: content,
        tags: [
          { name: 'type', value: 'promotional' },
          { name: 'language', value: language }
        ]
      })
      sent++
    } catch (error) {
      console.error(`Failed to send promotional email to ${recipient}:`, error)
      failed++
    }
  }

  return { sent, failed }
}

function generateBookingConfirmationTemplate(booking: Booking): EmailTemplate {
  const checkInDate = new Date(booking.checkIn).toLocaleDateString('sk-SK')
  const checkOutDate = new Date(booking.checkOut).toLocaleDateString('sk-SK')
  
  return {
    subject: `Potvrdenie rezervácie #${booking.id} - Apartmány Vita`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Rezervácia potvrdená! ✅</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Ďakujeme za vašu rezerváciu</p>
        </div>

        <!-- Booking Details -->
        <div style="padding: 40px 20px;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Detaily rezervácie</h2>
          
          <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <div style="display: grid; gap: 15px;">
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">
                <span style="font-weight: 600; color: #374151;">Rezervácia #:</span>
                <span style="color: #6b7280;">${booking.id}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">
                <span style="font-weight: 600; color: #374151;">Apartmán:</span>
                <span style="color: #6b7280;">${booking.apartment?.name || 'Neznámy apartmán'}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">
                <span style="font-weight: 600; color: #374151;">Príchod:</span>
                <span style="color: #6b7280;">${checkInDate} od 15:00</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">
                <span style="font-weight: 600; color: #374151;">Odchod:</span>
                <span style="color: #6b7280;">${checkOutDate} do 11:00</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">
                <span style="font-weight: 600; color: #374151;">Hostia:</span>
                <span style="color: #6b7280;">${booking.guests} osôb</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; color: #10b981;">
                <span>Celková cena:</span>
                <span>€${booking.totalPrice}</span>
              </div>
            </div>
          </div>

          <!-- Important Info -->
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h3 style="color: #92400e; margin-top: 0;">Dôležité informácie</h3>
            <ul style="color: #92400e; margin: 0; padding-left: 20px;">
              <li>Check-in kód vám pošleme 24 hodín pred príchodom</li>
              <li>Apartmán sa nachádza na Štúrovom námestí 132/16</li>
              <li>Parkovanie: verejné parkovisko 50m od budovy</li>
              <li>Pri problémoch volajte: +421-940-728-676</li>
            </ul>
          </div>

          <!-- Contact -->
          <div style="text-align: center;">
            <p style="color: #6b7280; margin-bottom: 20px;">
              Ak máte akékoľvek otázky, neváhajte nás kontaktovať
            </p>
            <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
              <a href="tel:+421940728676" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">📞 Zavolať</a>
              <a href="mailto:info@apartmanvita.sk" style="background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">✉️ Email</a>
              <a href="https://wa.me/421940728676" style="background: #25d366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">💬 WhatsApp</a>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0; font-size: 14px;">
            Apartmány Vita | Štúrovo námestie 132/16, 911 01 Trenčín
          </p>
          <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 12px;">
            Tešíme sa na vašu návštevu! 🏠
          </p>
        </div>
      </div>
    `,
    text: `
      Rezervácia potvrdená! ✅
      
      Ďakujeme za vašu rezerváciu v Apartmánoch Vita.
      
      DETAILY REZERVÁCIE:
      Rezervácia #: ${booking.id}
      Apartmán: ${booking.apartment?.name || 'Neznámy apartmán'}
      Príchod: ${checkInDate} od 15:00
      Odchod: ${checkOutDate} do 11:00
      Hostia: ${booking.guests} osôb
      Celková cena: €${booking.totalPrice}
      
      DÔLEŽITÉ INFORMÁCIE:
      - Check-in kód vám pošleme 24 hodín pred príchodom
      - Apartmán: Štúrovo námestie 132/16, Trenčín
      - Parkovanie: verejné parkovisko 50m od budovy
      - Kontakt: +421-940-728-676
      
      Tešíme sa na vašu návštevu!
      
      Apartmány Vita
      info@apartmanvita.sk
      +421-900-123-456
    `
  }
}

function generateCheckInInstructionsTemplate(booking: Booking): EmailTemplate {
  const checkInDate = new Date(booking.checkIn).toLocaleDateString('sk-SK')
  const accessCode = generateAccessCode(booking.id)
  
  return {
    subject: `Check-in inštrukcie - ${booking.apartment?.name || 'Apartmán'} | ${checkInDate}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10b981; padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Vitajte v Apartmánoch Vita! 🗝️</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Váš check-in je zajtra</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: center;">
            <h2 style="color: #92400e; margin-top: 0;">Váš prístupový kód</h2>
            <div style="font-size: 32px; font-weight: bold; color: #92400e; letter-spacing: 4px; font-family: monospace;">
              ${accessCode}
            </div>
            <p style="color: #92400e; margin-bottom: 0; font-size: 14px;">
              Zadajte tento kód na elektronickom zámku
            </p>
          </div>
          
          <h3 style="color: #1f2937;">Check-in inštrukcie:</h3>
          <ol style="color: #6b7280; line-height: 1.6;">
            <li><strong>Adresa:</strong> Štúrovo námestie 132/16, Trenčín</li>
            <li><strong>Vchod:</strong> Hlavný vchod z námestia</li>
            <li><strong>Kód:</strong> Zadajte ${accessCode} na elektronickom zámku</li>
            <li><strong>Apartmán:</strong> ${booking.apartment?.name || 'Apartmán'} - ${booking.apartment?.floor || '?'}. poschodie</li>
            <li><strong>WiFi:</strong> VitaGuest / heslo: vita2024</li>
          </ol>
          
          <div style="background: #dbeafe; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #1e40af; margin-top: 0;">📍 Parkovanie</h4>
            <p style="color: #1e40af; margin-bottom: 0;">
              Verejné parkovisko sa nachádza 50m od apartmánu. 
              Parkovné: €1/hodina, €8/deň.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #6b7280;">Potrebujete pomoc?</p>
            <a href="tel:+421940728676" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0 10px;">Zavolať</a>
            <a href="https://wa.me/421940728676" style="background: #25d366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0 10px;">WhatsApp</a>
          </div>
        </div>
      </div>
    `,
    text: `
      Vitajte v Apartmánoch Vita! 🗝️
      
      Váš prístupový kód: ${accessCode}
      
      CHECK-IN INŠTRUKCIE:
      1. Adresa: Štúrovo námestie 132/16, Trenčín
      2. Vchod: Hlavný vchod z námestia
      3. Kód: Zadajte ${accessCode} na elektronickom zámku
      4. Apartmán: ${booking.apartment?.name || 'Apartmán'} - ${booking.apartment?.floor || '?'}. poschodie
      5. WiFi: VitaGuest / heslo: vita2024
      
      PARKOVANIE:
      Verejné parkovisko 50m od apartmánu
      Parkovné: €1/hod, €8/deň
      
      Potrebujete pomoc? Volajte +421-940-728-676
      
      Tešíme sa na vás!
    `
  }
}

function generateCheckOutFollowupTemplate(): EmailTemplate {
  return {
    subject: 'Ďakujeme za pobyt v Apartmánoch Vita! ⭐',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Ďakujeme za pobyt! 🙏</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Dúfame, že ste si pobyt užili</p>
        </div>
        
        <div style="padding: 40px 20px; text-align: center;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Ako ste spokojní s pobytom?</h2>
          
          <div style="margin: 30px 0;">
            <a href="https://g.page/apartmanvita/review" style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              ⭐ Napísať recenziu na Google
            </a>
          </div>
          
          <p style="color: #6b7280; margin: 30px 0;">
            Vaša recenzia nám pomôže zlepšovať naše služby a pomôže ostatným hosťom pri rozhodovaní.
          </p>
          
          <div style="background: #f0f9ff; border-radius: 8px; padding: 30px; margin: 30px 0;">
            <h3 style="color: #0369a1; margin-top: 0;">🎉 Exkluzívna ponuka pre vás!</h3>
            <p style="color: #0369a1; margin-bottom: 20px;">
              Ako poďakovanie za vašu návštevu vám ponúkame <strong>10% zľavu</strong> na vašu ďalšiu rezerváciu.
            </p>
            <div style="background: white; border: 2px dashed #0369a1; border-radius: 8px; padding: 15px; display: inline-block;">
              <span style="font-size: 18px; font-weight: bold; color: #0369a1;">KÓDVITA10</span>
            </div>
            <p style="color: #0369a1; font-size: 14px; margin: 10px 0 0 0;">
              Platnosť do: ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('sk-SK')}
            </p>
          </div>
          
          <div style="margin: 40px 0;">
            <a href="https://apartmanvita.sk" style="background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Rezervovať znovu
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            Ak máte akékoľvek pripomienky alebo návrhy, neváhajte nás kontaktovať na 
            <a href="mailto:info@apartmanvita.sk" style="color: #10b981;">info@apartmanvita.sk</a>
          </p>
        </div>
      </div>
    `,
    text: `
      Ďakujeme za pobyt v Apartmánoch Vita! 🙏
      
      Dúfame, že ste si pobyt užili a radi by sme vás poprosili o recenziu na Google:
      https://g.page/apartmanvita/review
      
      EXKLUZÍVNA PONUKA:
      10% zľava na ďalšiu rezerváciu
      Kód: VITA10
      Platnosť do: ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('sk-SK')}
      
      Rezervovať znovu: https://apartmanvita.sk
      
      Ďakujeme za vašu návštevu!
      
      Apartmány Vita
      info@apartmanvita.sk
      +421-940-728-676
    `
  }
}

function generateAccessCode(bookingId: string): string {
  // Generate a 6-digit access code based on booking ID
  const hash = bookingId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  return Math.abs(hash).toString().padStart(6, '0').slice(0, 6)
}
