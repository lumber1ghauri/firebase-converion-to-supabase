
'use server';
import 'dotenv/config';

import { Resend } from 'resend';
import type { FinalQuote } from './types';
import QuoteEmailTemplate from '@/app/emails/quote-email';

export async function sendQuoteEmail(quote: FinalQuote) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || apiKey.startsWith('YOUR_API_KEY_HERE') || apiKey.length < 10) {
    const errorMessage = `A valid Resend API key is not configured. The current key is either missing, a placeholder, or too short. Email functionality is disabled.`;
    console.error(errorMessage);
    // In development, we were throwing an error, but that can be disruptive.
    // Instead, we will now throw an error only from the test action,
    // and let other parts of the app fail gracefully.
    // This allows the booking flow to complete even if emails can't be sent.
    throw new Error(errorMessage);
  }
  
  const resend = new Resend(apiKey);
    
  const clientSubject = quote.status === 'confirmed' 
    ? `Booking Confirmed! - Sellaya.ca (ID: ${quote.id})`
    : `Your Makeup Quote from Sellaya.ca (ID: ${quote.id})`;

  const adminSubject = quote.status === 'confirmed'
    ? `[ADMIN] Booking Confirmed - ${quote.contact.name} (ID: ${quote.id})`
    : `[ADMIN] New Quote Generated - ${quote.contact.name} (ID: ${quote.id})`;

  const adminEmail = "sellayadigital@gmail.com";
    
  // Send email to the client
  try {
    const clientEmail = await resend.emails.send({
      from: 'Sellaya <booking@sellaya.ca>',
      to: [quote.contact.email],
      subject: clientSubject,
      react: QuoteEmailTemplate({ quote }),
    });

    if (clientEmail.error) {
      console.error('Client email sending error:', clientEmail.error);
      throw new Error(`Failed to send client email: ${clientEmail.error.message}`);
    } else {
      console.log('Client email sent successfully for booking ID:', quote.id, 'to:', quote.contact.email);
    }
  } catch (error: any) {
    console.error('Error sending client email:', error.message);
    throw error;
  }

  // Send email to the admin
  try {
    const adminEmailNotification = await resend.emails.send({
        from: 'Sellaya Admin <booking@sellaya.ca>',
        to: [adminEmail],
        subject: adminSubject,
        react: QuoteEmailTemplate({ quote }),
    });

    if (adminEmailNotification.error) {
        console.error('Admin email sending error:', adminEmailNotification.error);
         throw new Error(`Failed to send admin notification: ${adminEmailNotification.error.message}`);
    } else {
        console.log('Admin notification email sent successfully for booking ID:', quote.id, 'to:', adminEmail);
    }
  } catch (error: any) {
    console.error('Error sending admin email:', error.message);
    // Don't re-throw here, as the client email might have succeeded.
    // We log it, but we don't want to show a failure to the user if their email went through.
  }
}
