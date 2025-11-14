'use client';

import * as React from 'react';
import { useMemo, useState } from 'react';
import { CheckCircle2, User, Users, Loader2, MapPin, ShieldCheck, FileText, Banknote, CreditCard, ArrowRight, Upload, LinkIcon, AlertTriangle } from "lucide-react";
import type { FinalQuote, PriceTier, Quote } from "@/lib/types";
import { useFirestore, useUser } from '@/firebase';
import { saveBooking, uploadPaymentScreenshot } from '@/firebase/firestore/bookings';
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


type ConfirmationStep = 'select-tier' | 'address' | 'sign-contract' | 'payment' | 'confirmed';

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
  const [currentStep, setCurrentStep] = useState<ConfirmationStep>('select-tier');
  const [contractSigned, setContractSigned] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [address, setAddress] = useState({ street: '', city: '', province: 'ON', postalCode: '' });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);


  const containsStudioService = useMemo(() => quote.booking.days.some(d => d.serviceType === 'studio'), [quote.booking.days]);
  const containsMobileService = useMemo(() => quote.booking.days.some(d => d.serviceType === 'mobile'), [quote.booking.days]);
  
  const showLeadArtistOption = useMemo(() => true, []);
  const showTeamOption = useMemo(() => containsMobileService, [containsMobileService]);
  
  const [selectedTier, setSelectedTier] = useState<PriceTier | undefined>(() => {
    if (!showTeamOption && showLeadArtistOption) return 'lead';
    return quote.selectedQuote;
  });

  const finalPrice = selectedTier ? quote.quotes[selectedTier].total : 0;
  const depositAmount = finalPrice * 0.5;

  const requiresAddress = useMemo(() => quote.booking.hasMobileService && !quote.booking.address, [quote]);
  
  const bookingConfirmed = useMemo(() => quote.status === 'confirmed', [quote.status]);
  
  React.useEffect(() => {
    if (bookingConfirmed && currentStep !== 'confirmed') {
      setCurrentStep('confirmed');
    }
  }, [bookingConfirmed, currentStep]);

  const validateAddress = () => {
    const errors: Record<string, string> = {};
    if (!address.street) errors.street = "Street address is required.";
    if (!address.city) errors.city = "City is required.";
    if (!address.postalCode) errors.postalCode = "Postal code is required.";
    // Basic postal code regex
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
      try {
          await saveBooking(firestore, { id: updatedQuote.id, uid: user.uid, finalQuote: updatedQuote, contact: updatedQuote.contact, phone: updatedQuote.contact.phone });
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
      if (!selectedTier) {
          toast({ variant: 'destructive', title: 'Tier not selected', description: 'Please select an artist tier.'});
          return;
      }
      if (!user || !firestore) {
          toast({ variant: 'destructive', title: 'Error', description: 'User or database not available.' });
          return;
      }
      if (!paymentScreenshot) {
          toast({ variant: 'destructive', title: 'Screenshot Required', description: 'Please upload a screenshot of your payment.' });
          return;
      }

      setIsSaving(true);
      setError(null);

      try {
          const screenshotUrl = await uploadPaymentScreenshot(paymentScreenshot, quote.id, user.uid);

          const total = quote.quotes[selectedTier].total;
          const depositAmount = total * 0.5;
          
          const updatedQuote: FinalQuote = {
              ...quote,
              selectedQuote: selectedTier,
              status: 'confirmed',
              paymentDetails: {
                  deposit: { status: 'pending', amount: depositAmount, screenshotUrl },
                  final: { status: 'pending', amount: total - depositAmount },
              }
          };

          await saveBooking(firestore, { id: updatedQuote.id, uid: user.uid, finalQuote: updatedQuote, contact: updatedQuote.contact, phone: updatedQuote.contact.phone });

          setQuote(updatedQuote);
          setCurrentStep('confirmed');
          toast({ title: 'Booking Submitted!', description: 'Your booking is pending approval. You will receive a confirmation email once the payment is verified.' });

      } catch (err: any) {
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
    } else if (currentStep === 'sign-contract') {
        setCurrentStep('payment');
    }
  };

  const STEPS = [
    { id: 'select-tier', name: 'Select Tier' },
    ...(requiresAddress ? [{ id: 'address', name: 'Address' }] : []),
    { id: 'sign-contract', name: 'Sign Contract' },
    { id: 'payment', name: 'Payment' },
  ].map(step => ({ ...step, icon: step.id === 'address' ? MapPin : step.id === 'sign-contract' ? FileText : step.id === 'payment' ? Banknote : Users }));


  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

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
            {bookingConfirmed ? 'Booking Submitted for Approval!' : 'Your Quote is Ready!'}
          </CardTitle>
          <CardDescription className="text-base sm:text-lg max-w-prose">
            {bookingConfirmed 
              ? `Thank you, ${quote.contact.name}. Your booking with ${quote.selectedQuote === 'lead' ? 'Anum - Lead Artist' : 'the Team'} is now pending. You will receive a final confirmation email as soon as we approve your payment.`
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

          {/* Step Indicator */}
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
            <div className="p-4 border rounded-lg bg-background/50">
                  <h3 className="font-headline text-xl mb-3">Booking Summary</h3>
                  <p className="text-sm text-muted-foreground mb-3">Booking ID: {quote.id}</p>
                  <ul className="space-y-3">
                      {quote.booking.days.map((day, index) => (
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
                      {quote.booking.trial && (
                      <li className="text-sm">
                          <div className="flex justify-between font-medium">
                          <span>Bridal Trial: {quote.booking.trial!.date} at {quote.booking.trial!.time}</span>
                          </div>
                      </li>
                      )}
                      {quote.booking.bridalParty && quote.booking.bridalParty.services.length > 0 && (
                          <li className="text-sm">
                              <div className="font-medium pt-2">Bridal Party Services:</div>
                              {quote.booking.bridalParty.services.map((partySvc, i) => (
                                  <div key={i} className="text-muted-foreground ml-2">- {partySvc.service} (x{partySvc.quantity})</div>
                              ))}
                              {quote.booking.bridalParty.airbrush > 0 && <div className="text-muted-foreground ml-2">- Airbrush Service (x{quote.booking.bridalParty.airbrush})</div>}
                          </li>
                      )}
                  </ul>
              </div>

              {containsStudioService && (
                  <div className="mt-6 p-4 border rounded-lg bg-background/50">
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
              
              <div className="p-4 mt-6">
                   <h3 className={cn("font-headline text-2xl text-center mb-4", !showLeadArtistOption || !showTeamOption ? "hidden" : "")}>Select Your Artist Tier</h3>
                   <RadioGroup 
                      value={selectedTier} 
                      onValueChange={(val) => setSelectedTier(val as PriceTier)} 
                      className={cn("grid grid-cols-1 gap-6", showLeadArtistOption && showTeamOption ? "md:grid-cols-2" : "max-w-md mx-auto")}
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
          </div>
          
          <div className={cn(currentStep !== 'address' && 'hidden')}>
            <div className="space-y-6 px-6">
              <div className="p-4 border rounded-lg bg-background/so">
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
               <CardFooter className="flex-col gap-4 bg-secondary/50 p-6 rounded-b-lg mt-6">
                  <Button type="button" size="lg" className="w-full font-bold text-lg" disabled={isSaving} onClick={handleSaveAddress}>
                      {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ArrowRight className="ml-2 h-5 w-5" />}
                      Save Address & Proceed
                  </Button>
               </CardFooter>
            </div>
          </div>

           {/* Step 2: Contract */}
          <div className={cn('space-y-6 px-6', currentStep !== 'sign-contract' && 'hidden')}>
            <h3 className="font-headline text-2xl text-center">Service Agreement</h3>
            {selectedTier && <ContractDisplay quote={quote} selectedTier={selectedTier} />}
            <div className="flex items-center space-x-2 p-4 bg-muted rounded-md">
              <Checkbox id="terms" onCheckedChange={(checked) => setContractSigned(Boolean(checked))} />
              <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I have read, understood, and agree to the terms and conditions of this service agreement.
              </Label>
            </div>
          </div>

          {/* Step 3: Payment */}
          <div className={cn('space-y-6 px-6', currentStep !== 'payment' && 'hidden')}>
            <h3 className="font-headline text-2xl text-center">Payment Information</h3>
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>50% Deposit Required</CardTitle>
                <CardDescription>
                  To secure your booking with {selectedTier === 'lead' ? 'Anum - Lead Artist' : 'the Team'}, a 50% deposit is required.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">Total Amount</p>
                <p className="text-3xl font-bold">${finalPrice.toFixed(2)}</p>
                <Separator className="my-4" />
                <p className="text-muted-foreground">Deposit Due Today</p>
                <p className="text-4xl font-bold text-primary">${depositAmount.toFixed(2)}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <Card>
                  <CardHeader>
                      <div className="flex items-center gap-3">
                          <Banknote className="w-8 h-8 text-primary" />
                          <CardTitle>Interac e-Transfer</CardTitle>
                      </div>
                  </CardHeader>
                  <CardContent className="text-sm space-y-3">
                      <p>Please send the deposit amount to the following email address:</p>
                      <p className="font-mono p-2 bg-muted rounded-md">payment@sellaya.ca</p>
                      <p>
                          In the message/memo field, please include your Booking ID:
                          <strong className="ml-1">{quote.id}</strong>
                      </p>
                       <div className="space-y-2 pt-4">
                            <Label htmlFor="payment-screenshot" className="font-medium">Upload Screenshot *</Label>
                            <Input 
                                id="payment-screenshot" 
                                type="file" 
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={(e) => setPaymentScreenshot(e.target.files?.[0] || null)} 
                                className="file:text-primary file:font-medium"
                            />
                            {paymentScreenshot && <p className='text-xs text-muted-foreground'>Selected: {paymentScreenshot.name}</p>}
                       </div>
                       <Button type="button" size="lg" className="w-full mt-4 font-bold" disabled={isSaving || !paymentScreenshot} onClick={handleFinalizeBooking}>
                           {isSaving ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Finalizing...</> : "Confirm & Send Screenshot"}
                       </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-8 h-8 text-primary" />
                          <CardTitle>Credit Card (Stripe)</CardTitle>
                      </div>
                  </CardHeader>
                  <CardContent className="text-sm space-y-3">
                      <p>Click the button below to complete your payment securely via Stripe.</p>
                      <Button className="w-full" disabled>
                          Pay ${depositAmount.toFixed(2)} with Stripe
                      </Button>
                        <p className="text-xs text-muted-foreground text-center">Stripe payments coming soon.</p>
                  </CardContent>
                </Card>
            </div>
          </div>

          {/* Final Confirmed State */}
          {bookingConfirmed && (
            <div className="p-6">
              <div className="p-6 border rounded-lg bg-background/50">
                <h3 className="font-headline text-2xl text-center mb-4">Your Confirmed Package</h3>
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                      <CardTitle className='text-center'>{quote.selectedQuote === 'lead' ? 'Anum - Lead Artist' : 'Team'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-sm">
                        {(quote.selectedQuote ? quote.quotes[quote.selectedQuote] : quote.quotes.lead).lineItems.map((item, index) => (
                          <li key={index} className="flex justify-between">
                            <span className={item.description.startsWith('  -') ? 'pl-4 text-muted-foreground' : ''}>{item.description}</span>
                            <span className="font-medium">${item.price.toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                      <Separator className="my-2" />
                        <ul className="space-y-1 text-sm font-medium">
                          <li className="flex justify-between">
                              <span className="text-muted-foreground">Subtotal</span>
                              <span>${(quote.selectedQuote ? quote.quotes[quote.selectedQuote] : quote.quotes.lead).subtotal.toFixed(2)}</span>
                          </li>
                          <li className="flex justify-between">
                              <span className="text-muted-foreground">GST (13%)</span>
                              <span>${(quote.selectedQuote ? quote.quotes[quote.selectedQuote] : quote.quotes.lead).tax.toFixed(2)}</span>
                          </li>
                      </ul>
                    </CardContent>
                    <CardFooter className="bg-secondary/30 p-4 rounded-b-lg">
                      <div className="w-full flex justify-between items-baseline">
                        <span className="text-lg font-bold font-headline">Total</span>
                        <span className="text-2xl font-bold text-primary">${(quote.selectedQuote ? quote.quotes[quote.selectedQuote] : quote.quotes.lead).total.toFixed(2)}</span>
                      </div>
                    </CardFooter>
                </Card>
                  {quote.paymentDetails?.deposit.screenshotUrl && (
                     <div className="mt-6 text-center">
                        <h4 className="font-headline text-lg mb-2">Payment Submitted</h4>
                        <a href={quote.paymentDetails.deposit.screenshotUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                            <LinkIcon className="w-4 h-4" />
                            View Screenshot
                        </a>
                    </div>
                  )}
                  {quote.booking.address && (
                      <div className="mt-6 text-center">
                        <h4 className="font-headline text-lg mb-2">Service Address</h4>
                        <div className='text-sm space-y-1 text-muted-foreground'>
                            <p>{quote.booking.address.street}</p>
                            <p>{quote.booking.address.city}, {quote.booking.address.province} {quote.booking.address.postalCode}</p>
                        </div>
                    </div>
                )}
                  {containsStudioService && (
                      <div className="mt-6 text-center">
                        <h4 className="font-headline text-lg mb-2">Studio Address</h4>
                          <a href={STUDIO_ADDRESS.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm space-y-1 group">
                            <p className='font-medium text-foreground group-hover:text-primary transition-colors'>{STUDIO_ADDRESS.street}</p>
                            <p className='text-muted-foreground'>{STUDIO_ADDRESS.city}, {STUDIO_ADDRESS.province} {STUDIO_ADDRESS.postalCode}</p>
                        </a>
                    </div>
                  )}
              </div>
            </div>
          )}
          {!bookingConfirmed && (
            <CardFooter className="flex-col gap-4 bg-secondary/50 p-6 rounded-b-lg">
                {currentStep === 'select-tier' && (
                      <Button type="button" size="lg" className="w-full font-bold text-lg" disabled={!selectedTier} onClick={handleProceed}>
                        Proceed <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                )}
                {currentStep === 'sign-contract' && (
                      <Button type="button" size="lg" className="w-full font-bold text-lg" disabled={!contractSigned} onClick={handleProceed}>
                        Agree & Proceed to Payment
                    </Button>
                )}
                  {currentStep === 'payment' && (
                    <p className="text-sm text-center text-muted-foreground">
                        Your booking will be confirmed upon receipt of the deposit. Please follow the instructions above.
                    </p>
                )}
            </CardFooter>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    