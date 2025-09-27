/**
 * Email Service
 * Handles booking confirmations, reminders, and notifications using Resend
 */

import { Resend } from 'resend';
import { format, differenceInDays } from 'date-fns';
import { sk } from 'date-fns/locale';
import type { Booking, User, Apartment } from '@prisma/client';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const FROM_EMAIL = 'Apartmány Vita <reservations@apartmanyvita.sk>';
const REPLY_TO_EMAIL = 'info@apartmanyvita.sk';
const ADMIN_EMAIL = 'admin@apartmanyvita.sk';

export interface BookingWithDetails extends Booking {
  user: User;
  apartment: Apartment;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface SimpleEmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

/**
 * Send simple email (for contact forms, etc.)
 */
export async function sendEmail(options: SimpleEmailOptions): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      replyTo: REPLY_TO_EMAIL,
      subject: options.subject,
      html: options.html || options.text || '',
      text: options.text
    });

    if (error) {
      console.error('Error sending email:', error);
      return false;
    }

    console.log('Email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmation(
  booking: BookingWithDetails,
  user: User
): Promise<boolean> {
  try {
    const template = generateBookingConfirmationTemplate(booking);
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      replyTo: REPLY_TO_EMAIL,
      subject: template.subject,
      html: template.html,
      text: template.text,
      attachments: [
        {
          filename: `rezervacia-${booking.id}.pdf`,
          content: await generateBookingPDF(booking)
        }
      ]
    });

    if (error) {
      console.error('Error sending booking confirmation:', error);
      return false;
    }

    console.log('Booking confirmation sent:', data?.id);
    return true;
  } catch (error) {
    console.error('Failed to send booking confirmation:', error);
    return false;
  }
}

/**
 * Send check-in instructions (1 day before arrival)
 */
export async function sendCheckInInstructions(
  booking: BookingWithDetails
): Promise<boolean> {
  try {
    const template = generateCheckInInstructionsTemplate(booking);
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: booking.user.email,
      replyTo: REPLY_TO_EMAIL,
      subject: template.subject,
      html: template.html,
      text: template.text
    });

    if (error) {
      console.error('Error sending check-in instructions:', error);
      return false;
    }

    console.log('Check-in instructions sent:', data?.id);
    return true;
  } catch (error) {
    console.error('Failed to send check-in instructions:', error);
    return false;
  }
}

/**
 * Send booking cancellation confirmation
 */
export async function sendCancellationConfirmation(
  booking: BookingWithDetails,
  refundAmount?: number
): Promise<boolean> {
  try {
    const template = generateCancellationTemplate(booking, refundAmount);
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: booking.user.email,
      replyTo: REPLY_TO_EMAIL,
      subject: template.subject,
      html: template.html,
      text: template.text
    });

    if (error) {
      console.error('Error sending cancellation confirmation:', error);
      return false;
    }

    console.log('Cancellation confirmation sent:', data?.id);
    return true;
  } catch (error) {
    console.error('Failed to send cancellation confirmation:', error);
    return false;
  }
}

/**
 * Send payment reminder (7 days before check-in)
 */
export async function sendPaymentReminder(
  booking: BookingWithDetails
): Promise<boolean> {
  try {
    const template = generatePaymentReminderTemplate(booking);
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: booking.user.email,
      replyTo: REPLY_TO_EMAIL,
      subject: template.subject,
      html: template.html,
      text: template.text
    });

    if (error) {
      console.error('Error sending payment reminder:', error);
      return false;
    }

    console.log('Payment reminder sent:', data?.id);
    return true;
  } catch (error) {
    console.error('Failed to send payment reminder:', error);
    return false;
  }
}

/**
 * Send admin notification for new booking
 */
export async function sendAdminBookingNotification(
  booking: BookingWithDetails
): Promise<boolean> {
  try {
    const template = generateAdminBookingTemplate(booking);
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: template.subject,
      html: template.html,
      text: template.text
    });

    if (error) {
      console.error('Error sending admin notification:', error);
      return false;
    }

    console.log('Admin notification sent:', data?.id);
    return true;
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    return false;
  }
}

/**
 * Generate booking confirmation email template
 */
