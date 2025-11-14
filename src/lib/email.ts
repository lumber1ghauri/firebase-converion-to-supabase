
'use server';
import 'dotenv/config';

import { Resend } from 'resend';
import type { FinalQuote } from './types';
import QuoteEmailTemplate from '@/app/emails/quote-email';

export async function sendQuoteEmail(quote: FinalQuote) {
  // Directly using the API key to bypass environment variable issues.
  const apiKey = "re_X5Wi633i_BLckUhMy5CEeeR5crnfga97H";

  if (!apiKey || apiKey.startsWith('re_') === false || apiKey.length < 20) {
    const errorMessage = `A valid Resend API key is not configured. The current key is either missing, a placeholder, or too short. Email functionality is disabled.`;
    console.error(errorMessage);
    // Return to avoid crashing, but log the issue.
    return;
  }
  
  const resend = new Resend(apiKey);
    
  const clientSubject = quote.status === 'confirmed' 
    ? `Booking Confirmed! - sellaya.ca (ID: ${quote.id})`
    : `Your Makeup Quote from sellaya.ca (ID: ${quote.id})`;

  const adminSubject = quote.status === 'confirmed'
    ? `[ADMIN] Booking Confirmed - ${quote.contact.name} (ID: ${quote.id})`
    : `[ADMIN] New Quote Generated - ${quote.contact.name} (ID: ${quote.id})`;

  const adminEmail = "sellayadigital@gmail.com";
  const fromEmail = 'booking@sellaya.ca';
    
  // Send email to the client
  try {
    const clientEmail = await resend.emails.send({
      from: `Sellaya <${fromEmail}>`,
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
        from: `Sellaya Admin <${fromEmail}>`,
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
