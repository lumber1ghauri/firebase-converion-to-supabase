
'use server';

import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import type { FinalQuote } from '@/lib/types';
import { getFirestore } from '@/firebase';

export type BookingDocument = {
    id: string;
    finalQuote: FinalQuote;
    createdAt: Date;
    updatedAt?: Date;
    contact: FinalQuote['contact'];
}

// Server-side action helper
export async function saveBooking(booking: Omit<BookingDocument, 'updatedAt'>) {
    const db = getFirestore();
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
    const db = getFirestore();
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
            id: docSnap.id,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt?.toDate(),
        } as BookingDocument;
    } else {
        return null;
    }
}

export async function getAllBookings(): Promise<BookingDocument[]> {
    const db = getFirestore();
    if (!db) {
        console.error("Firestore is not initialized. Skipping getAllBookings.");
        return [];
    }
    const bookingsCol = collection(db, 'bookings');
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
