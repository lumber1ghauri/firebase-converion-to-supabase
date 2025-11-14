'use client';
import { useEffect, useState, useMemo } from 'react';
import { getBookingClient, type BookingDocument } from '@/firebase/firestore/bookings';
import { useFirestore, useDoc } from '@/firebase';
import { QuoteConfirmation } from '@/components/quote-confirmation';
import { Loader2, AlertTriangle } from 'lucide-react';
import { doc } from 'firebase/firestore';

export default function BookPage({ params }: { params: { bookingId: string } }) {
  const firestore = useFirestore();
  const [error, setError] = useState<string | null>(null);

  const docRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, 'bookings', params.bookingId);
  }, [firestore, params.bookingId]);

  const { data: booking, isLoading, error: docError } = useDoc<BookingDocument>(docRef);

  useEffect(() => {
    if (!isLoading && !booking) {
      setError('Booking not found. It may have expired or been removed.');
    }
     if (docError) {
      setError(docError.message);
    }
  }, [isLoading, booking, docError]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your booking...</p>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <AlertTriangle className="w-12 h-12 text-destructive mt-4" />
        <h1 className="text-2xl font-bold text-destructive mt-4">Error Loading Booking</h1>
        <p className="mt-2 text-muted-foreground">Could not load the requested booking. It may have been removed or you may not have permission to view it.</p>
        <p className="mt-1 text-xs text-muted-foreground">ID: {params.bookingId}</p>
      </div>
    );
  }

  if (booking) {
    return <QuoteConfirmation quote={booking.finalQuote} />;
  }

  return null;
}
