
'use client';

import { useEffect } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { saveBookingClient, getBookingClient } from '@/firebase/firestore/bookings';
import { Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Button } from '@/ui/button';
import { sendConfirmationEmailAction } from '@/app/admin/actions';

export default function StripeSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const bookingId = Array.isArray(params.bookingId) ? params.bookingId[0] : params.bookingId;
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (firestore && user && bookingId && sessionId) {
      const updateBooking = async () => {
        try {
          const bookingDoc = await getBookingClient(firestore, bookingId);
          if (bookingDoc && bookingDoc.finalQuote.paymentDetails?.status !== 'deposit-paid') {
            
            const updatedQuote = {
              ...bookingDoc.finalQuote,
              status: 'confirmed',
              paymentDetails: {
                ...bookingDoc.finalQuote.paymentDetails,
                method: 'stripe',
                status: 'deposit-paid',
                depositAmount: bookingDoc.finalQuote.selectedQuote ? bookingDoc.finalQuote.quotes[bookingDoc.finalQuote.selectedQuote].total * 0.5 : 0,
              },
            };

            await saveBookingClient(firestore, { ...bookingDoc, finalQuote: updatedQuote });
            
            toast({
              title: "Payment Successful!",
              description: "Your booking is confirmed. A confirmation email has been sent.",
              variant: 'default',
            });
            await sendConfirmationEmailAction(bookingId);
          }
        } catch (error: any) {
          console.error("Failed to update booking after Stripe success:", error);
          toast({
            title: "Update Failed",
            description: `Your payment was successful, but we failed to update your booking. Please contact us with booking ID ${bookingId}.`,
            variant: "destructive",
          });
        }
      };

      updateBooking();
    }
  }, [firestore, user, bookingId, sessionId, toast]);

  if (!bookingId || !sessionId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <AlertTriangle className="w-12 h-12 text-destructive mt-4" />
        <h1 className="text-2xl font-bold text-destructive mt-4">Invalid Page Access</h1>
        <p className="mt-2 text-muted-foreground">This page was accessed incorrectly. Please return to your booking.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-background">
      <ShieldCheck className="h-20 w-20 text-green-500 animate-in fade-in zoom-in-50 duration-700" />
      <h1 className="text-4xl font-headline text-foreground mt-6">Payment Successful!</h1>
      <p className="text-lg text-muted-foreground mt-2 max-w-prose">
        Thank you! Your booking is confirmed. We are updating your booking details and will send a confirmation email shortly.
      </p>
      <Loader2 className="h-8 w-8 animate-spin text-primary my-8" />
       <Button asChild>
        <Link href={`/book/${bookingId}/`}>
            Return to Booking
        </Link>
       </Button>
    </div>
  );
}
