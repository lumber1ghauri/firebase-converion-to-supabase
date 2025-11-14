
'use server';
import 'dotenv/config';

import { Resend } from 'resend';
import type { FinalQuote } from './types';
import QuoteEmailTemplate from '@/app/emails/quote-email';


export async function sendQuoteEmail(quote: FinalQuote) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE' || apiKey === 're_NiSSXDzL_Kf4jAhdFS2nAvA6M5Uaambtv') {
    console.log("RESEND_API_KEY not set or is a placeholder/test key. Skipping email.");
    if (apiKey === 're_NiSSXDzL_Kf4jAhdFS2nAvA6M5Uaambtv') {
        throw new Error('The provided Resend API key is a test key and cannot be used. Please provide a valid key.');
    }
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
    
  // Send email to the client
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

  // Send email to the admin
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
}
