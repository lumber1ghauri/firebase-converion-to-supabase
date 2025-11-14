'use server';

import { initializeServerFirebase } from '@/firebase/server-init';
import { sendQuoteEmail } from '@/lib/email';
import type { BookingDocument } from './bookings';

// Server-side saveBooking for server actions
export async function saveBooking(
    booking: Omit<BookingDocument, 'updatedAt' | 'createdAt' | 'uid'>
) {
    const { firestore } = await initializeServerFirebase();
    const bookingRef = firestore.collection('bookings').doc(booking.id);
    
    const dataToSave = {
        ...booking,
        // The UID is not relevant for a server-action-created quote
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    try {
        await bookingRef.set(dataToSave, { merge: true });
        
        // Send email only when a quote is first created
        if (booking.finalQuote.status === 'quoted') {
            await sendQuoteEmail(booking.finalQuote);
        }
    } catch (error: any) {
        console.error(`[Server Action] Error saving booking ${booking.id}:`, error);
        // Re-throwing the error to be caught by the action's try/catch block
        throw new Error(`Failed to save booking data: ${error.message}`);
    }
}
