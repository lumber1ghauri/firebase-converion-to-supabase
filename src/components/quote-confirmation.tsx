
'use client';

import * as React from 'react';
import { useMemo, useState } from 'react';
import { CheckCircle2, User, Users, Loader2, MapPin, ShieldCheck, FileText, Banknote, CreditCard, ArrowRight, Upload, LinkIcon, AlertTriangle } from "lucide-react";
import type { FinalQuote, PriceTier, Quote, PaymentMethod, PaymentDetails } from "@/lib/types";
import { useFirestore, useUser } from '@/firebase';
import { saveBookingClient, uploadPaymentScreenshot, type BookingDocument } from '@/firebase/firestore/bookings';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { STUDIO_ADDRESS } from '@/lib/services';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { ContractDisplay } from './contract-display';
import { Checkbox } from './ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { sendAdminScreenshotNotificationAction } from '@/app/admin/actions';
import { loadStripe } from '@stripe/stripe-js';

type ConfirmationStep = 'select-tier' | 'address' | 'sign-contract' | 'payment' | 'confirmed';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

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
        <RadioGroupItem value={tier} id={`tier-${tier}`} className="sr-only" />
        <Card className="shadow-none border-none bg-transparent">
            <CardHeader className="flex-row items-center gap-4 space-y-0">
                {icon}
                <div>
                  <CardTitle className="font-headline text-2xl">{title}</CardTitle>
                </div>
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
                <Separator className="my-2" />
                <ul className="space-y-1 text-sm font-medium">
                    <li className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${quote.subtotal.toFixed(2)}</span>
                    </li>
                    <li className="flex justify-between">
                        <span className="text-muted-foreground">GST (13%)</span>
                        <span>${quote.tax.toFixed(2)}</span>
                    </li>
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

