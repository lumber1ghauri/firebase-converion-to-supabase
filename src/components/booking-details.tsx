
'use client';

import type { FinalQuote, PriceTier, PaymentDetails } from '@/lib/types';
import { STUDIO_ADDRESS } from '@/lib/services';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { User, Users, MapPin, DollarSign, CalendarClock, Link as LinkIcon, AlertTriangle, MessageSquare, Loader2, Mail, Trash2, Send } from 'lucide-react';
import { differenceInDays, parse } from 'date-fns';
import { Button } from './ui/button';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { saveBookingClient, deleteBooking as deleteBookingClient, type BookingDocument } from '@/firebase/firestore/bookings';
import { sendConfirmationEmailAction, sendFollowUpEmailAction } from '@/app/admin/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

function getTimeToEvent(eventDateStr: string): { text: string; isPast: boolean } {
    const eventDate = parse(eventDateStr, 'PPP', new Date());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = differenceInDays(eventDate, today);

    if (days < 0) {
        return { text: `${Math.abs(days)} days ago`, isPast: true };
    }
    if (days === 0) {
        return { text: "Today", isPast: false };
    }
    if (days === 1) {
        return { text: "Tomorrow", isPast: false };
    }
    return { text: `in ${days} days`, isPast: false };
}

function generateWhatsAppLink(phone: string | undefined): string | null {
    if (!phone) return null;
    // Remove all non-digit characters and add Canadian country code if missing
    let cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length === 10) { // Assumes Canadian/US number without country code
        cleanedPhone = `1${cleanedPhone}`;
    }
    return `https://wa.me/${cleanedPhone}`;
}


