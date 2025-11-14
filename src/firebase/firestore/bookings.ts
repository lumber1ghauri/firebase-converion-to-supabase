'use client';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  type Firestore,
  type Timestamp,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { FinalQuote } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { sendQuoteEmail } from '@/lib/email';

export type BookingDocument = {
    id: string;
    uid?: string; // User ID of the owner
    finalQuote: FinalQuote;
    createdAt: Timestamp;
    updatedAt?: Timestamp;
    contact: FinalQuote['contact'];
    phone: string;
}

export async function saveBooking(
    firestore: Firestore,
    booking: Omit<BookingDocument, 'updatedAt' | 'createdAt' | 'uid'> & { uid?: string; createdAt?: Date | Timestamp }
) {
    const bookingRef = doc(firestore, 'bookings', booking.id);
    
    const dataToSave = {
        ...booking,
        uid: booking.uid || 'anonymous', // Assign uid, default to anonymous
        updatedAt: serverTimestamp(),
        ...(booking.createdAt ? { createdAt: booking.createdAt } : { createdAt: serverTimestamp() }),
    };

    try {
        // On the server, we save with admin privileges so we don't need a try/catch
        // On the client, we need to handle permissions errors
        if (typeof window !== 'undefined') { // Check if running on client
             await setDoc(bookingRef, dataToSave, { merge: true });
        } else {
             await setDoc(bookingRef, dataToSave, { merge: true });
        }
        // Send email only when a quote is first created
        if (booking.finalQuote.status === 'quoted') {
            await sendQuoteEmail(booking.finalQuote);
        }
    } catch (error) {
        if (typeof window !== 'undefined') {
            errorEmitter.emit(
              'permission-error',
              new FirestorePermissionError({
                path: bookingRef.path,
                operation: 'write',
                requestResourceData: dataToSave,
              })
            );
        }
        throw error;
    }
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
            } as BookingDocument;
        } else {
            return null;
        }
    } catch (error: any) {
         if (typeof window !== 'undefined') { // Only create contextual error on client
            const permissionError = new FirestorePermissionError({
                path: bookingRef.path,
                operation: 'get'
            });
            errorEmitter.emit('permission-error', permissionError);
            throw permissionError; // re-throw the contextual error
         }
         throw error; // On server, just throw original error
    }
}

export async function uploadPaymentScreenshot(file: File, bookingId: string, userId: string): Promise<string> {
    const storage = getStorage();
    const filePath = `payment_screenshots/${userId}/${bookingId}/${file.name}`;
    const storageRef = ref(storage, filePath);
    
    try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading payment screenshot:", error);
        // Here you might want to handle storage permission errors specifically
        // For now, re-throwing a generic error.
        throw new Error("Failed to upload payment screenshot.");
    }
}
