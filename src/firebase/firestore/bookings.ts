'use client';
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  collection,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import type { FinalQuote } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export type BookingDocument = {
    id: string;
    finalQuote: FinalQuote;
    createdAt: Date;
    updatedAt?: Date;
    contact: FinalQuote['contact'];
    phone: string;
}

export async function saveBooking(
    firestore: Firestore,
    booking: Omit<BookingDocument, 'updatedAt' | 'createdAt'> & { createdAt?: Date }
) {
    const bookingRef = doc(firestore, 'bookings', booking.id);
    const dataToSave = {
        ...booking,
        updatedAt: serverTimestamp(),
        createdAt: booking.createdAt ? booking.createdAt : serverTimestamp(),
    };
    
    // Non-blocking write with error handling
    setDoc(bookingRef, dataToSave, { merge: true })
      .catch((error) => {
        console.error("Error saving booking: ", error);
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: bookingRef.path,
            operation: 'write',
            requestResourceData: dataToSave,
          })
        );
        // Re-throw to allow the caller to handle UI feedback if needed
        throw error;
      });
}

export async function getBooking(firestore: Firestore, bookingId: string): Promise<BookingDocument | null> {
    const bookingRef = doc(firestore, 'bookings', bookingId);
    const docSnap = await getDoc(bookingRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        if (!data) return null;
        return {
            ...data,
            id: docSnap.id,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt?.toDate(),
        } as BookingDocument;
    } else {
        return null;
    }
}

export async function getAllBookings(firestore: Firestore): Promise<BookingDocument[]> {
    const bookingsCol = collection(firestore, 'bookings');
    const bookingSnapshot = await getDocs(bookingsCol);
    const bookingList = bookingSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt?.toDate(),
        } as BookingDocument
    });
    return bookingList;
}