function generateBookingConfirmationTemplate(booking: BookingWithDetails): EmailTemplate {
  const checkInDate = format(booking.checkIn, 'EEEE, d. MMMM yyyy', { locale: sk });
  const checkOutDate = format(booking.checkOut, 'EEEE, d. MMMM yyyy', { locale: sk });
  const nights = differenceInDays(booking.checkOut, booking.checkIn);

  const subject = `Potvrdenie rezervácie #${booking.id} - Apartmány Vita`;

  const html = `
    <!DOCTYPE html>
    <html lang="sk">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .booking-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .highlight { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Rezervácia potvrdená!</h1>
          <p>Ďakujeme za vašu rezerváciu v Apartmánoch Vita</p>
        </div>
        
        <div class="content">
          <p>Vážený/á ${booking.user.name},</p>
          
          <p>Vaša rezervácia bola úspešne vytvorená a potvrdená. Tešíme sa na vašu návštevu!</p>
          
          <div class="booking-details">
            <h3>Detaily rezervácie</h3>
            <div class="detail-row">
              <strong>Číslo rezervácie:</strong>
              <span>#${booking.id}</span>
            </div>
            <div class="detail-row">
              <strong>Apartmán:</strong>
              <span>${booking.apartment.name}</span>
            </div>
            <div class="detail-row">
              <strong>Príchod:</strong>
              <span>${checkInDate} od 15:00</span>
            </div>
            <div class="detail-row">
              <strong>Odchod:</strong>
              <span>${checkOutDate} do 11:00</span>
            </div>
            <div class="detail-row">
              <strong>Počet nocí:</strong>
              <span>${nights}</span>
            </div>
            <div class="detail-row">
              <strong>Hostia:</strong>
              <span>${booking.guests} dospalých${booking.children > 0 ? `, ${booking.children} detí` : ''}</span>
            </div>
            <div class="detail-row">
              <strong>Celková cena:</strong>
              <span><strong>€${booking.totalPrice}</strong></span>
            </div>
          </div>
          
          <div class="highlight">
            <strong>Dôležité informácie o platbe:</strong><br>
            Vaša karta bola zatiaľ len autorizovaná. Skutočná platba prebehne 7 dní pred príchodom.
            Ak budete potrebovať rezerváciu zrušiť, môžete tak urobiť bezplatne do 24 hodín pred príchodom.
          </div>
          
          <p><strong>Adresa:</strong><br>
          Štúrovo námestie 132/16<br>
          911 01 Trenčín</p>
          
          <p><strong>Kontakt:</strong><br>
          Email: info@apartmanyvita.sk<br>
          Telefón: +421 900 123 456</p>
          
          <a href="https://apartmanyvita.sk/booking/${booking.id}" class="button">
            Zobraziť rezerváciu online
          </a>
        </div>
        
        <div class="footer">
          <p>Apartmány Vita | Štúrovo námestie 132/16 | 911 01 Trenčín</p>
          <p>www.apartmanyvita.sk | info@apartmanyvita.sk</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    POTVRDENIE REZERVÁCIE #${booking.id}
    
    Vážený/á ${booking.user.name},
    
    Vaša rezervácia v Apartmánoch Vita bola úspešne potvrdená.
    
    DETAILY REZERVÁCIE:
    - Číslo rezervácie: #${booking.id}
    - Apartmán: ${booking.apartment.name}
    - Príchod: ${checkInDate} od 15:00
    - Odchod: ${checkOutDate} do 11:00
    - Hostia: ${booking.guests} dospalých${booking.children > 0 ? `, ${booking.children} detí` : ''}
    - Celková cena: €${booking.totalPrice}
    
    Adresa: Štúrovo námestie 132/16, 911 01 Trenčín
    Kontakt: info@apartmanyvita.sk, +421 900 123 456
    
    Tešíme sa na vašu návštevu!
    
    Apartmány Vita
  `;

  return { subject, html, text };
}

/**
 * Generate check-in instructions template
 */
