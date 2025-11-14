'use client';

import { useActionState, useMemo, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { CheckCircle2, User, Users, Loader2, MapPin } from "lucide-react";
import type { FinalQuote, PriceTier, Quote } from "@/lib/types";
import { confirmBookingAction } from '@/app/actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { STUDIO_ADDRESS } from '@/lib/services';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { cn } from '@/lib/utils';


const initialState = {
  status: 'idle',
  message: '',
  quote: null,
  errors: null,
};

function QuoteTierCard({ title, icon, quote, tier, selectedTier, onSelect }: { 
  title: string; 
  icon: React.ReactNode;
  quote: Quote;
  tier: PriceTier;
  selectedTier: PriceTier | undefined;
  onSelect: (tier: PriceTier) => void;
}) {
  const isSelected = selectedTier === tier;
  return (
    <Label htmlFor={`tier-${tier}`} className={cn(
      "block border rounded-lg cursor-pointer transition-all",
      isSelected ? "border-primary ring-2 ring-primary shadow-lg" : "border-border hover:border-primary/50"
    )}>
        <Card className="shadow-none border-none">
            <CardHeader className="flex-row items-center gap-4 space-y-0">
                {icon}
                <div>
                  <CardTitle className="font-headline text-2xl">{title}</CardTitle>
                </div>
                <RadioGroupItem value={tier} id={`tier-${tier}`} className="ml-auto w-6 h-6" />
            </CardHeader>
            <CardContent>
                <ul className="space-y-1 text-sm">
                    {quote.lineItems.map((item, index) => (
                    <li key={index} className="flex justify-between">
                        <span className={item.description.startsWith('  -') || item.description.startsWith('Party:') ? 'pl-4 text-muted-foreground' : ''}>{item.description}</span>
                        <span className="font-medium">${item.price.toFixed(2)}</span>
                    </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter className="bg-secondary/30 p-4 rounded-b-lg">
                <div className="w-full flex justify-between items-baseline">
                <span className="text-lg font-bold font-headline">Total</span>
                <span className="text-2xl font-bold text-primary">${quote.total.toFixed(2)}</span>
                </div>
            </CardFooter>
        </Card>
    </Label>
  )
}

export function QuoteConfirmation({ quote }: { quote: FinalQuote }) {
  const [state, formAction] = useActionState(confirmBookingAction, { ...initialState, quote });

  const currentQuote = state.quote || quote;
  const bookingConfirmed = useMemo(() => state.quote?.status === 'confirmed', [state.quote]);
  const requiresAddress = useMemo(() => currentQuote.booking.hasMobileService && !currentQuote.booking.address, [currentQuote]);

  const showLeadArtistOption = useMemo(() => currentQuote.booking.days.some(d => d.serviceType === 'studio'), [currentQuote.booking.days]);
  
  const [selectedTier, setSelectedTier] = useState<PriceTier | undefined>(
      quote.selectedQuote || (showLeadArtistOption ? 'lead' : 'team')
  );


  return (
    <div className="w-full max-w-5xl mx-auto py-8 sm:py-12">
      <Card className="shadow-2xl border-primary/20 animate-in fade-in zoom-in-95 duration-500">
        <form action={formAction}>
          <input type="hidden" name="finalQuote" value={JSON.stringify(currentQuote)} />
          <input type="hidden" name="selectedQuote" value={selectedTier} />

          <CardHeader className="text-center items-center p-6 sm:p-8">
            <CheckCircle2 className="h-16 w-16 text-primary animate-in fade-in zoom-in-50 duration-700 delay-200" />
            <CardTitle className="font-headline text-3xl sm:text-4xl mt-4">
              {bookingConfirmed ? 'Booking Confirmed!' : 'Your Quote is Ready!'}
            </CardTitle>
            <CardDescription className="text-base sm:text-lg max-w-prose">
              {bookingConfirmed 
                ? `Thank you, ${currentQuote.contact.name}. Your booking with ${currentQuote.selectedQuote === 'lead' ? 'Anum - Lead Artist' : 'the Team'} is confirmed.`
                : `Thank you, ${currentQuote.contact.name}. Please review your quotes below. A summary has been sent to ${currentQuote.contact.email}.`
              }
            </CardDescription>
             {state.message && state.message.startsWith('Booking Confirmed!') && (
                <Alert className="mt-4 text-left">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Confirmation Sent</AlertTitle>
                    <AlertDescription>{state.message}</AlertDescription>
                </Alert>
            )}
          </CardHeader>
          <CardContent className="space-y-6 px-4 sm:px-6">
            <div className="p-4 border rounded-lg bg-background/50">
              <h3 className="font-headline text-xl mb-3">Booking Summary</h3>
               <p className="text-sm text-muted-foreground mb-3">Booking ID: {currentQuote.id}</p>
              <ul className="space-y-3">
                {currentQuote.booking.days.map((day, index) => (
                  <li key={index} className="text-sm">
                    <div className="flex justify-between font-medium">
                      <span>{day.date} at {day.getReadyTime}</span>
                      <span>{day.serviceName}</span>
                    </div>
                    <div className="text-muted-foreground ml-2">- {day.serviceOption}</div>
                     <div className="text-muted-foreground ml-2">- {day.location}</div>
                    {day.addOns.length > 0 && day.addOns.map((addon, i) => (
                      <div key={i} className="text-muted-foreground ml-2">- {addon}</div>
                    ))}
                  </li>
                ))}
                {currentQuote.booking.trial && (
                  <li className="text-sm">
                    <div className="flex justify-between font-medium">
                      <span>Bridal Trial: {currentQuote.booking.trial!.date} at {currentQuote.booking.trial!.time}</span>
                    </div>
                  </li>
                )}
                 {currentQuote.booking.bridalParty && currentQuote.booking.bridalParty.services.length > 0 && (
                    <li className="text-sm">
                        <div className="font-medium pt-2">Bridal Party Services:</div>
                        {currentQuote.booking.bridalParty.services.map((partySvc, i) => (
                             <div key={i} className="text-muted-foreground ml-2">- {partySvc.service} (x{partySvc.quantity})</div>
                        ))}
                        {currentQuote.booking.bridalParty.airbrush > 0 && <div className="text-muted-foreground ml-2">- Airbrush Service (x{currentQuote.booking.bridalParty.airbrush})</div>}
                    </li>
                 )}
              </ul>
            </div>

            {currentQuote.booking.days.some(d => d.serviceType === 'studio') && !bookingConfirmed && (
                <div className="p-4 border rounded-lg bg-background/50">
                    <h3 className="font-headline text-xl mb-4">Studio Address</h3>
                    <a href={STUDIO_ADDRESS.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm space-y-1 group hover:bg-accent p-2 rounded-md transition-colors inline-block">
                        <p className='font-medium group-hover:text-primary transition-colors'>{STUDIO_ADDRESS.street}</p>
                        <p className='text-muted-foreground'>{STUDIO_ADDRESS.city}, {STUDIO_ADDRESS.province} {STUDIO_ADDRESS.postalCode}</p>
                        <div className='flex items-center gap-2 pt-1'>
                            <MapPin className='w-4 h-4 text-primary'/>
                            <span className='text-primary font-medium'>View on Google Maps</span>
                        </div>
                    </a>
                </div>
            )}
            
            {requiresAddress && !bookingConfirmed && (
                <div className="p-4 border rounded-lg bg-background/so">
                    <h3 className="font-headline text-xl mb-4">Mobile Service Address</h3>
                    <div className='space-y-4'>
                            {state.status !== 'idle' && state.errors && (
                                <Alert variant="destructive">
                                    <AlertDescription>{state.message || "Please correct the errors below."}</AlertDescription>
                                </Alert>
                            )}
                            <div>
                                <Label htmlFor="street">Street Address</Label>
                                <Input id="street" name="street" placeholder="123 Glamour Ave" required />
                                {state.errors?.street && <p className="text-sm text-destructive mt-1">{state.errors.street[0]}</p>}
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                <div>
                                    <Label htmlFor="city">City</Label>
                                    <Input id="city" name="city" placeholder="Toronto" required />
                                    {state.errors?.city && <p className="text-sm text-destructive mt-1">{state.errors.city[0]}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="province">Province</Label>
                                    <Input id="province" name="province" value="ON" readOnly required />
                                    {state.errors?.province && <p className="text-sm text-destructive mt-1">{state.errors.province[0]}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="postalCode">Postal Code</Label>
                                    <Input id="postalCode" name="postalCode" placeholder="M5V 2T6" required />
                                    {state.errors?.postalCode && <p className="text-sm text-destructive mt-1">{state.errors.postalCode[0]}</p>}
                                </div>
                            </div>
                        </div>
                </div>
            )}
            
            {bookingConfirmed && (
              <div className="p-6 border rounded-lg bg-background/50">
                <h3 className="font-headline text-2xl text-center mb-4">Your Confirmed Package</h3>
                <Card className="max-w-md mx-auto">
                   <CardHeader>
                      <CardTitle className='text-center'>{currentQuote.selectedQuote === 'lead' ? 'Anum - Lead Artist' : 'Team'}</CardTitle>
                   </CardHeader>
                   <CardContent>
                      <ul className="space-y-1 text-sm">
                        {(currentQuote.selectedQuote ? currentQuote.quotes[currentQuote.selectedQuote] : currentQuote.quotes.lead).lineItems.map((item, index) => (
                          <li key={index} className="flex justify-between">
                            <span className={item.description.startsWith('  -') ? 'pl-4 text-muted-foreground' : ''}>{item.description}</span>
                            <span className="font-medium">${item.price.toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                   </CardContent>
                   <CardFooter className="bg-secondary/30 p-4 rounded-b-lg">
                      <div className="w-full flex justify-between items-baseline">
                        <span className="text-lg font-bold font-headline">Total</span>
                        <span className="text-2xl font-bold text-primary">${(currentQuote.selectedQuote ? currentQuote.quotes[currentQuote.selectedQuote] : currentQuote.quotes.lead).total.toFixed(2)}</span>
                      </div>
                   </CardFooter>
                </Card>
                 {currentQuote.booking.address && (
                     <div className="mt-6 text-center">
                        <h4 className="font-headline text-lg mb-2">Service Address</h4>
                        <div className='text-sm space-y-1 text-muted-foreground'>
                            <p>{currentQuote.booking.address.street}</p>
                            <p>{currentQuote.booking.address.city}, {currentQuote.booking.address.province} {currentQuote.booking.address.postalCode}</p>
                        </div>
                    </div>
                )}
                 {currentQuote.booking.days.some(d => d.serviceType === 'studio') && (
                     <div className="mt-6 text-center">
                        <h4 className="font-headline text-lg mb-2">Studio Address</h4>
                         <a href={STUDIO_ADDRESS.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm space-y-1 group">
                            <p className='font-medium text-foreground group-hover:text-primary transition-colors'>{STUDIO_ADDRESS.street}</p>
                            <p className='text-muted-foreground'>{STUDIO_ADDRESS.city}, {STUDIO_ADDRESS.province} {STUDIO_ADDRESS.postalCode}</p>
                        </a>
                    </div>
                 )}
              </div>
            )}


            {!bookingConfirmed && (
                <div className="p-4">
                    <h3 className="font-headline text-2xl text-center mb-4">Please Select Your Artist Tier</h3>
                     <RadioGroup 
                        value={selectedTier} 
                        onValueChange={(val) => setSelectedTier(val as PriceTier)} 
                        className={cn("grid grid-cols-1 gap-6", showLeadArtistOption && "md:grid-cols-2")}
                    >
                        {showLeadArtistOption && (
                            <QuoteTierCard 
                            title="Anum - Lead Artist"
                            icon={<User className="w-8 h-8 text-primary" />}
                            quote={currentQuote.quotes.lead}
                            tier="lead"
                            selectedTier={selectedTier}
                            onSelect={setSelectedTier}
                            />
                        )}
                        <QuoteTierCard 
                          title="Team"
                          icon={<Users className="w-8 h-8 text-primary" />}
                          quote={currentQuote.quotes.team}
                          tier="team"
                          selectedTier={selectedTier}
                          onSelect={setSelectedTier}
                        />
                    </RadioGroup>
                </div>
            )}
          </CardContent>
          {!bookingConfirmed && (
            <CardFooter className="flex-col gap-4 bg-secondary/50 p-6 rounded-b-lg">
                <SubmitButton disabled={bookingConfirmed || !selectedTier} />
            </CardFooter>
          )}
        </form>
      </Card>
    </div>
  );
}


function SubmitButton({ disabled }: { disabled: boolean }) {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" size="lg" className="w-full font-bold text-lg" disabled={disabled || pending}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Confirming...
                </>
            ) : (
                <>
                   Confirm Booking & Proceed to Payment
                </>
            )}
        </Button>
    )
}
