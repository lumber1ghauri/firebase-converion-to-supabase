'use server';

import prisma from '@/lib/prisma';
import type { FinalQuote } from '@/lib/types';

export type BookingDocument = {
    id: string;
    uid: string; // User ID of the owner
    finalQuote: FinalQuote;
    createdAt: Date;
    updatedAt?: Date;
}

/**
 * Save or update a booking in the database
 */
export async function saveBooking(
    booking: Partial<BookingDocument> & { id: string }
): Promise<void> {
    try {
        await prisma.booking.upsert({
            where: { id: booking.id },
            update: {
                finalQuote: booking.finalQuote as any,
                uid: booking.uid || 'anonymous',
                updatedAt: new Date(),
            },
            create: {
                id: booking.id,
                uid: booking.uid || 'anonymous',
                finalQuote: booking.finalQuote as any,
                createdAt: booking.createdAt || new Date(),
            },
        });
    } catch (error: any) {
        console.error(`Error saving booking ${booking.id}:`, error);
        throw new Error(`Failed to save booking: ${error.message}`);
    }
}

/**
 * Get a booking by ID
 */
export async function getBooking(bookingId: string): Promise<BookingDocument | null> {
    if (!bookingId) {
        console.error("getBooking called with no bookingId");
        return null;
    }

    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
        });

        if (!booking) {
            console.log(`Booking with ID ${bookingId} not found.`);
            return null;
        }

        return {
            id: booking.id,
            uid: booking.uid,
            finalQuote: booking.finalQuote as FinalQuote,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
        };
    } catch (error) {
        console.error(`Error fetching booking ${bookingId}:`, error);
        throw new Error('Failed to retrieve booking data.');
    }
}

/**
 * Get all bookings (for admin panel)
 */
export async function getAllBookings(): Promise<BookingDocument[]> {
    try {
        const bookings = await prisma.booking.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return bookings.map((booking: any) => ({
            id: booking.id,
            uid: booking.uid,
            finalQuote: booking.finalQuote as FinalQuote,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
        }));
    } catch (error) {
        console.error('Error fetching all bookings:', error);
        throw new Error('Failed to retrieve bookings.');
    }
}

/**
 * Delete a booking
 */
export async function deleteBooking(bookingId: string): Promise<void> {
    try {
        await prisma.booking.delete({
            where: { id: bookingId },
        });
    } catch (error: any) {
        console.error(`Error deleting booking ${bookingId}:`, error);
        throw new Error(`Failed to delete booking: ${error.message}`);
    }
}

/**
 * Upload payment screenshot (saves to local filesystem)
 */
export async function uploadPaymentScreenshot(
    file: File,
    bookingId: string,
    userId: string
): Promise<string> {
    if (!file) {
        throw new Error("No file provided for upload.");
    }

    try {
        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create upload directory structure
        const fs = require('fs');
        const path = require('path');
        
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'payment_screenshots', userId, bookingId);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const filename = `${timestamp}-${file.name}`;
        const filepath = path.join(uploadDir, filename);

        // Write file to disk
        fs.writeFileSync(filepath, buffer);

        // Return public URL
        const publicUrl = `/uploads/payment_screenshots/${userId}/${bookingId}/${filename}`;
        return publicUrl;
    } catch (error: any) {
        console.error("File upload error:", error);
        throw new Error(`Upload failed: ${error.message}`);
    }
}
