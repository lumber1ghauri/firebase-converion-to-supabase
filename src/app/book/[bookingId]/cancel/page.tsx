
'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function StripeCancelPage() {
  const params = useParams();
  const bookingId = Array.isArray(params.bookingId) ? params.bookingId[0] : params.bookingId;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-background">
      <AlertTriangle className="h-20 w-20 text-destructive animate-in fade-in zoom-in-50 duration-700" />
      <h1 className="text-4xl font-headline text-foreground mt-6">Payment Cancelled</h1>
      <p className="text-lg text-muted-foreground mt-2 max-w-prose">
        Your payment was not completed. You can return to the booking page to try again or choose a different payment method.
      </p>
      <Button asChild className="mt-8">
        <Link href={`/book/${bookingId}`}>
          Return to Booking
        </Link>
      </Button>
    </div>
  );
}
