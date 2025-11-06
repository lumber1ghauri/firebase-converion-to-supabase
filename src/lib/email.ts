'use server';

import { Resend } from 'resend';
import QuoteEmailTemplate from '@/app/emails/quote-email';
import type { FinalQuote } from '@/lib/types';

const FROM_EMAIL = 'onboarding@resend.dev';

export async function sendQuoteEmail(quote: FinalQuote) {
    if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY is not set. Email not sent.');
        throw new Error('Email configuration is missing on the server.');
    }
    
    const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: `GlamBook Pro <${FROM_EMAIL}>`,
      to: [quote.contact.email],
      subject: quote.status === 'confirmed' 
          ? 'Your Booking is Confirmed!'
          : 'Your Personalized Makeup Quote from GlamBook Pro',
      react: QuoteEmailTemplate({ quote }),
    });

    if (error) {
      console.error('Resend Error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return data;
  } catch (exception) {
    console.error('Email Sending Exception:', exception);
    // Rethrow a generic but informative error to avoid leaking implementation details
    throw new Error('An unexpected error occurred while trying to send the email.');
  }
}
