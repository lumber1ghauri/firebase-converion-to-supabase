import { useActionState, useMemo } from 'react';
import { useFormStatus } from 'react-dom';
import { CheckCircle2, IndianRupee, Loader2 } from "lucide-react";
import type { FinalQuote } from "@/lib/types";
import { confirmBookingAction } from '@/app/actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "./ui/button";
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';


const initialState = {
  status: 'idle',
  message: '',
  quote: null,
  errors: null,
};


export function QuoteConfirmation({ quote }: { quote: FinalQuote }) {
  const [state, formAction] = useActionState(confirmBookingAction, { ...initialState, quote });

  const bookingConfirmed = useMemo(() => state.quote?.status === 'confirmed', [state.quote]);
  const currentQuote = state.quote || quote;

  return (
    <div className="w-full max-w-3xl mx-auto py-8">
      <Card className="shadow-xl border-primary/20 animate-in fade-in-50 duration-500">
        <form action={formAction}>
          <input type="hidden" name="finalQuote" value={JSON.stringify(currentQuote)} />
          <CardHeader className="text-center items-center">
            <CheckCircle2 className="h-16 w-16 text-primary" />
            <CardTitle className="font-headline text-4xl mt-4">
              {bookingConfirmed ? 'Booking Confirmed!' : 'Your Quote is Ready!'}
            </CardTitle>
            <CardDescription className="text-lg max-w-prose">
              {bookingConfirmed 
                ? `Thank you, ${currentQuote.contact.name}. Your booking is confirmed.`
                : `Thank you, ${currentQuote.contact.name}. Your quote is ready. A summary has been sent to ${currentQuote.contact.email}.`
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
          <CardContent className="space-y-6">
            <div className="p-4 border rounded-lg">
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
                        {currentQuote.booking.bridalParty.airbrush && <div className="text-muted-foreground ml-2">- Airbrush Service</div>}
                    </li>
                 )}
              </ul>
              <Separator className="my-3" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{currentQuote.booking.location}</span>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
                <h3 className="font-headline text-xl mb-4">Service Address</h3>
                {bookingConfirmed && currentQuote.booking.address ? (
                    <div className='text-sm space-y-1'>
                        <p className='font-medium'>{currentQuote.booking.address.street}</p>
                        <p className='text-muted-foreground'>{currentQuote.booking.address.city}, {currentQuote.booking.address.province} {currentQuote.booking.address.postalCode}</p>
                    </div>
                ) : (
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
                )}
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-headline text-xl mb-3">Price Breakdown</h3>
              <ul className="space-y-1 text-sm">
                {currentQuote.quote.lineItems.map((item, index) => (
                  <li key={index} className="flex justify-between">
                    <span className={item.description.startsWith('  -') ? 'pl-4 text-muted-foreground' : ''}>{item.description}</span>
                    <span className="font-medium">${item.price.toFixed(2)}</span>
                  </li>
                ))}
                {currentQuote.quote.surcharge && (
                  <>
                    <Separator className="my-2" />
                    <li className="flex justify-between font-medium">
                      <span>{currentQuote.quote.surcharge!.description}</span>
                      <span>${currentQuote.quote.surcharge!.price.toFixed(2)}</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4 bg-primary/10 p-6 rounded-b-lg">
            <div className="w-full flex justify-between items-baseline">
              <span className="text-xl font-bold font-headline">Grand Total</span>
              <span className="text-4xl font-bold text-primary">${currentQuote.quote.total.toFixed(2)}</span>
            </div>
            <SubmitButton disabled={bookingConfirmed} />
          </CardFooter>
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
                    <IndianRupee className="mr-2 h-5 w-5" /> Proceed to Payment (Coming Soon)
                </>
            )}
        </Button>
    )
}