function generateCheckInInstructionsTemplate(booking: BookingWithDetails): EmailTemplate {
  const checkInDate = format(booking.checkIn, 'EEEE, d. MMMM yyyy', { locale: sk });

  const subject = `Pokyny na príchod - ${checkInDate} - Apartmány Vita`;

  const html = `
    <!DOCTYPE html>
    <html lang="sk">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .instructions { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .step { margin: 15px 0; padding: 10px; background: white; border-radius: 6px; }
        .important { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Pokyny na príchod</h1>
          <p>Rezervácia #${booking.id} - ${booking.apartment.name}</p>
        </div>
        
        <div class="content">
          <p>Vážený/á ${booking.user.name},</p>
          
          <p>Zajtra je váš príchod do Apartmánov Vita! Posielame vám pokyny na check-in.</p>
          
          <div class="instructions">
            <h3>Pokyny na príchod:</h3>
            
            <div class="step">
              <strong>1. Čas príchodu:</strong><br>
              Check-in je možný od 15:00 do 22:00. Ak plánujete prísť neskôr, prosím kontaktujte nás vopred.
            </div>
            
            <div class="step">
              <strong>2. Adresa:</strong><br>
              Štúrovo námestie 132/16, 911 01 Trenčín<br>
              (Budova s červenou fasádou, vchod z námestia)
            </div>
            
            <div class="step">
              <strong>3. Parkovanie:</strong><br>
              Bezplatné parkovanie na Štúrovom námestí alebo v okolí. Modré zóny sú bezplatné po 18:00 a cez víkend.
            </div>
            
            <div class="step">
              <strong>4. Kľúče:</strong><br>
              Kľúče si vyzdvihnete osobne pri príchode. Zazvonite na zvonček "Apartmány Vita" alebo zavolajte +421 900 123 456.
            </div>
          </div>
          
          <div class="important">
            <strong>Dôležité:</strong><br>
            • Majte so sebou doklad totožnosti<br>
            • Platba prebehne automaticky z vašej karty<br>
            • Pri probléme volajte +421 900 123 456
          </div>
          
          <p>Tešíme sa na vašu návštevu a želáme vám príjemný pobyt v Trenčíne!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    POKYNY NA PRÍCHOD - ${checkInDate}
    Rezervácia #${booking.id}
    
    Vážený/á ${booking.user.name},
    
    Zajtra je váš príchod do Apartmánov Vita!
    
    POKYNY:
    1. Čas príchodu: 15:00 - 22:00
    2. Adresa: Štúrovo námestie 132/16, 911 01 Trenčín
    3. Parkovanie: Bezplatne na námestí
    4. Kľúče: Vyzdvihnutie osobne, zvonček "Apartmány Vita"
    
    Kontakt: +421 900 123 456
    
    Tešíme sa na vašu návštevu!
  `;

  return { subject, html, text };
}

/**
 * Generate cancellation confirmation template
 */
function generateCancellationTemplate(booking: BookingWithDetails, refundAmount?: number): EmailTemplate {
  const subject = `Potvrdenie zrušenia rezervácie #${booking.id} - Apartmány Vita`;

  const html = `
    <!DOCTYPE html>
    <html lang="sk">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .refund-info { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Rezervácia zrušená</h1>
          <p>Potvrdenie zrušenia rezervácie #${booking.id}</p>
        </div>
        
        <div class="content">
          <p>Vážený/á ${booking.user.name},</p>
          
          <p>Vaša rezervácia #${booking.id} bola úspešne zrušená.</p>
          
          ${refundAmount ? `
            <div class="refund-info">
              <h3>Informácie o refundácii:</h3>
              <p>Suma €${refundAmount} bude vrátená na vašu kartu do 5-10 pracovných dní.</p>
            </div>
          ` : `
            <div class="refund-info">
              <h3>Informácie o platbe:</h3>
              <p>Autorizácia na vašej karte bola zrušená. Žiadne peniaze neboli stiahnuté.</p>
            </div>
          `}
          
          <p>Ďakujeme za váš záujem o Apartmány Vita. Budeme sa tešiť na vašu návštevu v budúcnosti!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    POTVRDENIE ZRUŠENIA REZERVÁCIE #${booking.id}
    
    Vážený/á ${booking.user.name},
    
    Vaša rezervácia bola úspešne zrušená.
    
    ${refundAmount 
      ? `Suma €${refundAmount} bude vrátená na vašu kartu do 5-10 pracovných dní.`
      : 'Autorizácia na vašej karte bola zrušená.'
    }
    
    Ďakujeme za váš záujem o Apartmány Vita.
  `;

  return { subject, html, text };
}

/**
 * Generate payment reminder template
 */
