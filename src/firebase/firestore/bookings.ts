'use client';

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '../hooks';
import type { FinalQuote } from '@/lib/types';
import { getFirestoreInstance } from '..';

export type BookingDocument = {
    id: string;
    finalQuote: FinalQuote;
    createdAt: Date;
    updatedAt?: Date;
}

export function useBookings() {
    const db = useFirestore();

    const saveBooking = async (booking: Omit<BookingDocument, 'updatedAt'>) => {
        if (!db) {
            throw new Error('Firestore is not initialized');
        }
        const bookingRef = doc(db, 'bookings', booking.id);
        await setDoc(bookingRef, {
            ...booking,
            updatedAt: serverTimestamp(),
        }, { merge: true });
    };

    return { saveBooking };
}

// Server-side action helper
export async function saveBooking(booking: Omit<BookingDocument, 'updatedAt'>) {
    const db = getFirestoreInstance();
    const bookingRef = doc(db, 'bookings', booking.id);
    await setDoc(bookingRef, {
        ...booking,
        updatedAt: serverTimestamp(),
    }, { merge: true });
}


export async function getBooking(bookingId: string): Promise<BookingDocument | null> {
    const db = getFirestoreInstance();
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
