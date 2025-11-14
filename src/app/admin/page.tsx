'use client';

import { useEffect, useState, useMemo } from 'react';
import { useCollection } from '@/firebase';
import type { BookingDocument } from '@/firebase/firestore/bookings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, AlertTriangle, Eye, Search, CalendarClock, User, Users } from 'lucide-react';
import { format, differenceInDays, parse } from 'date-fns';
import { BookingDetails } from '@/components/booking-details';
import { Input } from '@/components/ui/input';
import type { FinalQuote } from '@/lib/types';


function getTimeToEvent(eventDateStr: string): string {
    try {
        const eventDate = parse(eventDateStr, 'PPP', new Date());
        if (isNaN(eventDate.getTime())) {
            return "Invalid date";
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const days = differenceInDays(eventDate, today);

        if (days < 0) {
            return `Passed`;
        }
        if (days === 0) {
            return "Today";
        }
        if (days === 1) {
            return "Tomorrow";
        }
        return `${days} days`;
    } catch (e) {
        return "Invalid date";
    }
}

function getPaymentStatus(booking: BookingDocument): { text: string; variant: 'success' | 'secondary' | 'destructive' } {
    const details = booking.finalQuote.paymentDetails;
    if (booking.finalQuote.status !== 'confirmed') {
        return { text: 'N/A', variant: 'secondary' };
    }
    if (!details) {
        return { text: 'Pending', variant: 'destructive' };
    }
    if (details.deposit.status === 'received' && details.final.status === 'received') {
        return { text: 'Paid', variant: 'success' };
    }
    if (details.deposit.status === 'received') {
        return { text: 'Deposit Paid', variant: 'secondary' };
    }
    return { text: 'Deposit Pending', variant: 'destructive' };
}


export default function AdminDashboard() {
  const { data: bookings, isLoading, error } = useCollection<BookingDocument>('bookings');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<BookingDocument | null>(null);

  const sortedBookings = useMemo(() => {
    if (!bookings) return [];
    return [...bookings].sort((a, b) => {
        // Handle Firestore Timestamps by converting to JS Dates
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
        return dateB.getTime() - dateA.getTime(); // Sort descending (newest first)
    });
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (!searchTerm) return sortedBookings;
    const lowercasedTerm = searchTerm.toLowerCase();
    return sortedBookings.filter(booking => 
        booking.id.toLowerCase().includes(lowercasedTerm) || 
        booking.finalQuote.contact.name.toLowerCase().includes(lowercasedTerm)
    );
  }, [searchTerm, sortedBookings]);


  const getStatusVariant = (status: BookingDocument['finalQuote']['status']) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'cancelled':
        return 'destructive';
      case 'quoted':
      default:
        return 'secondary';
    }
  };
  
  const handleUpdateBooking = (updatedQuote: FinalQuote) => {
       setSelectedBooking(currentBooking => 
          currentBooking && currentBooking.id === updatedQuote.id ? { ...currentBooking, finalQuote: updatedQuote } : currentBooking
      );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-xl font-semibold">An Error Occurred</h2>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
        <p className="mt-2 text-xs text-muted-foreground">Please ensure you have administrative privileges and that Firestore rules are correctly configured.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
        <h1 className="font-headline text-3xl font-bold text-primary tracking-wider">Sellaya</h1>
        <h2 className="text-2xl font-semibold text-foreground mt-1">Admin Dashboard</h2>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <CardTitle>Bookings</CardTitle>
                    <CardDescription>A list of all quotes and confirmed bookings, sorted by newest first.</CardDescription>
                </div>
                 <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by name or ID..."
                        className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Sr. No.</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="hidden md:table-cell">Booking Date</TableHead>
                    <TableHead className="hidden md:table-cell">Event</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking, index) => {
                     const paymentStatus = getPaymentStatus(booking);
                     const artistTier = booking.finalQuote.selectedQuote;
                     return (
                        <TableRow key={booking.id}>
                           <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>
                            <div className="font-medium">{booking.finalQuote.contact.name}</div>
                            <div className="text-sm text-muted-foreground">{booking.id}</div>
                          </TableCell>
                          <TableCell>
                            {artistTier ? (
                                <div className='flex items-center gap-2'>
                                    {artistTier === 'lead' ? <User className="h-4 w-4 text-primary" /> : <Users className="h-4 w-4 text-primary" />}
                                    <span className="capitalize text-sm font-medium">{artistTier}</span>
                                </div>
                            ) : (
                                <span className='text-sm text-muted-foreground'>N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(booking.finalQuote.status)} className="capitalize whitespace-nowrap">
                              {booking.finalQuote.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                               <Badge variant={paymentStatus.variant} className="capitalize whitespace-nowrap">
                                {paymentStatus.text}
                            </Badge>
                          </TableCell>
                           <TableCell className="hidden md:table-cell text-sm">
                             {booking.createdAt?.toDate ? format(booking.createdAt.toDate(), 'PPp') : 'N/A'}
                          </TableCell>
                           <TableCell className="hidden md:table-cell">
                                <div className="flex items-center gap-2">
                                    <CalendarClock className="w-4 h-4 text-muted-foreground"/>
                                    <span>{getTimeToEvent(booking.finalQuote.booking.days[0].date)}</span>
                                </div>
                          </TableCell>
                           <TableCell className="text-right">
                            ${booking.finalQuote.selectedQuote 
                                ? booking.finalQuote.quotes[booking.finalQuote.selectedQuote].total.toFixed(2)
                                : 'N/A'
                            }
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog open={selectedBooking?.id === booking.id} onOpenChange={(isOpen) => setSelectedBooking(isOpen ? booking : null)}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Eye className="h-4 w-4" />
                                        <span className="sr-only">View Details</span>
                                    </Button>
                                </DialogTrigger>
                                 <DialogContent className="sm:max-w-3xl">
                                    <DialogHeader>
                                        <DialogTitle>Booking Details (ID: {booking.id})</DialogTitle>
                                    </DialogHeader>
                                    <div className="max-h-[80vh] overflow-y-auto p-1 pr-4">
                                        {selectedBooking && <BookingDetails quote={selectedBooking.finalQuote} onUpdate={handleUpdateBooking} />}
                                    </div>
                                </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                     )
                  })}
                </TableBody>
              </Table>
            </div>
             {filteredBookings.length === 0 && !isLoading && (
                <div className="py-20 text-center text-muted-foreground">
                    No bookings found.
                </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
