import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key-for-build')

export interface NewsletterSubscriber {
  email: string
  name?: string
  language?: string
  subscribedAt: Date
  status: 'active' | 'unsubscribed'
  preferences?: {
    promotions: boolean
    updates: boolean
    events: boolean
  }
}

export interface NewsletterEmail {
  subject: string
  content: string
  recipients: string[]
  template?: string
  language?: string
}

export async function subscribeToNewsletter(
  email: string, 
  name?: string, 
  language: string = 'sk'
): Promise<{ success: boolean; message: string }> {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return {
        success: false,
        message: 'Invalid email format'
      }
    }

    // In a real implementation, you would save to database
    // For now, we'll just send a welcome email
    
    const welcomeEmailContent = getWelcomeEmailContent(language)
    
    await resend.emails.send({
      from: 'Apartmány Vita <newsletter@apartmanyvita.sk>',
      to: [email],
      subject: welcomeEmailContent.subject,
      html: welcomeEmailContent.html,
      text: welcomeEmailContent.text
    })

    // Add to Resend audience (if configured)
    try {
      await resend.contacts.create({
        email,
        firstName: name,
        audienceId: process.env.RESEND_AUDIENCE_ID || ''
      })
    } catch (audienceError) {
      console.warn('Failed to add to audience:', audienceError)
      // Continue anyway - the welcome email was sent
    }

    return {
      success: true,
      message: 'Successfully subscribed to newsletter'
    }
    
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return {
      success: false,
      message: 'Failed to subscribe to newsletter'
    }
  }
}

export async function unsubscribeFromNewsletter(
  email: string
): Promise<{ success: boolean; message: string }> {
  try {
    // In a real implementation, you would update database status
    // For now, we'll just remove from Resend audience
    
    try {
      await resend.contacts.remove({
        email,
        audienceId: process.env.RESEND_AUDIENCE_ID || ''
      })
    } catch (audienceError) {
      console.warn('Failed to remove from audience:', audienceError)
    }

    return {
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    }
    
  } catch (error) {
    console.error('Newsletter unsubscription error:', error)
    return {
      success: false,
      message: 'Failed to unsubscribe from newsletter'
    }
  }
}

export async function sendNewsletterEmail(emailData: NewsletterEmail): Promise<{ success: boolean; message: string }> {
  try {
    const results = await Promise.allSettled(
      emailData.recipients.map(recipient =>
        resend.emails.send({
          from: 'Apartmány Vita <newsletter@apartmanyvita.sk>',
          to: [recipient],
          subject: emailData.subject,
          html: emailData.content
        })
      )
    )

    const successful = results.filter(result => result.status === 'fulfilled').length
    const failed = results.length - successful

    return {
      success: failed === 0,
      message: `Sent to ${successful} recipients${failed > 0 ? `, ${failed} failed` : ''}`
    }
    
  } catch (error) {
    console.error('Newsletter send error:', error)
    return {
      success: false,
      message: 'Failed to send newsletter'
    }
  }
}

function getWelcomeEmailContent(language: string) {
  const content = {
    sk: {
      subject: 'Vitajte v Apartmánoch Vita! 🏠',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Vitajte v Apartmánoch Vita!</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Ďakujeme za prihlásenie k odberu noviniek</p>
          </div>
          
          <div style="padding: 40px 20px;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Čo môžete očakávať?</h2>
            
            <div style="margin-bottom: 30px;">
              <h3 style="color: #10b981; margin-bottom: 10px;">🎉 Exkluzívne ponuky</h3>
              <p style="color: #6b7280; line-height: 1.6;">Prvé informácie o akciách a zľavách len pre našich odberateľov</p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h3 style="color: #10b981; margin-bottom: 10px;">📅 Novinky a udalosti</h3>
              <p style="color: #6b7280; line-height: 1.6;">Informácie o nových apartmánoch a miestnych podujatiach v Trenčíne</p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h3 style="color: #10b981; margin-bottom: 10px;">💡 Tipy pre pobyt</h3>
              <p style="color: #6b7280; line-height: 1.6;">Odporúčania na reštaurácie, atrakcie a aktivity v okolí</p>
            </div>
            
            <div style="text-align: center; margin-top: 40px;">
              <a href="https://apartmanyvita.sk" style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Navštíviť web</a>
            </div>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              Apartmány Vita | Štúrovo námestie 132/16, 911 01 Trenčín
            </p>
            <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 12px;">
              <a href="mailto:newsletter@apartmanyvita.sk?subject=Unsubscribe" style="color: #6b7280;">Odhlásiť odber</a>
            </p>
          </div>
        </div>
      `,
      text: `
        Vitajte v Apartmánoch Vita!
        
        Ďakujeme za prihlásenie k odberu noviniek. Môžete očakávať:
        
        🎉 Exkluzívne ponuky a zľavy
        📅 Novinky a informácie o podujatiach
        💡 Tipy pre váš pobyt v Trenčíne
        
        Navštívte náš web: https://apartmanyvita.sk
        
        Apartmány Vita
        Štúrovo námestie 132/16, 911 01 Trenčín
      `
    },
    en: {
      subject: 'Welcome to Vita Apartments! 🏠',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Vita Apartments!</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Thank you for subscribing to our newsletter</p>
          </div>
          
          <div style="padding: 40px 20px;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">What can you expect?</h2>
            
            <div style="margin-bottom: 30px;">
              <h3 style="color: #10b981; margin-bottom: 10px;">🎉 Exclusive offers</h3>
              <p style="color: #6b7280; line-height: 1.6;">First access to promotions and discounts for our subscribers only</p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h3 style="color: #10b981; margin-bottom: 10px;">📅 News and events</h3>
              <p style="color: #6b7280; line-height: 1.6;">Information about new apartments and local events in Trenčín</p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h3 style="color: #10b981; margin-bottom: 10px;">💡 Stay tips</h3>
              <p style="color: #6b7280; line-height: 1.6;">Recommendations for restaurants, attractions and activities nearby</p>
            </div>
            
            <div style="text-align: center; margin-top: 40px;">
              <a href="https://apartmanyvita.sk/en" style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Visit Website</a>
            </div>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              Vita Apartments | Štúrovo námestie 132/16, 911 01 Trenčín
            </p>
            <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 12px;">
              <a href="mailto:newsletter@apartmanyvita.sk?subject=Unsubscribe" style="color: #6b7280;">Unsubscribe</a>
            </p>
          </div>
        </div>
      `,
      text: `
        Welcome to Vita Apartments!
        
        Thank you for subscribing to our newsletter. You can expect:
        
        🎉 Exclusive offers and discounts
        📅 News and event information
        💡 Tips for your stay in Trenčín
        
        Visit our website: https://apartmanyvita.sk/en
        
        Vita Apartments
        Štúrovo námestie 132/16, 911 01 Trenčín
      `
    }
  }

  return content[language as keyof typeof content] || content.sk
}
