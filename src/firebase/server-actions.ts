
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
    // Get the initialized Firestore instance.
    const { firestore } = await initializeServerFirebase();
    const bookingRef = firestore.collection('bookings').doc(bookingId);
    const docSnap = await bookingRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();
      if (!data) return null;
      
      const finalData: any = { ...data };
      
      // Safely convert Firestore Timestamps to JS Dates for serialization.
      if (finalData.createdAt && typeof finalData.createdAt.toDate === 'function') {
          finalData.createdAt = finalData.createdAt.toDate();
      }
      if (finalData.updatedAt && typeof finalData.updatedAt.toDate === 'function') {
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
