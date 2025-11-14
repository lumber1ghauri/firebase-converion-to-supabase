
'use server';

import { Resend } from 'resend';
import type { FinalQuote } from './types';
import QuoteEmailTemplate from '@/app/emails/quote-email';


export async function sendQuoteEmail(quote: FinalQuote) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'YOUR_API_KEY_HERE') {
    console.log("RESEND_API_KEY not set or is a placeholder. Skipping email.");
    console.log("Email would be sent to:", quote.contact.email);
    console.log("Quote data:", JSON.stringify(quote, null, 2));
    return;
  }
  
  const resend = new Resend(process.env.RESEND_API_KEY);

  const subject = quote.status === 'confirmed' 
    ? `Booking Confirmed! - Sellaya.ca (ID: ${quote.id})`
    : `Your Makeup Quote from Sellaya.ca (ID: ${quote.id})`;
    
  try {
    const { data, error } = await resend.emails.send({
      from: 'Sellaya <booking@sellaya.ca>',
      to: [quote.contact.email],
      subject: subject,
      react: QuoteEmailTemplate({ quote }),
    });

    if (error) {
      console.error('Email sending error:', error);
      // Don't throw error, just log it. The primary action (quote generation) succeeded.
      return;
    }

    console.log('Email sent successfully:', data);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}
