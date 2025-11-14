
'use client';

import { useEffect, useState } from 'react';
import { getBooking } from '@/firebase/firestore/bookings';
import type { BookingDocument } from '@/firebase/firestore/bookings';
import { QuoteConfirmation } from '@/components/quote-confirmation';
import { Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';

export default function BookPage({ params }: { params: { bookingId: string } }) {
  const [booking, setBooking] = useState<BookingDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const db = useFirestore();

  useEffect(() => {
    if (params.bookingId && db) {
      getBooking(db, params.bookingId)
        .then(bookingData => {
          if (bookingData) {
            setBooking(bookingData);
          } else {
            setError('Booking not found. It may have expired or been removed.');
          }
        })
        .catch(err => {
          console.error(err);
          setError('Failed to retrieve booking details.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [params.bookingId, db]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your booking...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="text-2xl font-bold text-destructive">Error</h1>
        <p className="mt-4 text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (booking) {
    return <QuoteConfirmation quote={booking.finalQuote} />;
  }

  return null;
}
