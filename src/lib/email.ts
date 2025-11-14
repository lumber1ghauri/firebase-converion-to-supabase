
'use server';

import { Resend } from 'resend';
import type { FinalQuote } from './types';
import QuoteEmailTemplate from '@/app/emails/quote-email';


export async function sendQuoteEmail(quote: FinalQuote) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    console.log("RESEND_API_KEY not set or is a placeholder. Skipping email.");
    console.log("Email would be sent to:", quote.contact.email);
    return;
  }
  
  const resend = new Resend(apiKey);

  const subject = quote.status === 'confirmed' 
    ? `Booking Confirmed! - Sellaya.ca (ID: ${quote.id})`
    : `Your Makeup Quote from Sellaya.ca (ID: ${quote.id})`;
    
  try {
    const { data, error } = await resend.emails.send({
      from: 'Sellaya <onboarding@resend.dev>',
      to: [quote.contact.email],
      subject: subject,
      react: QuoteEmailTemplate({ quote }),
    });

    if (error) {
      console.error('Email sending error:', error);
      // Don't throw error, just log it. The primary action (quote generation) succeeded.
      return;
    }

    console.log('Email sent successfully for booking ID:', quote.id);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}
