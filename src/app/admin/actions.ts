
'use server';

import 'dotenv/config';
import { getBooking } from '@/firebase/firestore/bookings';
import { initializeFirebase } from '@/firebase';
import { sendQuoteEmail } from '@/lib/email';


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
    // We must initialize firebase on the server to interact with Firestore.
    const { firestore } = initializeFirebase();
    const bookingDoc = await getBooking(firestore, bookingId);

    if (!bookingDoc) {
      return { success: false, message: `Booking with ID ${bookingId} not found.` };
    }

    // Call the existing email function with the booking data.
    await sendQuoteEmail(bookingDoc.finalQuote);

    return { success: true, message: 'Confirmation email sent successfully.' };

  } catch (error: any) {
    console.error('Failed to send confirmation email:', error);
    // Don't return the raw error message to the client in case it contains sensitive info.
    if (error.message.includes('A valid Resend API key is not configured')) {
        return { success: false, message: 'Email server is not configured. Please contact support.' };
    }
    return { success: false, message: 'An unknown error occurred while sending the email.' };
  }
}
