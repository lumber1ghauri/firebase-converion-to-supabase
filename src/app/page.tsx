import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import BookingFlow from '@/components/booking-flow';
import { Card } from '@/components/ui/card';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-6 px-4 md:px-8">
        <h1 className="font-headline text-4xl font-bold text-primary text-center tracking-wider">GlamBook Pro</h1>
        <p className="text-center text-muted-foreground mt-2 font-body">Your personal makeup artist for every occasion.</p>
      </header>

      <main className="container mx-auto px-4 pb-16">
        <Card className="overflow-hidden mb-8 shadow-lg border-primary/20">
          <div className="relative h-64 md:h-80 w-full">
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                data-ai-hint={heroImage.imageHint}
                fill
                className="object-cover"
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 md:p-8">
              <h2 className="font-headline text-4xl md:text-5xl font-bold text-white shadow-md">Book Your Glam Session</h2>
              <p className="text-lg text-white/90 mt-2 max-w-2xl font-body">
                Select your services, choose your dates, and get an instant quote for a flawless makeup experience.
              </p>
            </div>
          </div>
        </Card>
        
        <BookingFlow />
      </main>

      <footer className="py-6 text-center text-muted-foreground text-sm font-body">
        <p>&copy; {new Date().getFullYear()} GlamBook Pro. All rights reserved.</p></footer>
    </div>
  );
}
