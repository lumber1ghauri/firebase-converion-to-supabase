'use client';

import { useEffect, useState } from 'react';
import { getAllBookings } from '@/firebase/firestore/bookings';
import type { BookingDocument } from '@/firebase/firestore/bookings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, MoreHorizontal, AlertTriangle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { BookingDetails } from '@/components/booking-details';

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<BookingDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllBookings()
      .then(data => {
        // Sort bookings by creation date, newest first
        const sortedData = data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setBookings(sortedData);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to fetch bookings.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getStatusVariant = (status: BookingDocument['finalQuote']['status']) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'quoted':
      default:
        return 'secondary';
    }
  };

  if (loading) {
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
        <p className="mt-2 text-muted-foreground">{error}</p>
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
            <CardTitle>Bookings</CardTitle>
            <CardDescription>A list of all quotes and confirmed bookings.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden sm:table-cell">Booking ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Booked For</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="hidden sm:table-cell">Created</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map(booking => (
                    <TableRow key={booking.id}>
                      <TableCell className="hidden sm:table-cell font-medium">{booking.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{booking.finalQuote.contact.name}</div>
                        <div className="text-sm text-muted-foreground">{booking.finalQuote.contact.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(booking.finalQuote.status)} className="capitalize">
                          {booking.finalQuote.status}
                        </Badge>
                      </TableCell>
                       <TableCell className="hidden md:table-cell">
                        {format(new Date(booking.finalQuote.booking.days[0].date), 'PPP')}
                      </TableCell>
                       <TableCell className="text-right">
                        ${booking.finalQuote.selectedQuote 
                            ? booking.finalQuote.quotes[booking.finalQuote.selectedQuote].total.toFixed(2)
                            : booking.finalQuote.quotes.lead.total.toFixed(2)
                        }
                      </TableCell>
                       <TableCell className="hidden sm:table-cell">
                        {format(booking.createdAt, 'PPP')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
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
                                <div className="max-h-[70vh] overflow-y-auto p-1 pr-4">
                                    <BookingDetails quote={booking.finalQuote} />
                                </div>
                            </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
             {bookings.length === 0 && (
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
