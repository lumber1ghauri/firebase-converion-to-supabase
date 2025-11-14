
'use server';
import { getAdminDb } from '@/firebase/admin-app';
import type { FinalQuote } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';

export type BookingDocument = {
    id: string;
    finalQuote: FinalQuote;
    createdAt: Date;
    updatedAt?: Date;
    contact: FinalQuote['contact'];
    phone: string;
}

export async function saveBooking(booking: Omit<BookingDocument, 'updatedAt'>) {
    const db = getAdminDb();
    const bookingRef = db.collection('bookings').doc(booking.id);
    const dataToSave = {
        ...booking,
        createdAt: Timestamp.fromDate(booking.createdAt),
        updatedAt: Timestamp.now(),
    };
    await bookingRef.set(dataToSave, { merge: true });
}

export async function getBooking(bookingId: string): Promise<BookingDocument | null> {
    const db = getAdminDb();
    const bookingRef = db.collection('bookings').doc(bookingId);
    const docSnap = await bookingRef.get();

    if (docSnap.exists) {
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

export async function getAllBookings(): Promise<BookingDocument[]> {
    const db = getAdminDb();
    const bookingsCol = db.collection('bookings');
    const bookingSnapshot = await bookingsCol.get();
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
