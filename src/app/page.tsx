'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BookingFlow from '@/components/booking-flow';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [bookingId, setBookingId] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleSearch = () => {
    if (bookingId && bookingId.trim() !== '') {
      router.push(`/book/${bookingId.trim()}/`);
    } else {
      toast({
        variant: 'destructive',
        title: 'Booking ID Required',
        description: 'Please enter a valid Booking ID to search.',
      });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-8 px-4 md:px-8">
        <h1 className="font-headline text-5xl md:text-6xl font-bold text-primary text-center tracking-wider animate-in fade-in slide-in-from-top-4 duration-1000">Looks by Anum</h1>
        <p className="text-center text-lg text-muted-foreground mt-2 font-body animate-in fade-in slide-in-from-top-4 duration-1000 delay-200">Your personal makeup artist for every occasion.</p>
      </header>

      <main className="container mx-auto px-4 pb-16">
        <div className="max-w-2xl mx-auto my-12 animate-in fade-in slide-in-from-top-4 duration-1000 delay-300">
            <div className="text-center mb-6">
                <h2 className="font-headline text-2xl font-bold text-foreground">Find Your Quote</h2>
                <p className="text-md text-muted-foreground mt-1 font-body">
                Already have a quote? Enter your Booking ID to view it.
                </p>
            </div>
            <div className="flex w-full items-center space-x-2">
                <Input
                    type="text"
                    placeholder="Enter Booking ID (e.g., 1234)"
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="h-11 text-base"
                />
                <Button type="button" onClick={handleSearch} className="h-11">
                    <Search className="mr-2 h-4 w-4" />
                    Search
                </Button>
            </div>
        </div>

        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000 delay-400">
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground">Book Your Session</h2>
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto font-body">
              Select your services, choose your dates, and get an instant quote for a flawless makeup experience.
            </p>
        </div>
        
        <BookingFlow />
      </main>

      <footer className="py-6 text-center text-muted-foreground text-sm font-body">
        <p>&copy; {new Date().getFullYear()} Looks by Anum. All rights reserved. Powered by <a href="https://www.instagram.com/sellayadigital" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Sellaya</a>.</p>
        <div className="mt-2">
            <Link href="/admin" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Admin Dashboard
            </Link>
        </div>
      </footer>
    </div>
  );
}