function generatePaymentReminderTemplate(booking: BookingWithDetails): EmailTemplate {
  const checkInDate = format(booking.checkIn, 'EEEE, d. MMMM yyyy', { locale: sk });

  const subject = `Pripomienka platby - Rezervácia #${booking.id} - Apartmány Vita`;

  const html = `
    <!DOCTYPE html>
    <html lang="sk">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .payment-info { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Pripomienka platby</h1>
          <p>Rezervácia #${booking.id}</p>
        </div>
        
        <div class="content">
          <p>Vážený/á ${booking.user.name},</p>
          
          <p>Pripomíname vám, že za 7 dní (${checkInDate}) sa uskutoční váš príchod do Apartmánov Vita.</p>
          
          <div class="payment-info">
            <h3>Informácie o platbe:</h3>
            <p>Dnes bude z vašej karty stiahnutá suma €${booking.totalPrice} za rezerváciu #${booking.id}.</p>
            <p>Apartmán: ${booking.apartment.name}</p>
            <p>Dátum pobytu: ${checkInDate}</p>
          </div>
          
          <p>Ak máte akékoľvek otázky, neváhajte nás kontaktovať.</p>
          
          <p>Tešíme sa na vašu návštevu!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    PRIPOMIENKA PLATBY - Rezervácia #${booking.id}
    
    Vážený/á ${booking.user.name},
    
    Za 7 dní sa uskutoční váš príchod do Apartmánov Vita.
    
    Dnes bude z vašej karty stiahnutá suma €${booking.totalPrice}.
    
    Apartmán: ${booking.apartment.name}
    Dátum pobytu: ${checkInDate}
    
    Tešíme sa na vašu návštevu!
  `;

  return { subject, html, text };
}

/**
 * Generate admin booking notification template
 */
function generateAdminBookingTemplate(booking: BookingWithDetails): EmailTemplate {
  const checkInDate = format(booking.checkIn, 'dd.MM.yyyy');
  const checkOutDate = format(booking.checkOut, 'dd.MM.yyyy');

  const subject = `Nová rezervácia #${booking.id} - ${booking.apartment.name}`;

  const html = `
    <!DOCTYPE html>
    <html lang="sk">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .booking-details { background: #f9f9f9; padding: 20px; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Nová rezervácia</h1>
          <p>#${booking.id}</p>
        </div>
        
        <div class="content">
          <div class="booking-details">
            <h3>Detaily rezervácie:</h3>
            <p><strong>ID:</strong> ${booking.id}</p>
            <p><strong>Apartmán:</strong> ${booking.apartment.name}</p>
            <p><strong>Hosť:</strong> ${booking.user.name}</p>
            <p><strong>Email:</strong> ${booking.user.email}</p>
            <p><strong>Telefón:</strong> ${booking.user.phone || 'Neuvedené'}</p>
            <p><strong>Príchod:</strong> ${checkInDate}</p>
            <p><strong>Odchod:</strong> ${checkOutDate}</p>
            <p><strong>Hostia:</strong> ${booking.guests}${booking.children > 0 ? ` + ${booking.children} detí` : ''}</p>
            <p><strong>Cena:</strong> €${booking.totalPrice}</p>
            <p><strong>Status:</strong> ${booking.status}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    NOVÁ REZERVÁCIA #${booking.id}
    
    Apartmán: ${booking.apartment.name}
    Hosť: ${booking.user.name} (${booking.user.email})
    Dátum: ${checkInDate} - ${checkOutDate}
    Hostia: ${booking.guests}${booking.children > 0 ? ` + ${booking.children} detí` : ''}
    Cena: €${booking.totalPrice}
    Status: ${booking.status}
  `;

  return { subject, html, text };
}

/**
 * Generate booking PDF (placeholder - implement with jsPDF or similar)
 */
async function generateBookingPDF(): Promise<Buffer> {
  // TODO: Implement PDF generation using jsPDF, Puppeteer, or similar
  // For now, return empty buffer
  return Buffer.from('PDF content would be here');
}

/**
 * Schedule email reminders (to be called by cron job)
 */
export async function scheduleEmailReminders(): Promise<void> {
  const { prisma } = await import('@/lib/db');
  
  try {
    // Get bookings that need payment reminders (7 days before check-in)
    const paymentReminders = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        checkIn: {
          gte: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)  // 7 days from now
        }
      },
      include: {
        user: true,
        apartment: true
      }
    });

    for (const booking of paymentReminders) {
      await sendPaymentReminder(booking);
    }

    // Get bookings that need check-in instructions (1 day before check-in)
    const checkInReminders = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        checkIn: {
          gte: new Date(Date.now() + 23 * 60 * 60 * 1000), // 23 hours from now
          lte: new Date(Date.now() + 25 * 60 * 60 * 1000)  // 25 hours from now
        }
      },
      include: {
        user: true,
        apartment: true
      }
    });

    for (const booking of checkInReminders) {
      await sendCheckInInstructions(booking);
    }

    console.log(`Sent ${paymentReminders.length} payment reminders and ${checkInReminders.length} check-in instructions`);
  } catch (error) {
    console.error('Error scheduling email reminders:', error);
  }
}
