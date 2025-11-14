'use client';
import { useEffect, useState, useMemo } from 'react';
import { getBooking, type BookingDocument } from '@/firebase/firestore/bookings';
import { useFirestore, useDoc } from '@/firebase';
import { QuoteConfirmation } from '@/components/quote-confirmation';
import { Loader2, AlertTriangle } from 'lucide-react';
import { doc } from 'firebase/firestore';

export default function BookPage({ params }: { params: { bookingId: string } }) {
  const { firestore } = useFirebase();
  const [error, setError] = useState<string | null>(null);

  const docRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, 'bookings', params.bookingId);
  }, [firestore, params.bookingId]);

  const { data: booking, isLoading } = useDoc<BookingDocument>(docRef);

  useEffect(() => {
    if (!isLoading && !booking) {
      setError('Booking not found. It may have expired or been removed.');
    }
  }, [isLoading, booking]);

  if (isLoading) {
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
        <AlertTriangle className="w-12 h-12 text-destructive mt-4" />
      </div>
    );
  }

  if (booking) {
    // The data from useDoc is just the document data, not the full BookingDocument type with methods
    // We need to ensure the finalQuote object is what QuoteConfirmation expects
    return <QuoteConfirmation quote={booking.finalQuote} />;
  }

  return null;
}