export function BookingDetails({ quote, onUpdate, bookingDoc, onBookingDeleted }: { quote: FinalQuote; onUpdate: (updatedQuote: FinalQuote) => void; bookingDoc: BookingDocument | undefined; onBookingDeleted: (bookingId: string) => void; }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingFollowUp, setIsSendingFollowUp] = useState(false);
  const [isSendingConfirmation, setIsSendingConfirmation] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const selectedQuoteData = quote.selectedQuote ? quote.quotes[quote.selectedQuote] : null;
  const eventTimeInfo = getTimeToEvent(quote.booking.days[0].date);
  const whatsappLink = generateWhatsAppLink(quote.contact.phone);
  
  const handleStatusChange = async (newStatus: FinalQuote['status']) => {
      if (!user || !firestore || !bookingDoc) {
          toast({ variant: "destructive", title: "Error", description: "User, database, or booking data not available." });
          return;
      }
      setIsUpdating(true);
      
      const updatedQuote = { ...quote, status: newStatus };

      try {
          await saveBookingClient(firestore, { ...bookingDoc, finalQuote: updatedQuote });
          onUpdate(updatedQuote);
          toast({
              title: "Status Updated",
              description: `Booking moved to '${newStatus}'.`,
          });
      } catch (error: any) {
          toast({
              variant: "destructive",
              title: "Update Failed",
              description: error.message || 'An unknown error occurred.',
          });
      } finally {
          setIsUpdating(false);
      }
  };

  const handlePaymentStatusChange = async (newPaymentStatus: PaymentDetails['status']) => {
    if (!user || !firestore || !bookingDoc || !quote.paymentDetails) {
        toast({ variant: "destructive", title: "Error", description: "Booking or payment data not available." });
        return;
    }
    setIsUpdating(true);

    const updatedQuote: FinalQuote = {
        ...quote,
        paymentDetails: {
            ...quote.paymentDetails,
            status: newPaymentStatus,
        },
    };

    try {
        await saveBookingClient(firestore, { ...bookingDoc, finalQuote: updatedQuote });
        onUpdate(updatedQuote);
        toast({
            title: "Payment Status Updated",
            description: `Payment status set to '${newPaymentStatus}'.`,
        });
        
        // If payment is approved, send confirmation email
        if (newPaymentStatus === 'deposit-paid') {
            await handleSendConfirmation();
        }

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: error.message || 'An unknown error occurred.',
        });
    } finally {
        setIsUpdating(false);
    }
};

  
  const handleSendConfirmation = async () => {
    setIsSendingConfirmation(true);
    const result = await sendConfirmationEmailAction(quote.id);
    if (result.success) {
        toast({ title: "Confirmation Sent!", description: result.message });
    } else {
        toast({ variant: "destructive", title: "Failed to Send", description: result.message });
    }
    setIsSendingConfirmation(false);
  };

  const handleDelete = async () => {
    if (!firestore || !bookingDoc) {
        toast({ variant: "destructive", title: "Error", description: "Database or booking data not available." });
        return;
    }
    setIsUpdating(true);
    try {
        await deleteBookingClient(firestore, bookingDoc.id);
        toast({
            title: "Booking Deleted",
            description: `Booking ID ${bookingDoc.id} has been permanently removed.`,
        });
        onBookingDeleted(bookingDoc.id);
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Deletion Failed",
            description: error.message || 'An unknown error occurred.',
        });
    } finally {
        setIsUpdating(false);
    }
  }

  const handleSendFollowUp = async () => {
    setIsSendingFollowUp(true);
    const result = await sendFollowUpEmailAction(quote.id);
    if (result.success) {
      toast({
        title: "Follow-up Sent!",
        description: result.message,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Failed to Send",
        description: result.message,
      });
    }
    setIsSendingFollowUp(false);
  };
  
  const isActionPending = isUpdating || isSendingFollowUp || isSendingConfirmation;


  return (
    <div className="space-y-6 relative">
      {isActionPending && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
       <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Client Information</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p><strong>Name:</strong> {quote.contact.name}</p>
            <p><strong>Email:</strong> <a href={`mailto:${quote.contact.email}`} className='text-primary hover:underline'>{quote.contact.email}</a></p>
            <p><strong>Phone:</strong> {quote.contact.phone || 'N/A'}</p>
             <div className="flex flex-wrap gap-2 mt-2">
                <Button asChild variant="outline" size="sm">
                    <a href={`mailto:${quote.contact.email}`}>
                        <Mail className="mr-2 h-4 w-4" />
                        Contact by Email
                    </a>
                </Button>
                {whatsappLink && (
                    <Button asChild variant="outline" size="sm">
                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Contact on WhatsApp
                        </a>
                    </Button>
                )}
            </div>
            {quote.booking.address && (
              <div className="pt-4 mt-4 border-t">
                <p className="font-semibold">Service Address:</p>
                <p className="text-muted-foreground">
                  {quote.booking.address.street}<br />
                  {quote.booking.address.city}, {quote.booking.address.province} {quote.booking.address.postalCode}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="space-y-6">
            <Card>
                <CardHeader className='pb-2'>
                    <CardTitle className="text-lg">Booking Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select value={quote.status} onValueChange={(newStatus: FinalQuote['status']) => handleStatusChange(newStatus)} disabled={isActionPending}>
                        <SelectTrigger className="w-[150px] capitalize text-base font-semibold">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="quoted" className="capitalize">Quoted</SelectItem>
                            <SelectItem value="confirmed" className="capitalize">Confirmed</SelectItem>
                            <SelectItem value="cancelled" className="capitalize">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>

                    {quote.selectedQuote && (
                        <div className="flex items-center gap-2 pt-3">
                            {quote.selectedQuote === 'lead' ? <User className="h-5 w-5 text-primary" /> : <Users className="h-5 w-5 text-primary" />}
                            <p className="font-semibold text-sm">
                                {quote.selectedQuote === 'lead' ? 'Anum - Lead Artist' : 'Team'}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
             <Card>
                <CardHeader className='pb-2'>
                    <CardTitle className="text-lg flex items-center gap-2"><CalendarClock className='w-5 h-5'/>Time to Event</CardTitle>
                </CardHeader>
                <CardContent>
                     <p className={`text-xl font-bold ${eventTimeInfo.isPast ? 'text-muted-foreground' : 'text-primary'}`}>{eventTimeInfo.text}</p>
                </CardContent>
            </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Service Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {quote.booking.days.map((day, index) => (
            <div key={index} className="p-3 border rounded-md bg-muted/50">
              <div className="font-semibold flex justify-between">
                <span>{day.serviceName}</span>
                <span>{day.date} at {day.getReadyTime}</span>
              </div>
              <ul className="mt-2 ml-4 list-disc text-sm text-muted-foreground space-y-1">
                <li>Service: {day.serviceOption}</li>
                <li>Location: {day.location}</li>
                {day.location === 'Studio' && 
                    <li>
                         <a href={STUDIO_ADDRESS.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline text-primary">
                            <MapPin className='w-3 h-3'/>{STUDIO_ADDRESS.street}, {STUDIO_ADDRESS.city}
                        </a>
                    </li>
                }
                {day.addOns.length > 0 && (
                  <li>
                    Add-ons:
                    <ul className="ml-4 list-['-_']">
                      {day.addOns.map((addon, i) => <li key={i}>{addon}</li>)}
                    </ul>
                  </li>
                )}
              </ul>
            </div>
          ))}

          {quote.booking.trial && (
             <div className="p-3 border rounded-md bg-muted/50">
                <div className="font-semibold flex justify-between">
                    <span>Bridal Trial</span>
                    <span>{quote.booking.trial.date} at {quote.booking.trial.time}</span>
                </div>
             </div>
          )}

          {quote.booking.bridalParty && quote.booking.bridalParty.services.length > 0 && (
            <div className="p-3 border rounded-md bg-muted/50">
                <p className="font-semibold">Bridal Party Services</p>
                <ul className="mt-2 ml-4 list-disc text-sm text-muted-foreground space-y-1">
                    {quote.booking.bridalParty.services.map((s, i) => <li key={i}>{s.service} (x{s.quantity})</li>)}
                    {quote.booking.bridalParty.airbrush > 0 && <li>Airbrush Service (x{quote.booking.bridalParty.airbrush})</li>}
                </ul>
            </div>
         )}
        </CardContent>
      </Card>
      
      {quote.paymentDetails && selectedQuoteData && (
          <Card>
              <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                      <h4 className="font-medium">Deposit Information</h4>
                      <p className="text-sm">Method: <Badge variant="outline" className="capitalize">{quote.paymentDetails.method}</Badge></p>
                      <p className="text-sm">Amount: <span className="font-mono font-medium">${quote.paymentDetails.depositAmount.toFixed(2)}</span></p>

                      <div className="space-y-2">
                        <Label>Deposit Status</Label>
                        <Select value={quote.paymentDetails.status} onValueChange={(val: PaymentDetails['status']) => handlePaymentStatusChange(val)} disabled={isActionPending}>
                              <SelectTrigger className="w-[200px]">
                                  <SelectValue placeholder="Update status..." />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="deposit-pending">Deposit Pending</SelectItem>
                                  <SelectItem value="deposit-paid">Deposit Received</SelectItem>
                              </SelectContent>
                        </Select>
                      </div>

                  </div>
                  {quote.paymentDetails.method === 'interac' && quote.paymentDetails.screenshotUrl && (
                      <div>
                          <h4 className="font-medium">Payment Screenshot</h4>
                          <a href={quote.paymentDetails.screenshotUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block">
                              <img src={quote.paymentDetails.screenshotUrl} alt="Payment Screenshot" className="rounded-lg border max-w-xs aspect-video object-cover" />
                              <div className="flex items-center gap-2 text-sm text-primary hover:underline mt-1">
                                  <LinkIcon className="w-4 h-4" />
                                  View full size
                              </div>
                          </a>
                      </div>
                  )}
              </CardContent>
          </Card>
      )}


       {!selectedQuoteData && (
         <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {(['lead', 'team'] as PriceTier[]).map(tier => (
                <Card key={tier}>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                             {tier === 'lead' ? <User className="h-5 w-5 text-primary" /> : <Users className="h-5 w-5 text-primary" />}
                            Quote: <span className='capitalize'>{tier}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-1 text-sm">
                            {quote.quotes[tier].lineItems.map((item, index) => (
                                <li key={index} className="flex justify-between">
                                    <span className={item.description.startsWith('  -') ? 'pl-4 text-muted-foreground' : ''}>{item.description}</span>
                                    <span>${quote.quotes[tier].lineItems[index].price.toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                         <Separator className="my-2" />
                         <div className="flex justify-between items-baseline">
                            <span className="font-bold">Total</span>
                            <span className="font-bold text-primary">${quote.quotes[tier].total.toFixed(2)}</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
         </div>
      )}
      
       <div className="pt-6 border-t mt-6 flex flex-wrap gap-4 items-center">
            {quote.status === 'quoted' && (
                <Button 
                    variant="secondary" 
                    className="w-full md:w-auto" 
                    onClick={handleSendFollowUp}
                    disabled={isActionPending}
                >
                    {isSendingFollowUp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Send Follow-up Email
                </Button>
            )}
            {quote.status === 'confirmed' && quote.paymentDetails?.status === 'deposit-paid' && (
                 <Button 
                    variant="secondary" 
                    className="w-full md:w-auto" 
                    onClick={handleSendConfirmation}
                    disabled={isActionPending}
                >
                    {isSendingConfirmation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                    Re-send Confirmation Email
                </Button>
            )}
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full md:w-auto" disabled={isActionPending}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Booking
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the booking
                            for <strong>{quote.contact.name}</strong> (ID: {quote.id}).
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                             {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Yes, delete booking
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    </div>
  );
}