export function QuoteConfirmation({ quote: initialQuote }: { quote: FinalQuote }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user } = useUser();

  const [quote, setQuote] = useState(initialQuote);
  const [currentStep, setCurrentStep] = useState<ConfirmationStep>(() => quote.status === 'confirmed' ? 'confirmed' : 'select-tier');
  const [contractSigned, setContractSigned] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [address, setAddress] = useState({ street: '', city: '', province: 'ON', postalCode: '' });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | undefined>(quote.paymentDetails?.method);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);

  const containsStudioService = useMemo(() => quote.booking.days.some(d => d.serviceType === 'studio'), [quote.booking.days]);
  const containsMobileService = useMemo(() => quote.booking.days.some(d => d.serviceType === 'mobile'), [quote.booking.days]);
  
  const showLeadArtistOption = useMemo(() => true, []);
  const showTeamOption = useMemo(() => containsMobileService, [containsMobileService]);
  
  const [selectedTier, setSelectedTier] = useState<PriceTier | undefined>(() => {
    if (quote.selectedQuote) return quote.selectedQuote;
    if (!showTeamOption && showLeadArtistOption) return 'lead';
    return undefined;
  });
  
  const depositAmount = useMemo(() => {
    if (!selectedTier) return 0;
    return quote.quotes[selectedTier].total * 0.5;
  }, [selectedTier, quote.quotes]);

  const requiresAddress = useMemo(() => quote.booking.hasMobileService && !quote.booking.address, [quote]);
  
  const bookingConfirmed = useMemo(() => quote.status === 'confirmed', [quote.status]);
  
  React.useEffect(() => {
    // If the booking is already confirmed, jump to the last step.
    if (bookingConfirmed && currentStep !== 'confirmed') {
      setCurrentStep('confirmed');
    }
  }, [bookingConfirmed, currentStep]);

  const validateAddress = () => {
    const errors: Record<string, string> = {};
    if (!address.street) errors.street = "Street address is required.";
    if (!address.city) errors.city = "City is required.";
    if (!address.postalCode) errors.postalCode = "Postal code is required.";
    else if (!/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(address.postalCode)) {
        errors.postalCode = "Invalid postal code format.";
    }
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const handleSaveAddress = async () => {
      if (!validateAddress()) {
          toast({ variant: 'destructive', title: 'Invalid Address', description: 'Please correct the errors and try again.' });
          return;
      }
      if (!user || !firestore) {
          toast({ variant: 'destructive', title: 'Error', description: 'User or database not available.' });
          return;
      }
      setIsSaving(true);
      setError(null);
      
      const updatedQuote: FinalQuote = { ...quote, booking: { ...quote.booking, address } };
      
      const bookingDoc: Partial<BookingDocument> = {
          id: updatedQuote.id,
          uid: user.uid,
          finalQuote: updatedQuote,
          createdAt: quote.createdAt,
      };

      try {
          await saveBookingClient(firestore, bookingDoc as BookingDocument);
          setQuote(updatedQuote);
          setCurrentStep('sign-contract');
      } catch (err: any) {
          setError(err.message || "Failed to save address. Please check your connection or permissions.");
          toast({ variant: 'destructive', title: 'Save Failed', description: err.message });
      } finally {
          setIsSaving(false);
      }
  };

  const handleFinalizeBooking = async () => {
    if (!selectedTier || !paymentMethod) {
        toast({ variant: 'destructive', title: 'Missing Information', description: 'Please select an artist tier and payment method.' });
        return;
    }
    if (paymentMethod === 'interac' && !screenshotFile) {
        toast({ variant: 'destructive', title: 'Screenshot Required', description: 'Please upload a payment screenshot for Interac transfers.' });
        return;
    }
    if (!user || !firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'User or database not available.' });
        return;
    }

    setIsSaving(true);
    setError(null);

    try {
        if (paymentMethod === 'stripe') {
            const res = await fetch('/api/stripe/create-checkout-session/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: quote.id, tier: selectedTier }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                try {
                    const { error } = JSON.parse(errorText);
                    throw new Error(error || 'Failed to create Stripe session.');
                } catch (e) {
                    throw new Error('Failed to create Stripe session. The server returned an invalid error format.');
                }
            }

            const { sessionId } = await res.json();
            const stripe = await stripePromise;
            if (stripe) {
                const { error } = await stripe.redirectToCheckout({ sessionId });
                if (error) {
                    throw new Error(error.message);
                }
            }
            return;
        }

        let screenshotUrl = '';
        if (paymentMethod === 'interac' && screenshotFile) {
            screenshotUrl = await uploadPaymentScreenshot(screenshotFile, quote.id, user.uid);
        }

        const paymentDetails: PaymentDetails = {
            method: paymentMethod,
            status: 'deposit-pending',
            depositAmount: depositAmount,
            screenshotUrl: screenshotUrl,
        };

        const updatedQuote: FinalQuote = {
            ...quote,
            selectedQuote: selectedTier,
            paymentDetails: paymentDetails,
        };
        
        const bookingDoc: BookingDocument = {
            id: updatedQuote.id,
            uid: user.uid,
            finalQuote: updatedQuote,
            createdAt: quote.createdAt || new Date()
        };

        await saveBookingClient(firestore, bookingDoc);
        await sendAdminScreenshotNotificationAction(updatedQuote.id);

        setQuote(updatedQuote);
        toast({
            title: 'Booking Submitted!',
            description: 'Your booking is pending approval. You will receive a final confirmation email once your payment is verified.',
        });
        setCurrentStep('confirmed');

    } catch (err: any) {
        console.error("Failed to finalize booking:", err);
        setError(err.message || 'Failed to finalize booking. Please check your connection or permissions.');
        toast({ variant: 'destructive', title: 'Finalization Failed', description: err.message });
    } finally {
        setIsSaving(false);
    }
};

  const handleProceed = () => {
    if (currentStep === 'select-tier') {
      if (requiresAddress) {
        setCurrentStep('address');
      } else {
        setCurrentStep('sign-contract');
      }
    } else if (currentStep === 'address') {
        handleSaveAddress();
    } else if (currentStep === 'sign-contract') {
        setCurrentStep('payment');
    }
  };

  const STEPS = [
    { id: 'select-tier', name: 'Select Tier', icon: Users },
    ...(requiresAddress ? [{ id: 'address', name: 'Address', icon: MapPin }] : []),
    { id: 'sign-contract', name: 'Sign Contract', icon: FileText },
    { id: 'payment', name: 'Payment', icon: Banknote }
  ];

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  const getFooterButton = () => {
      if (currentStep === 'confirmed') return null;

      let text = 'Proceed';
      let action: () => void = handleProceed;
      let disabled = false;
      let icon = <ArrowRight className="ml-2 h-5 w-5" />;

      switch(currentStep) {
          case 'select-tier':
              text = 'Proceed';
              disabled = !selectedTier;
              break;
          case 'address':
              text = 'Save Address & Proceed';
              action = handleSaveAddress;
              disabled = isSaving;
              break;
          case 'sign-contract':
              text = 'Proceed to Payment';
              disabled = !contractSigned;
              break;
          case 'payment':
              text = paymentMethod === 'stripe' ? `Pay $${depositAmount.toFixed(2)} with Card` : 'Submit for Approval';
              action = handleFinalizeBooking;
              disabled = isSaving || !paymentMethod || (paymentMethod === 'interac' && !screenshotFile);
              icon = paymentMethod === 'stripe' ? <CreditCard className="ml-2 h-5 w-5" /> : <ShieldCheck className="ml-2 h-5 w-5" />;
              break;
      }
      
      return (
          <Button type="button" size="lg" className="w-full font-bold text-lg" disabled={disabled || isSaving} onClick={action}>
              {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              {text}
              {!isSaving && icon}
          </Button>
      );
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-8 sm:py-12">
      <Card className="shadow-2xl border-primary/20 animate-in fade-in zoom-in-95 duration-500">
        <CardHeader className="text-center items-center p-6 sm:p-8">
          {bookingConfirmed ? (
              <ShieldCheck className="h-16 w-16 text-green-500 animate-in fade-in zoom-in-50 duration-700 delay-200" />
          ) : (
              <CheckCircle2 className="h-16 w-16 text-primary animate-in fade-in zoom-in-50 duration-700 delay-200" />
          )}
          <CardTitle className="font-headline text-3xl sm:text-4xl mt-4">
            {bookingConfirmed ? 'Booking Confirmed!' : 'Your Quote is Ready!'}
          </CardTitle>
          <CardDescription className="text-base sm:text-lg max-w-prose">
            {bookingConfirmed 
              ? quote.paymentDetails?.method === 'interac'
                  ? `Thank you, ${quote.contact.name}. Your booking is submitted and awaits payment approval. You will receive a final confirmation email once your e-Transfer is verified.`
                  : `Thank you, ${quote.contact.name}. Your booking with ${quote.selectedQuote === 'lead' ? 'Anum - Lead Artist' : 'the Team'} is confirmed. A confirmation email will be sent to you shortly.`
              : `Thank you, ${quote.contact.name}. Please review your quotes and follow the steps below to confirm your booking.`
            }
          </CardDescription>
            {error && (
              <Alert variant="destructive" className="mt-4 text-left">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>An Error Occurred</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
              </Alert>
          )}
        </CardHeader>
        <CardContent className="space-y-6 px-4 sm:px-6">

          {!bookingConfirmed && (
            <div className="flex justify-center items-center gap-2 sm:gap-6 my-4">
              {STEPS.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      index < currentStepIndex ? "bg-primary text-primary-foreground" :
                      index === currentStepIndex ? "bg-primary border-2 border-primary-foreground ring-2 ring-primary text-primary-foreground" :
                      "bg-muted text-muted-foreground"
                    )}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className={cn(
                      "text-xs sm:text-sm font-medium",
                      index <= currentStepIndex ? "text-primary" : "text-muted-foreground"
                    )}>{step.name}</span>
                  </div>
                  {index < STEPS.length - 1 && <div className="flex-1 h-px bg-border max-w-8 sm:max-w-16" />}
                </React.Fragment>
              ))}
            </div>
          )}

          <div className={cn(currentStep !== 'select-tier' && 'hidden')}>
              <RadioGroup 
                  value={selectedTier} 
                  onValueChange={(val) => setSelectedTier(val as PriceTier)} 
                  className={cn("grid grid-cols-1 gap-6 p-4", showLeadArtistOption && showTeamOption ? "md:grid-cols-2" : "max-w-md mx-auto")}
              >
                  {showLeadArtistOption && (
                      <QuoteTierCard 
                      title="Anum - Lead Artist"
                      icon={<User className="w-8 h-8 text-primary" />}
                      quote={quote.quotes.lead}
                      tier="lead"
                      selectedTier={selectedTier}
                      onSelect={setSelectedTier}
                      />
                  )}
                  {showTeamOption && (
                      <QuoteTierCard 
                      title="Team"
                      icon={<Users className="w-8 h-8 text-primary" />}
                      quote={quote.quotes.team}
                      tier="team"
                      selectedTier={selectedTier}
                      onSelect={setSelectedTier}
                      />
                  )}
              </RadioGroup>
          </div>
          
          <div className={cn(currentStep !== 'address' && 'hidden')}>
            <div className="space-y-6 px-6">
              <div className="p-4 border rounded-lg bg-background/50">
                  <h3 className="font-headline text-xl mb-4">Mobile Service Address</h3>
                  <div className='space-y-4'>
                          {addressErrors && Object.keys(addressErrors).length > 0 && (
                              <Alert variant="destructive">
                                  <AlertDescription>Please correct the address errors.</AlertDescription>
                              </Alert>
                          )}
                          <div>
                              <Label htmlFor="street">Street Address</Label>
                              <Input id="street" name="street" placeholder="123 Glamour Ave" required value={address.street} onChange={e => setAddress({...address, street: e.target.value})} />
                              {addressErrors?.street && <p className="text-sm text-destructive mt-1">{addressErrors.street}</p>}
                          </div>
                          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                              <div>
                                  <Label htmlFor="city">City</Label>
                                  <Input id="city" name="city" placeholder="Toronto" required value={address.city} onChange={e => setAddress({...address, city: e.target.value})} />
                                  {addressErrors?.city && <p className="text-sm text-destructive mt-1">{addressErrors.city}</p>}
                              </div>
                              <div>
                                  <Label htmlFor="province">Province</Label>
                                  <Input id="province" name="province" value="ON" readOnly required />
                              </div>
                              <div>
                                  <Label htmlFor="postalCode">Postal Code</Label>
                                  <Input id="postalCode" name="postalCode" placeholder="M5V 2T6" required value={address.postalCode} onChange={e => setAddress({...address, postalCode: e.target.value})} />
                                  {addressErrors?.postalCode && <p className="text-sm text-destructive mt-1">{addressErrors.postalCode}</p>}
                              </div>
                          </div>
                      </div>
              </div>
            </div>
          </div>

          <div className={cn('space-y-6 px-6', currentStep !== 'sign-contract' && 'hidden')}>
            <h3 className="font-headline text-2xl text-center">Service Agreement</h3>
            {selectedTier && <ContractDisplay quote={quote} selectedTier={selectedTier} />}
            <div className="flex items-center space-x-2 p-4 bg-muted rounded-md">
              <Checkbox id="terms" onCheckedChange={(checked) => setContractSigned(Boolean(checked))} />
              <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I have read, understood, and agreed to the terms and conditions of this service agreement.
              </Label>
            </div>
          </div>
          
           <div className={cn('space-y-6 px-6', currentStep !== 'payment' && 'hidden')}>
              <div className="text-center">
                  <h3 className="font-headline text-2xl">Secure Your Booking</h3>
                  <p className="text-muted-foreground">A 50% non-refundable deposit is required to finalize your booking.</p>
                  <p className="text-4xl font-bold text-primary mt-2">${depositAmount.toFixed(2)}</p>
              </div>

              <RadioGroup value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as PaymentMethod)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Label htmlFor='payment-stripe' className={cn('block border rounded-lg p-6 cursor-pointer', paymentMethod === 'stripe' ? 'border-primary ring-2 ring-primary' : 'hover:border-primary/50')}>
                      <div className='flex items-center gap-4'>
                           <RadioGroupItem value="stripe" id="payment-stripe" />
                           <h4 className="font-headline text-xl">Pay with Card</h4>
                           <CreditCard className='ml-auto w-8 h-8 text-muted-foreground'/>
                      </div>
                      <p className="text-sm text-muted-foreground mt-4">Securely pay the deposit with your credit card via Stripe.</p>
                  </Label>
                  <Label htmlFor='payment-interac' className={cn('block border rounded-lg p-6 cursor-pointer', paymentMethod === 'interac' ? 'border-primary ring-2 ring-primary' : 'hover:border-primary/50')}>
                       <div className='flex items-center gap-4'>
                          <RadioGroupItem value="interac" id="payment-interac" />
                          <h4 className="font-headline text-xl">Interac e-Transfer</h4>
                          <Banknote className='ml-auto w-8 h-8 text-muted-foreground'/>
                      </div>
                      <p className="text-sm text-muted-foreground mt-4">Send an e-Transfer and upload a screenshot for verification.</p>
                  </Label>
              </RadioGroup>

              {paymentMethod === 'interac' && (
                  <div className="p-4 border rounded-lg bg-background/50 space-y-4 animate-in fade-in-0">
                      <h4 className="font-semibold">e-Transfer Instructions</h4>
                      <ol className="list-decimal list-inside text-sm space-y-2 text-muted-foreground">
                          <li>Send <strong>${depositAmount.toFixed(2)}</strong> to <strong>booking@sellaya.ca</strong></li>
                          <li>Set the security question to: <strong>What is my booking ID?</strong></li>
                          <li>Set the security answer to: <strong>{quote.id}</strong> (This is case-sensitive)</li>
                          <li>Once sent, take a screenshot of the confirmation page.</li>
                          <li>Upload the screenshot below and submit.</li>
                      </ol>
                      <div>
                          <Label htmlFor="screenshot">Upload Screenshot</Label>
                          <Input id="screenshot" type="file" accept="image/png, image/jpeg, image/jpg" onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)} />
                          {screenshotFile && <p className='text-sm text-muted-foreground mt-2'>File selected: {screenshotFile.name}</p>}
                      </div>
                  </div>
              )}
          </div>


          {bookingConfirmed && (
            <div className="p-6">
                <div className="p-6 border rounded-lg bg-background/50 max-w-md mx-auto">
                    <h3 className="font-headline text-2xl text-center mb-4">Payment Summary</h3>
                    {quote.selectedQuote && quote.paymentDetails && (
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Total Booking Cost:</span>
                                <span className="font-medium">${quote.quotes[quote.selectedQuote].total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-green-600">
                                <span className="text-muted-foreground">50% Deposit Paid:</span>
                                <span className="font-bold text-green-600">${quote.paymentDetails.depositAmount.toFixed(2)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center font-bold text-lg">
                                <span>Remaining Balance:</span>
                                <span>${(quote.quotes[quote.selectedQuote].total - quote.paymentDetails.depositAmount).toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground text-center pt-2">
                                The remaining balance is due on or before the day of your first service.
                            </p>
                        </div>
                    )}

                    {quote.booking.address && (
                        <div className="mt-6 pt-4 border-t">
                            <h4 className="font-headline text-lg mb-2 text-center">Service Address</h4>
                            <div className='text-sm space-y-1 text-muted-foreground text-center'>
                                <p>{quote.booking.address.street}</p>
                                <p>{quote.booking.address.city}, {quote.booking.address.province} {quote.booking.address.postalCode}</p>
                            </div>
                        </div>
                    )}
                    {containsStudioService && !quote.booking.address && (
                         <div className="mt-6 pt-4 border-t">
                            <h4 className="font-headline text-lg mb-2 text-center">Studio Address</h4>
                            <a href={STUDIO_ADDRESS.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm space-y-1 group text-center block">
                                <p className='font-medium text-foreground group-hover:text-primary transition-colors'>{STUDIO_ADDRESS.street}</p>
                                <p className='text-muted-foreground'>{STUDIO_ADDRESS.city}, {STUDIO_ADDRESS.province} {STUDIO_ADDRESS.postalCode}</p>
                            </a>
                        </div>
                    )}
                </div>
            </div>
          )}
        </CardContent>

        {!bookingConfirmed && (
          <CardFooter className="flex-col gap-4 bg-secondary/50 p-6 rounded-b-lg">
              {getFooterButton()}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
