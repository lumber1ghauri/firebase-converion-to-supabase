
'use server';

import { initializeServerFirebase } from '@/firebase/server-init';
import type { BookingDocument } from '@/firebase/firestore/bookings';

/**
 * A server-only function to fetch a booking document from Firestore.
 * This uses the Firebase Admin SDK and is safe to call from Server Actions.
 */
export async function getBooking(bookingId: string): Promise<BookingDocument | null> {
  if (!bookingId) {
    console.error("getBooking called with no bookingId");
    return null;
  }

  try {
    const { firestore } = await initializeServerFirebase();
    const bookingRef = firestore.collection('bookings').doc(bookingId);
    const docSnap = await bookingRef.get();

    if (docSnap.exists) {
      // The data from the Admin SDK needs to be structured like the client-side document.
      const data = docSnap.data();
      if (!data) return null;
      
      // Convert Firestore Timestamps to Dates if they exist
      const finalData: any = { ...data };
      if (finalData.createdAt && finalData.createdAt.toDate) {
          finalData.createdAt = finalData.createdAt.toDate();
      }
      if (finalData.updatedAt && finalData.updatedAt.toDate) {
          finalData.updatedAt = finalData.updatedAt.toDate();
      }
      
      return {
        ...finalData,
        id: docSnap.id,
      } as BookingDocument;
    } else {
      console.log(`Booking with ID ${bookingId} not found in Firestore.`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching booking ${bookingId} from server:`, error);
    // Throwing the error so the calling action can handle it.
    throw new Error('Failed to retrieve booking data from the server.');
  }
}
