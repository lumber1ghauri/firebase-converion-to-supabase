'use client';

import type { FinalQuote, PaymentInfo, PaymentStatus, PriceTier } from '@/lib/types';
import { STUDIO_ADDRESS } from '@/lib/services';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { User, Users, MapPin, DollarSign, CalendarClock, Link as LinkIcon, AlertTriangle, MessageSquare, Loader2 } from 'lucide-react';
import { differenceInDays, parse } from 'date-fns';
import { Button } from './ui/button';
import { updateBookingStatusAction } from '@/app/actions';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { saveBooking } from '@/firebase/firestore/bookings';

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


const PaymentDetailCard = ({ title, paymentInfo, onStatusChange }: { 
    title: string; 
    paymentInfo: PaymentInfo; 
    onStatusChange: (update: { depositStatus?: PaymentStatus; finalStatus?: PaymentStatus }) => void;
}) => {
    const isPending = paymentInfo.status === 'pending';
    const paymentType = title.toLowerCase().includes('deposit') ? 'deposit' : 'final';

    return (
        <Card className={isPending ? "bg-destructive/10 border-destructive/30" : "bg-green-500/10 border-green-500/30"}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-base">{title}</CardTitle>
                    <Select 
                        value={paymentInfo.status} 
                        onValueChange={(newStatus: PaymentStatus) => {
                            if(paymentType === 'deposit') {
                                onStatusChange({ depositStatus: newStatus });
                            } else {
                                onStatusChange({ finalStatus: newStatus });
                            }
                        }}
                    >
                        <SelectTrigger className="w-[120px] h-8 text-xs capitalize">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pending" className="capitalize text-xs">Pending</SelectItem>
                            <SelectItem value="received" className="capitalize text-xs">Received</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
                <p className="font-mono text-xl font-bold text-foreground/80">${paymentInfo.amount.toFixed(2)}</p>
                {paymentInfo.screenshotUrl ? (
                    <a href={paymentInfo.screenshotUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                        <LinkIcon className="w-3 h-3" />
                        View Screenshot
                    </a>
                ) : (
                    <p className="text-xs text-muted-foreground">No screenshot provided.</p>
                )}
            </CardContent>
        </Card>
    )
}

export function BookingDetails({ quote, onUpdate }: { quote: FinalQuote; onUpdate: (updatedQuote: FinalQuote) => void; }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const selectedQuoteData = quote.selectedQuote ? quote.quotes[quote.selectedQuote] : null;
  const eventTimeInfo = getTimeToEvent(quote.booking.days[0].date);
  const whatsappLink = generateWhatsAppLink(quote.contact.phone);
  
  const handleStatusChange = async (update: {
      status?: FinalQuote['status'];
      depositStatus?: PaymentStatus;
      finalStatus?: PaymentStatus;
  }) => {
      if (!user || !firestore) {
          toast({ variant: "destructive", title: "Error", description: "User or database not available." });
          return;
      }
      setIsUpdating(true);
      
      let updatedQuote = { ...quote };

      if (update.status) {
          updatedQuote.status = update.status;
      }
      if (updatedQuote.paymentDetails) {
          if (update.depositStatus) {
              updatedQuote.paymentDetails.deposit.status = update.depositStatus;
          }
          if (update.finalStatus) {
              updatedQuote.paymentDetails.final.status = update.finalStatus;
          }
          if (update.finalStatus === 'received') {
              updatedQuote.paymentDetails.deposit.status = 'received';
          }
      }

      try {
          await saveBooking(firestore, { id: updatedQuote.id, uid: user.uid, finalQuote: updatedQuote, contact: updatedQuote.contact, phone: updatedQuote.contact.phone });
          onUpdate(updatedQuote);
          toast({
              title: "Status Updated",
              description: "The booking has been successfully updated.",
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


  return (
    <div className="space-y-6 relative">
      {isUpdating && (
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
            <p><strong>Email:</strong> {quote.contact.email}</p>
            <p><strong>Phone:</strong> {quote.contact.phone || 'N/A'}</p>
             {whatsappLink && (
                  <Button asChild variant="outline" size="sm" className="mt-2">
                      <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Contact on WhatsApp
                      </a>
                  </Button>
              )}
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
                    <Select value={quote.status} onValueChange={(newStatus: FinalQuote['status']) => handleStatusChange({ status: newStatus })}>
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
      
      {selectedQuoteData && (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-1 text-sm">
                        {selectedQuoteData.lineItems.map((item, index) => (
                        <li key={index} className="flex justify-between">
                            <span className={item.description.startsWith('  -') || item.description.startsWith('Party:') ? 'pl-4 text-muted-foreground' : ''}>{item.description}</span>
                            <span className="font-mono">${item.price.toFixed(2)}</span>
                        </li>
                        ))}
                    </ul>
                    <Separator className="my-2" />
                    <ul className="space-y-1 text-sm">
                        <li className="flex justify-between font-medium">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className='font-mono'>${selectedQuoteData.subtotal.toFixed(2)}</span>
                        </li>
                        <li className="flex justify-between font-medium">
                            <span className="text-muted-foreground">GST (13%)</span>
                            <span className='font-mono'>${selectedQuoteData.tax.toFixed(2)}</span>
                        </li>
                    </ul>
                    <Separator className="my-2" />
                    <div className="flex justify-between items-baseline">
                        <span className="text-lg font-bold">Total</span>
                        <span className="text-2xl font-bold text-primary font-mono">${selectedQuoteData.total.toFixed(2)}</span>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><DollarSign className="w-5 h-5" />Payment Details</CardTitle>
                </CardHeader>
                <CardContent>
                {quote.paymentDetails ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <PaymentDetailCard 
                            title="50% Deposit" 
                            paymentInfo={quote.paymentDetails.deposit}
                            onStatusChange={handleStatusChange}
                        />
                        <PaymentDetailCard 
                            title="Final Payment" 
                            paymentInfo={quote.paymentDetails.final}
                            onStatusChange={handleStatusChange}
                        />
                    </div>
                ) : (
                    <div className="text-center py-4 px-2 bg-muted rounded-md text-muted-foreground flex items-center justify-center gap-2">
                         <AlertTriangle className="w-4 h-4"/>
                        <span>No payment information available for this booking.</span>
                    </div>
                )}
                </CardContent>
            </Card>
        </>
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
                                    <span>${item.price.toFixed(2)}</span>
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

    </div>
  );
}
