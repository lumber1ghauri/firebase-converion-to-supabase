'use client';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import type { FinalQuote } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export type BookingDocument = {
    id: string;
    uid: string; // User ID of the owner
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
        uid: booking.uid,
        updatedAt: serverTimestamp(),
        ...(booking.createdAt ? {} : { createdAt: serverTimestamp() }),
    };

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
        throw error;
      });
}

export async function getBooking(firestore: Firestore, bookingId: string): Promise<BookingDocument | null> {
    const bookingRef = doc(firestore, 'bookings', bookingId);
    
    try {
        const docSnap = await getDoc(bookingRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            if (!data) return null;
            return {
                ...data,
                id: docSnap.id,
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
            } as BookingDocument;
        } else {
            return null;
        }
    } catch (error: any) {
        const permissionError = new FirestorePermissionError({
            path: bookingRef.path,
            operation: 'get'
        });
        errorEmitter.emit('permission-error', permissionError);
        throw error;
    }
}
