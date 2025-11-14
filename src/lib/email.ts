
'use server';
import 'dotenv/config';

import { Resend } from 'resend';
import type { FinalQuote } from './types';
import QuoteEmailTemplate from '@/app/emails/quote-email';
import FollowUpEmailTemplate from '@/app/emails/follow-up-email';
import AdminNotificationEmailTemplate from '@/app/emails/admin-notification-email';


const getBaseUrl = () => {
    // This is the correct, publicly accessible URL for your development environment.
    return 'https://6000-firebase-studio-1762452668457.cluster-fo5feun3fzf2etidpi3ckpp6te.cloudworkstations.dev';
}

const getResend = () => {
    const apiKey = "re_X5Wi633i_BLckUhMy5CEeeR5crnfga97H";
    if (!apiKey || apiKey.startsWith('re_') === false || apiKey.length < 20) {
        console.error('A valid Resend API key is not configured. Email functionality is disabled.');
        // Return null to indicate that Resend is not configured.
        return null;
    }
    return new Resend(apiKey);
}


export async function sendQuoteEmail(quote: FinalQuote) {
  const baseUrl = getBaseUrl();
  const resend = getResend();
  
  if (!resend) {
    // If Resend isn't configured, we can't send emails.
    // We throw an error here so the calling function knows about the failure.
    throw new Error('Resend is not configured. Cannot send quote email.');
  }
    
  const clientSubject = quote.status === 'confirmed' 
    ? `Booking Confirmed! - Looks by Anum (ID: ${quote.id})`
    : `Your Makeup Quote from Looks by Anum (ID: ${quote.id})`;

  const adminSubject = quote.status === 'confirmed'
    ? `[ADMIN] Booking Confirmed - ${quote.contact.name} (ID: ${quote.id})`
    : `[ADMIN] New Quote Generated - ${quote.contact.name} (ID: ${quote.id})`;

  const adminEmail = "sellayadigital@gmail.com";
  const fromEmail = 'booking@sellaya.ca';
    
  const clientEmailPromise = resend.emails.send({
    from: `Looks by Anum <${fromEmail}>`,
    to: [quote.contact.email],
    subject: clientSubject,
    react: QuoteEmailTemplate({ quote, baseUrl }),
  });

  const adminEmailPromise = resend.emails.send({
      from: `Looks by Anum Admin <${fromEmail}>`,
      to: [adminEmail],
      subject: adminSubject,
      react: QuoteEmailTemplate({ quote, baseUrl }),
  });
  
  const [clientEmail, adminEmailNotification] = await Promise.all([clientEmailPromise, adminEmailPromise]);


  if (clientEmail.error) {
    console.error('Client email sending error:', clientEmail.error);
    throw new Error(`Failed to send client email: ${clientEmail.error.message}`);
  } else {
    console.log('Client email sent successfully for booking ID:', quote.id, 'to:', quote.contact.email);
  }
  
  if (adminEmailNotification.error) {
      console.error('Admin email sending error:', adminEmailNotification.error);
      throw new Error(`Failed to send admin notification: ${adminEmailNotification.error.message}`);
  } else {
      console.log('Admin notification email sent successfully for booking ID:', quote.id, 'to:', adminEmail);
  }
}


export async function sendFollowUpEmail(quote: FinalQuote) {
  const baseUrl = getBaseUrl();
  const resend = getResend();
  
  if (!resend) {
    throw new Error('Resend is not configured. Cannot send follow-up email.');
  }

  const subject = `Your Makeup Quote from Looks by Anum is Waiting!`;
  const fromEmail = 'booking@sellaya.ca';

  try {
    const { data, error } = await resend.emails.send({
      from: `Looks by Anum <${fromEmail}>`,
      to: [quote.contact.email],
      subject: subject,
      react: FollowUpEmailTemplate({ quote, baseUrl }),
    });

    if (error) {
      console.error('Follow-up email sending error:', error);
      throw new Error(`Failed to send follow-up email: ${error.message}`);
    }

    console.log('Follow-up email sent successfully for booking ID:', quote.id, 'to:', quote.contact.email);
    return data;
    
  } catch (error: any) {
    console.error('Error in sendFollowUpEmail:', error.message);
    throw error; // Re-throw to be caught by the server action
  }
}

export async function sendAdminScreenshotNotification(quote: FinalQuote) {
  const baseUrl = getBaseUrl();
  const resend = getResend();
  
  if (!resend) {
    throw new Error('Resend is not configured. Cannot send admin notification email.');
  }

  const adminEmail = "sellayadigital@gmail.com";
  const fromEmail = 'booking@sellaya.ca';

  try {
    const { data, error } = await resend.emails.send({
      from: `GlamBook Pro Admin <${fromEmail}>`,
      to: [adminEmail],
      subject: `[ACTION REQUIRED] E-Transfer Submitted for Booking #${quote.id}`,
      react: AdminNotificationEmailTemplate({ quote, baseUrl }),
    });

    if (error) {
      console.error('Admin notification email sending error:', error);
      throw new Error(`Failed to send admin notification email: ${error.message}`);
    }

    console.log('Admin notification email sent successfully for booking ID:', quote.id);
    return data;
    
  } catch (error: any) {
    console.error('Error in sendAdminScreenshotNotification:', error.message);
    throw error;
  }
}
