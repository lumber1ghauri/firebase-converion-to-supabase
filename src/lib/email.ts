'use server';

import { Resend } from 'resend';
import QuoteEmailTemplate from '@/app/emails/quote-email';
import type { FinalQuote } from '@/lib/types';

const FROM_EMAIL = 'onboarding@resend.dev';

export async function sendQuoteEmail(quote: FinalQuote) {
    // Initialize resend inside the function to ensure the API key is available.
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Skipping email sending.');
        // We can choose to throw an error or resolve silently.
        // For now, let's throw to make it clear during development.
        throw new Error('Email sending failed: RESEND_API_KEY is not configured.');
    }
    
    const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: `GlamBook Pro <${FROM_EMAIL}>`,
      to: [quote.contact.email],
      subject: 'Your Personalized Makeup Quote from GlamBook Pro',
      react: QuoteEmailTemplate({ quote }),
    });

    if (error) {
      console.error('Resend Error:', error);
      // Throw a specific error that can be caught by the server action
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return data;
  } catch (exception) {
    console.error('Email Sending Exception:', exception);
    // Rethrow the exception to be handled by the caller
    throw new Error('An unexpected error occurred while trying to send the email.');
  }
}
