
'use server';
import 'dotenv/config';

import { Resend } from 'resend';
import type { FinalQuote } from './types';
import QuoteEmailTemplate from '@/app/emails/quote-email';


export async function sendQuoteEmail(quote: FinalQuote) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    console.log("RESEND_API_KEY not set or is a placeholder. Skipping email.");
    return;
  }
  
  const resend = new Resend(apiKey);
    
  const clientSubject = quote.status === 'confirmed' 
    ? `Booking Confirmed! - Sellaya.ca (ID: ${quote.id})`
    : `Your Makeup Quote from Sellaya.ca (ID: ${quote.id})`;

  const adminSubject = quote.status === 'confirmed'
    ? `[ADMIN] Booking Confirmed - ${quote.contact.name} (ID: ${quote.id})`
    : `[ADMIN] New Quote Generated - ${quote.contact.name} (ID: ${quote.id})`;

  const adminEmail = "sellayadigital@gmail.com";
    
  try {
    // Send email to the client
    const clientEmail = await resend.emails.send({
      from: 'Sellaya <booking@sellaya.ca>',
      to: [quote.contact.email],
      subject: clientSubject,
      react: QuoteEmailTemplate({ quote }),
    });

    if (clientEmail.error) {
      console.error('Client email sending error:', clientEmail.error);
    } else {
      console.log('Client email sent successfully for booking ID:', quote.id, 'to:', quote.contact.email);
    }

    // Send email to the admin
    const adminEmailNotification = await resend.emails.send({
        from: 'Sellaya Admin <booking@sellaya.ca>',
        to: [adminEmail],
        subject: adminSubject,
        react: QuoteEmailTemplate({ quote }),
    });

    if (adminEmailNotification.error) {
        console.error('Admin email sending error:', adminEmailNotification.error);
    } else {
        console.log('Admin notification email sent successfully for booking ID:', quote.id, 'to:', adminEmail);
    }

  } catch (error) {
    console.error('Failed to send email:', error);
  }
}
