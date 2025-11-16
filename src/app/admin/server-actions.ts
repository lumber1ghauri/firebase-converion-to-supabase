'use server';

import { getAllBookings } from '@/lib/database';
import type { BookingDocument } from '@/lib/database';

export async function fetchAllBookings(): Promise<BookingDocument[]> {
  try {
    return await getAllBookings();
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
}
