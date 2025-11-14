
'use server';

import 'dotenv/config';
import { getBooking } from '@/firebase/server-actions';
import { sendQuoteEmail, sendFollowUpEmail } from '@/lib/email';


type ActionResult = {
  success: boolean;
  message: string;
};

// This is a server action that can be called from the client-side
// to securely trigger a confirmation email.
export async function sendConfirmationEmailAction(bookingId: string): Promise<ActionResult> {
  if (!bookingId) {
    return { success: false, message: 'Booking ID is missing.' };
  }

  try {
    const bookingDoc = await getBooking(bookingId);

    if (!bookingDoc) {
      return { success: false, message: `Booking with ID ${bookingId} not found.` };
    }
    
     // We only send the email if the booking is actually confirmed.
    if (bookingDoc.finalQuote.status !== 'confirmed') {
        return { success: false, message: `This action is only for 'confirmed' bookings. This booking is currently '${bookingDoc.finalQuote.status}'.` };
    }

    // Call the existing email function with the booking data.
    await sendQuoteEmail(bookingDoc.finalQuote);

    return { success: true, message: 'Confirmation email sent successfully.' };

  } catch (error: any) {
    console.error('Failed to send confirmation email:', error);
    // Provide more specific feedback based on the error.
    if (error.message.includes('Resend is not configured')) {
        return { success: false, message: 'Email server is not configured. Please check API keys.' };
    }
    return { success: false, message: 'An unknown error occurred while sending the email.' };
  }
}

export async function sendFollowUpEmailAction(bookingId: string): Promise<ActionResult> {
  if (!bookingId) {
    return { success: false, message: 'Booking ID is missing.' };
  }

  try {
    const bookingDoc = await getBooking(bookingId);

    if (!bookingDoc) {
      return { success: false, message: `Booking with ID ${bookingId} not found.` };
    }
    
    if (bookingDoc.finalQuote.status !== 'quoted') {
        return { success: false, message: `This action is only for 'quoted' bookings. This booking is currently '${bookingDoc.finalQuote.status}'.` };
    }

    await sendFollowUpEmail(bookingDoc.finalQuote);

    return { success: true, message: 'Follow-up email sent successfully.' };

  } catch (error: any)
{
    console.error('Failed to send follow-up email:', error);
    // Provide more specific feedback based on the error.
    if (error.message.includes('Resend is not configured')) {
        return { success: false, message: 'Email server is not configured. Please check API keys.' };
    }
    // Return the actual error message for better debugging.
    return { success: false, message: error.message || 'An unknown error occurred while sending the follow-up email.' };
  }
}
