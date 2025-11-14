
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, Firestore, Timestamp } from 'firebase/firestore';
import type { FinalQuote } from '@/lib/types';

export type BookingDocument = {
    id: string;
    finalQuote: FinalQuote;
    createdAt: Date;
    updatedAt?: Date;
    contact: FinalQuote['contact'];
    phone: string;
}

export async function saveBooking(db: Firestore, booking: Omit<BookingDocument, 'updatedAt'>) {
    if (!db) {
        console.error("Firestore is not initialized. Skipping saveBooking.");
        return;
    }
    const bookingRef = doc(db, 'bookings', booking.id);
    // Convert Date objects to Timestamps for Firestore
    const dataToSave = {
        ...booking,
        createdAt: Timestamp.fromDate(booking.createdAt),
        updatedAt: serverTimestamp(),
    };
    await setDoc(bookingRef, dataToSave, { merge: true });
}


export async function getBooking(db: Firestore, bookingId: string): Promise<BookingDocument | null> {
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

export async function getAllBookings(db: Firestore): Promise<BookingDocument[]> {
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
