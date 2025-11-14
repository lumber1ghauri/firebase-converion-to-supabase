'use client';
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  collection,
  serverTimestamp,
  type Firestore,
  addDoc,
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
    
    // Ensure uid is part of the data to be saved
    const dataToSave = {
        ...booking,
        uid: booking.uid,
        updatedAt: serverTimestamp(),
        // Only set createdAt on initial creation
        ...(booking.createdAt ? {} : { createdAt: serverTimestamp() }),
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

export async function getAllBookings(firestore: Firestore): Promise<BookingDocument[]> {
    const bookingsCol = collection(firestore, 'bookings');
    try {
        const bookingSnapshot = await getDocs(bookingsCol);
        const bookingList = bookingSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
            } as BookingDocument
        });
        return bookingList;
    } catch (error: any) {
        const permissionError = new FirestorePermissionError({
            path: bookingsCol.path,
            operation: 'list'
        });
        errorEmitter.emit('permission-error', permissionError);
        throw error;
    }
}
