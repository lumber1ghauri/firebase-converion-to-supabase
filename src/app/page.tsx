import BookingFlow from '@/components/booking-flow';

export default function Home() {

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-8 px-4 md:px-8">
        <h1 className="font-headline text-5xl md:text-6xl font-bold text-primary text-center tracking-wider animate-in fade-in slide-in-from-top-4 duration-1000">Sellaya</h1>
        <p className="text-center text-lg text-muted-foreground mt-2 font-body animate-in fade-in slide-in-from-top-4 duration-1000 delay-200">Your personal makeup artist for every occasion.</p>
      </header>

      <main className="container mx-auto px-4 pb-16">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000 delay-300">
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground">Book Your Session</h2>
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto font-body">
              Select your services, choose your dates, and get an instant quote for a flawless makeup experience.
            </p>
        </div>
        
        <BookingFlow />
      </main>

      <footer className="py-6 text-center text-muted-foreground text-sm font-body">
        <p>&copy; {new Date().getFullYear()} Sellaya.ca. All rights reserved.</p></footer>
    </div>
  );
}
