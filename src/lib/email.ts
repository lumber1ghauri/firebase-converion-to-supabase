'use server';

import { Resend } from 'resend';
import QuoteEmailTemplate from '@/app/emails/quote-email';
import type { FinalQuote } from '@/lib/types';

const FROM_EMAIL = 'onboarding@resend.dev';
// This is your verified Resend email address
const TO_EMAIL_SANDBOX = 'sellayadigital@gmail.com';


export async function sendQuoteEmail(quote: FinalQuote) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set. Email not sent.');
    throw new Error('Email configuration is missing on the server.');
  }
  
  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: `GlamBook Pro <${FROM_EMAIL}>`,
      // In sandbox mode, 'to' must be your verified email.
      // We will send to the customer's email in production after domain verification.
      to: [TO_EMAIL_SANDBOX],
      subject: quote.status === 'confirmed' 
          ? `[TEST] Booking Confirmed for ${quote.contact.name}!`
          : `[TEST] Your Makeup Quote for ${quote.contact.name}`,
      react: QuoteEmailTemplate({ quote }),
    });

    if (error) {
      // This will now throw the specific error from Resend
      throw new Error(error.message);
    }

    return data;
  } catch (exception: unknown) {
    // This will catch any other exceptions and still provide a useful message
    if (exception instanceof Error) {
        console.error('Email Sending Exception:', exception.message);
        throw new Error(exception.message);
    }
    console.error('An unknown email sending error occurred:', exception);
    throw new Error('An unexpected error occurred while trying to send the email.');
  }
}
