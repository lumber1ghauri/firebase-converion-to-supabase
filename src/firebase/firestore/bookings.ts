'use server';

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { FinalQuote } from '@/lib/types';
import { getFirestoreInstance } from '@/firebase/server';

export type BookingDocument = {
    id: string;
    finalQuote: FinalQuote;
    createdAt: Date;
    updatedAt?: Date;
}

// Server-side action helper
export async function saveBooking(booking: Omit<BookingDocument, 'updatedAt'>) {
    const db = getFirestoreInstance();
    if (!db) {
        console.error("Firestore is not initialized. Skipping saveBooking.");
        return;
    }
    const bookingRef = doc(db, 'bookings', booking.id);
    await setDoc(bookingRef, {
        ...booking,
        updatedAt: serverTimestamp(),
    }, { merge: true });
}


export async function getBooking(bookingId: string): Promise<BookingDocument | null> {
    const db = getFirestoreInstance();
    if (!db) {
        console.error("Firestore is not initialized. Skipping getBooking.");
        return null;
    }
    const bookingRef = doc(db, 'bookings', bookingId);
    const docSnap = await getDoc(bookingRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        // Convert Firestore Timestamps to JS Dates
        return {
            ...data,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt?.toDate(),
        } as BookingDocument;
    } else {
        return null;
    }
}
