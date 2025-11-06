'use server';

import { Resend } from 'resend';
import QuoteEmailTemplate from '@/app/emails/quote-email';
import type { FinalQuote } from '@/lib/types';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'hello@sellaya.com';

export async function sendQuoteEmail(quote: FinalQuote) {
  try {
    const { data, error } = await resend.emails.send({
      from: `GlamBook Pro <${FROM_EMAIL}>`,
      to: [quote.contact.email],
      subject: 'Your Personalized Makeup Quote from GlamBook Pro',
      react: QuoteEmailTemplate({ quote }),
    });

    if (error) {
      console.error('Resend Error:', error);
      throw new Error('Failed to send email.');
    }

    return data;
  } catch (exception) {
    console.error('Email Sending Exception:', exception);
    throw new Error('An unexpected error occurred while trying to send the email.');
  }
}
