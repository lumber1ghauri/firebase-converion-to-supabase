
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { type BookingDocument } from '@/lib/database';
import { QuoteConfirmation } from '@/components/quote-confirmation';
import { Loader2, AlertTriangle } from 'lucide-react';
import { getBooking } from '@/lib/database';

export default function BookPage() {
  const params = useParams();
  const bookingId = Array.isArray(params.bookingId) ? params.bookingId[0] : params.bookingId;
  const [booking, setBooking] = useState<BookingDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookingId) {
      getBooking(bookingId as string)
        .then(data => {
          if (!data) {
            setError('Booking not found. It may have expired or been removed.');
          } else {
            setBooking(data);
          }
          setIsLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setIsLoading(false);
        });
    }
  }, [bookingId]);

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
        <p className="mt-1 text-xs text-muted-foreground">ID: {bookingId}</p>
      </div>
    );
  }

  if (booking) {
    return <QuoteConfirmation quote={booking.finalQuote} />;
  }

  return null;
}
