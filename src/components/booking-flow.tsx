'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Trash2, Loader2, Minus, AlertTriangle, Info, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { generateQuoteAction } from '@/app/actions';
import type { ActionState, Day, ServiceOption, BridalTrial, BridalPartyServices } from '@/lib/types';
import { SERVICES, LOCATION_OPTIONS } from '@/lib/services';
import { SERVICE_OPTION_DETAILS } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { QuoteSummary } from '@/components/quote-summary';
import { QuoteConfirmation } from '@/components/quote-confirmation';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';


const initialState: ActionState = {
  status: 'idle',
  message: '',
  quote: null,
  errors: null,
  fieldValues: {},
};

const getInitialDays = (fieldValues: Record<string, any> | undefined): Day[] => {
    if (fieldValues && Object.keys(fieldValues).length > 0 && fieldValues['date_0']) {
        const days: Day[] = [];
        let i = 0;
        while (fieldValues[`date_${i}`]) {
            days.push({
                id: parseInt(fieldValues[`day_id_${i}`] || Date.now() + i, 10),
                date: new Date(fieldValues[`date_${i}`]),
                getReadyTime: fieldValues[`getReadyTime_${i}`],
                serviceId: fieldValues[`service_${i}`],
                serviceOption: fieldValues[`serviceOption_${i}`],
                hairExtensions: parseInt(fieldValues[`hairExtensions_${i}`] || '0', 10),
                jewellerySetting: fieldValues[`jewellerySetting_${i}`] === 'on',
                sareeDraping: fieldValues[`sareeDraping_${i}`] === 'on',
                hijabSetting: fieldValues[`hijabSetting_${i}`] === 'on',
            });
            i++;
        }
        return days;
    }
    return [{ 
        id: Date.now(), date: new Date(), getReadyTime: '10:00', serviceId: null, serviceOption: 'makeup-hair',
        hairExtensions: 0, jewellerySetting: false, sareeDraping: false, hijabSetting: false
    }];
};

const getInitialBridalTrial = (fieldValues: Record<string, any> | undefined): BridalTrial => {
    if (fieldValues && Object.keys(fieldValues).length > 0 && 'addTrial' in fieldValues) {
        return {
            addTrial: fieldValues.addTrial === 'on',
            date: fieldValues.trialDate ? new Date(fieldValues.trialDate) : undefined,
            time: fieldValues.trialTime || '11:00'
        };
    }
    return {
        addTrial: false,
        date: undefined,
        time: '11:00'
    };
};

const getInitialBridalParty = (fieldValues: Record<string, any> | undefined): BridalPartyServices => {
    const defaults = {
        addServices: false, hairAndMakeup: 0, makeupOnly: 0, hairOnly: 0, dupattaSetting: 0,
        hairExtensionInstallation: 0, partySareeDraping: 0, partyHijabSetting: 0, airbrush: false,
    };
    if (fieldValues && Object.keys(fieldValues).length > 0 && 'addPartyServices' in fieldValues) {
        return {
            addServices: fieldValues.addPartyServices === 'on',
            hairAndMakeup: parseInt(fieldValues.party_hairAndMakeup || '0', 10),
            makeupOnly: parseInt(fieldValues.party_makeupOnly || '0', 10),
            hairOnly: parseInt(fieldValues.party_hairOnly || '0', 10),
            dupattaSetting: parseInt(fieldValues.party_dupattaSetting || '0', 10),
            hairExtensionInstallation: parseInt(fieldValues.party_hairExtensionInstallation || '0', 10),
            partySareeDraping: parseInt(fieldValues.party_sareeDraping || '0', 10),
            partyHijabSetting: parseInt(fieldValues.party_hijabSetting || '0', 10),
            airbrush: fieldValues.party_airbrush === 'on',
        };
    }
    return defaults;
}


function generateTimeSlots() {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const h = hour.toString().padStart(2, '0');
            const m = minute.toString().padStart(2, '0');
            slots.push(`${h}:${m}`);
        }
    }
    return slots;
}

const timeSlots = generateTimeSlots();


export default function BookingFlow() {
  const [state, formAction] = useActionState(generateQuoteAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [showQuote, setShowQuote] = useState(false);
  const [days, setDays] = useState<Day[]>(() => getInitialDays(state.fieldValues));
  const [bridalTrial, setBridalTrial] = useState<BridalTrial>(() => getInitialBridalTrial(state.fieldValues));
  const [bridalParty, setBridalParty] = useState<BridalPartyServices>(() => getInitialBridalParty(state.fieldValues));
  const [location, setLocation] = useState<keyof typeof LOCATION_OPTIONS>((state.fieldValues?.location as keyof typeof LOCATION_OPTIONS) || 'toronto');
  
  // Refs for popovers
  const dayPopoverRefs = useRef<{[key: number]: { open: boolean, setOpen: (open: boolean) => void} }>({});
  const trialPopoverRef = useRef<{ open: boolean, setOpen: (open: boolean) => void}>();


  const hasBridalService = useMemo(() => days.some(day => day.serviceId === 'bridal'), [days]);

  useEffect(() => {
    if (state.status === 'error' && state.message && !state.errors) {
      toast({
        variant: 'destructive',
        title: 'Booking Error',
        description: state.message,
      });
    }
    if (state.status === 'success' && state.quote) {
        if(state.message && state.message.includes('failed to send email')){
             toast({
                variant: 'destructive',
                title: 'Quote Generated',
                description: "Your quote is ready, but we couldn't send the confirmation email. Please check your API key.",
            });
        }
        setShowQuote(true);
    } else {
        setShowQuote(false);
    }
    if (state.status === 'error' || (state.status === 'success' && !state.quote)) {
        setShowQuote(false);
    }
  }, [state, toast]);

  const handleFormChange = () => {
    if (showQuote) {
        setShowQuote(false);
    }
  }

  const addDay = () => {
    handleFormChange();
    setDays([...days, { id: Date.now(), date: new Date(), getReadyTime: '10:00', serviceId: null, serviceOption: 'makeup-hair', hairExtensions: 0, jewellerySetting: false, sareeDraping: false, hijabSetting: false }]);
  };

  const removeDay = (id: number) => {
    if (days.length > 1) {
      handleFormChange();
      setDays(days.filter((day) => day.id !== id));
    }
  };

  const updateDay = (id: number, newDayData: Partial<Omit<Day, 'id'>>) => {
    handleFormChange();
    setDays(days.map((day) => (day.id === id ? { ...day, ...newDayData } : day)));
  };

   const updateBridalTrial = (newTrialData: Partial<BridalTrial>) => {
    handleFormChange();
    setBridalTrial(prev => ({ ...prev, ...newTrialData }));
  };
  
   const updateBridalParty = (newPartyData: Partial<BridalPartyServices>) => {
    handleFormChange();
    setBridalParty(prev => ({ ...prev, ...newPartyData }));
  }
   const updateBridalPartyQty = (field: keyof BridalPartyServices, increase: boolean) => {
    handleFormChange();
    setBridalParty(prev => ({
        ...prev,
        [field]: Math.max(0, (prev[field] as number) + (increase ? 1 : -1))
    }))
  }

  const isFormInvalid = useMemo(() => {
    return days.some(day => !day.date || !day.serviceId || !day.getReadyTime) ||
           (hasBridalService && bridalTrial.addTrial && (!bridalTrial.date || !bridalTrial.time));
  }, [days, bridalTrial, hasBridalService]);

  if (state.status === 'success' && state.quote) {
    return <QuoteConfirmation quote={state.quote} />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      <form ref={formRef} action={formAction} onChange={handleFormChange} className="lg:col-span-3 space-y-8">
        {state.status === 'error' && state.message && state.errors && (
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Could not generate quote</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
            </Alert>
        )}

        <Card className="shadow-md animate-in fade-in-50 duration-500">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">1. Services & Dates</CardTitle>
            <CardDescription>Select services, dates, and times for your booking.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {days.map((day, index) => {
              const service = SERVICES.find(s => s.id === day.serviceId);
              const showAddons = service?.id === 'bridal' || service?.id === 'semi-bridal';
              const [isPopoverOpen, setIsPopoverOpen] = useState(false);

              return (
              <div key={day.id} className="space-y-6 p-4 rounded-lg border bg-card/50 relative animate-in fade-in-50">
                <input type="hidden" name={`day_id_${index}`} value={day.id} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor={`date-${index}`}>Day {index + 1} - Date *</Label>
                        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                            <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!day.date && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {day.date ? format(day.date, "PPP") : <span>Pick a date</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={day.date} onSelect={(date) => { updateDay(day.id, { date: date as Date }); setIsPopoverOpen(false); }} initialFocus /></PopoverContent>
                        </Popover>
                        <input type="hidden" name={`date_${index}`} value={day.date?.toISOString() || ''} />
                    </div>
                    <div>
                        <Label htmlFor={`getReadyTime-${index}`}>Get Ready Time *</Label>
                        <Select name={`getReadyTime_${index}`} value={day.getReadyTime} onValueChange={(value) => updateDay(day.id, { getReadyTime: value })} required>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {timeSlots.map(slot => <SelectItem key={slot} value={slot}>{format(new Date(`1970-01-01T${slot}`), 'p')}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <Label htmlFor={`service-${index}`}>Service *</Label>
                        <Select name={`service_${index}`} value={day.serviceId || ''} onValueChange={(serviceId) => updateDay(day.id, { serviceId })} required>
                            <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
                            <SelectContent>{SERVICES.map((s) => (<SelectItem key={s.id} value={s.id}><div className="flex items-center gap-2"><s.icon className="h-4 w-4 text-muted-foreground" /><span>{s.name}</span></div></SelectItem>))}</SelectContent>
                        </Select>
                    </div>
                </div>

                {service?.askServiceType && (
                    <div className='pt-4'>
                        <Label>Service Type *</Label>
                        <RadioGroup name={`serviceOption_${index}`} value={day.serviceOption || 'makeup-hair'} onValueChange={(val) => updateDay(day.id, { serviceOption: val as ServiceOption })} className="grid grid-cols-3 gap-4 pt-2">
                             {Object.entries(SERVICE_OPTION_DETAILS).map(([id, {label}]) => (
                                <Label key={id} className="flex items-center space-x-2 border rounded-md p-2 justify-center cursor-pointer hover:bg-accent hover:text-accent-foreground has-[[data-state=checked]]:bg-accent has-[[data-state=checked]]:text-accent-foreground has-[[data-state=checked]]:border-primary transition-colors text-sm">
                                    <RadioGroupItem value={id} id={`${day.id}-${id}`} />
                                    <span>{label}</span>
                                </Label>
                             ))}
                        </RadioGroup>
                    </div>
                )}
                
                {service && (
                    <Card className='mt-4 bg-background/50'>
                        <CardHeader className='p-4'>
                            <CardTitle className='text-lg'>Bride's Add-ons</CardTitle>
                        </CardHeader>
                        <CardContent className='p-4 pt-0 space-y-4'>
                             <div className="flex items-center justify-between">
                                <Label htmlFor={`jewellerySetting-${index}`} className="flex flex-col gap-1 cursor-pointer">
                                    <span>Jewellery/Dupatta Setting</span>
                                    <span className='text-xs text-muted-foreground'>Price revealed in quote</span>
                                </Label>
                                <Switch id={`jewellerySetting-${index}`} name={`jewellerySetting_${index}`} checked={day.jewellerySetting} onCheckedChange={(checked) => updateDay(day.id, { jewellerySetting: checked })} />
                            </div>
                            
                            {showAddons && <>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <Label htmlFor={`sareeDraping-${index}`} className="flex flex-col gap-1 cursor-pointer">
                                    <span>Saree Draping</span>
                                    <span className='text-xs text-muted-foreground'>Price revealed in quote</span>
                                </Label>
                                    <Switch id={`sareeDraping-${index}`} name={`sareeDraping_${index}`} checked={day.sareeDraping} onCheckedChange={(checked) => updateDay(day.id, { sareeDraping: checked })} />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                     <Label htmlFor={`hijabSetting-${index}`} className="flex flex-col gap-1 cursor-pointer">
                                    <span>Hijab Setting</span>
                                    <span className='text-xs text-muted-foreground'>Price revealed in quote</span>
                                </Label>
                                    <Switch id={`hijabSetting-${index}`} name={`hijabSetting_${index}`} checked={day.hijabSetting} onCheckedChange={(checked) => updateDay(day.id, { hijabSetting: checked })} />
                                </div>
                            </>}
                            <Separator />
                            <div>
                                <Label htmlFor={`hairExtensions-${index}`}>Hair Extensions</Label>
                                <p className="text-xs text-muted-foreground mb-2">Price revealed in quote</p>
                                <div className="flex items-center gap-2">
                                    <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => updateDay(day.id, { hairExtensions: Math.max(0, day.hairExtensions - 1) })}><Minus className="h-4 w-4" /></Button>
                                    <Input id={`hairExtensions-${index}`} name={`hairExtensions_${index}`} type="number" min="0" className="w-16 text-center" value={day.hairExtensions} onChange={(e) => updateDay(day.id, { hairExtensions: parseInt(e.target.value, 10) || 0 })} />
                                    <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => updateDay(day.id, { hairExtensions: day.hairExtensions + 1 })}><Plus className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}


                <Button type="button" variant="ghost" size="icon" onClick={() => removeDay(day.id)} disabled={days.length <= 1} className="absolute top-2 right-2 hover:bg-destructive/20 hover:text-destructive">
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            )})}
            <Button type="button" variant="outline" onClick={addDay} className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Add Another Day
            </Button>
          </CardContent>
        </Card>

        {hasBridalService && (
            <BridalServiceOptions
              bridalTrial={bridalTrial}
              updateBridalTrial={updateBridalTrial}
              days={days}
              errors={state.errors}
              bridalParty={bridalParty}
              updateBridalParty={updateBridalParty}
              updateBridalPartyQty={updateBridalPartyQty}
            />
        )}

        <Card className="shadow-md animate-in fade-in-50 duration-1000">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">2. Your Location</CardTitle>
                <CardDescription>Travel fees may apply for locations outside the GTA.</CardDescription>
            </CardHeader>
            <CardContent>
                <RadioGroup name="location" value={location} onValueChange={(value) => { handleFormChange(); setLocation(value as keyof typeof LOCATION_OPTIONS) }} className="grid grid-cols-1 md:grid-cols-2 gap-4" required>
                    {Object.values(LOCATION_OPTIONS).map(opt => (
                        <Label key={opt.id} className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground has-[[data-state=checked]]:bg-accent has-[[data-state=checked]]:text-accent-foreground has-[[data-state=checked]]:border-primary transition-colors">
                            <RadioGroupItem value={opt.id} id={opt.id} />
                            <span>{opt.label}</span>
                        </Label>
                    ))}
                </RadioGroup>
                 {state.errors?.location && <p className="text-sm text-destructive mt-2">{state.errors.location[0]}</p>}
            </CardContent>
        </Card>
        
        <Card className="shadow-md animate-in fade-in-50 duration-1000">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">3. Your Details</CardTitle>
            <CardDescription>Enter your contact information to finalize the quote.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" name="name" placeholder="Jane Doe" required defaultValue={state.fieldValues?.name as string || ''} />
               {state.errors?.name && <p className="text-sm text-destructive mt-1">{state.errors.name[0]}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" name="email" type="email" placeholder="jane.doe@example.com" required defaultValue={state.fieldValues?.email as string || ''} />
              {state.errors?.email && <p className="text-sm text-destructive mt-1">{state.errors.email[0]}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input id="phone" name="phone" type="tel" placeholder="(416) 555-1234" required defaultValue={state.fieldValues?.phone as string || ''}/>
               {state.errors?.phone && <p className="text-sm text-destructive mt-1">{state.errors.phone[0]}</p>}
            </div>
          </CardContent>
        </Card>
        
        <div className="lg:hidden">
            {showQuote ? (
                 <QuoteSummary days={days} location={location} bridalTrial={bridalTrial} bridalParty={bridalParty} />
            ) : (
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Generate Quote</AlertTitle>
                    <AlertDescription>
                        Fill out the form and click "Generate My Quote" to see your price summary.
                    </AlertDescription>
                </Alert>
            )}
        </div>


        <SubmitButton isInvalid={isFormInvalid} showQuote={showQuote} />
      </form>
      
      <div className="lg:col-span-2 sticky top-8 hidden lg:block">
        {showQuote ? (
            <div className="animate-in fade-in-50">
                <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Quote is temporary!</AlertTitle>
                    <AlertDescription>
                        Changing any options will require you to generate a new quote.
                    </AlertDescription>
                </Alert>
                <QuoteSummary days={days} location={location} bridalTrial={bridalTrial} bridalParty={bridalParty} />
            </div>
        ) : (
            <Card className="animate-in fade-in-50">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Quote Summary</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center py-12">
                     <Info className="h-8 w-8 text-muted-foreground mb-4" />
                     <p className="text-muted-foreground">Your quote summary will appear here once you fill out the form and generate it.</p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}

function BridalServiceOptions({ bridalTrial, updateBridalTrial, days, errors, bridalParty, updateBridalParty, updateBridalPartyQty }: {
  bridalTrial: BridalTrial;
  updateBridalTrial: (data: Partial<BridalTrial>) => void;
  days: Day[];
  errors: ActionState['errors'];
  bridalParty: BridalPartyServices;
  updateBridalParty: (data: Partial<BridalPartyServices>) => void;
  updateBridalPartyQty: (field: keyof BridalPartyServices, increase: boolean) => void;
}) {
  const [isTrialPopoverOpen, setIsTrialPopoverOpen] = useState(false);
  return (
    <>
      <Card className="shadow-md animate-in fade-in-50 duration-700">
          <CardHeader>
              <div className="flex items-center justify-between">
                  <div>
                      <CardTitle className="font-headline text-2xl">Bridal Trial</CardTitle>
                      <CardDescription>Add a trial session before your big day. Price revealed in quote.</CardDescription>
                  </div>
                  <Switch name="addTrial" checked={bridalTrial.addTrial} onCheckedChange={(checked) => updateBridalTrial({ addTrial: checked })} />
              </div>
          </CardHeader>
          {bridalTrial.addTrial && (
              <CardContent className="space-y-4 animate-in fade-in-0 slide-in-from-top-5 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <Label htmlFor="trialDate">Trial Date *</Label>
                          <Popover open={isTrialPopoverOpen} onOpenChange={setIsTrialPopoverOpen}>
                              <PopoverTrigger asChild>
                              <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !bridalTrial.date && "text-muted-foreground")}>
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {bridalTrial.date ? format(bridalTrial.date, "PPP") : <span>Pick a date</span>}
                              </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={bridalTrial.date} onSelect={(date) => { updateBridalTrial({ date: date as Date }); setIsTrialPopoverOpen(false); }} disabled={(date) => {
                                  const bridalDay = days.find(d=>d.serviceId === 'bridal')?.date;
                                  if (!bridalDay) return false;
                                  return date >= bridalDay;
                              }} initialFocus/>
                              </PopoverContent>
                          </Popover>
                          <input type="hidden" name="trialDate" value={bridalTrial.date?.toISOString() || ''} />
                      </div>
                      <div>
                          <Label htmlFor="trialTime">Trial Time *</Label>
                          <Select name="trialTime" value={bridalTrial.time} onValueChange={(value) => updateBridalTrial({ time: value })} required={bridalTrial.addTrial}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {timeSlots.map(slot => <SelectItem key={slot} value={slot}>{format(new Date(`1970-01-01T${slot}`), 'p')}</SelectItem>)}
                            </SelectContent>
                          </Select>
                      </div>
                  </div>
                  {errors?.trialDate && <p className="text-sm text-destructive mt-1">{errors.trialDate[0]}</p>}
              </CardContent>
          )}
      </Card>

      <Card className="shadow-md animate-in fade-in-50 duration-800">
          <CardHeader>
              <div className="flex items-center justify-between">
                  <div className='flex items-center gap-4'>
                      <Users className='w-6 h-6 text-primary'/>
                      <div>
                          <CardTitle className="font-headline text-2xl">Bridal Party Services</CardTitle>
                          <CardDescription>Aside from the bride, are there other members requiring services?</CardDescription>
                      </div>
                  </div>
                  <Switch name="addPartyServices" checked={bridalParty.addServices} onCheckedChange={(checked) => updateBridalParty({ addServices: checked })} />
              </div>
          </CardHeader>
          {bridalParty.addServices && (
              <CardContent className="space-y-6 pt-2 animate-in fade-in-0 slide-in-from-top-5 duration-300">
                  <PartyServiceInput
                      name="hairAndMakeup"
                      label="Both Hair & Makeup"
                      description="Complete styling package. This does not include the bride."
                      value={bridalParty.hairAndMakeup}
                      onValueChange={(val) => updateBridalParty({ hairAndMakeup: val })}
                      onButtonClick={updateBridalPartyQty}
                  />
                  <PartyServiceInput
                      name="makeupOnly"
                      label="Makeup Only"
                      description="These people do not need hair done. This does not include the bride."
                      value={bridalParty.makeupOnly}
                      onValueChange={(val) => updateBridalParty({ makeupOnly: val })}
                      onButtonClick={updateBridalPartyQty}
                  />
                    <PartyServiceInput
                      name="hairOnly"
                      label="Hair Only"
                      description="These people do not need makeup done. This does not include the bride."
                      value={bridalParty.hairOnly}
                      onValueChange={(val) => updateBridalParty({ hairOnly: val })}
                      onButtonClick={updateBridalPartyQty}
                  />
                  <Separator/>
                  <PartyServiceInput
                      name="dupattaSetting"
                      label="Dupatta/Veil Setting"
                      description="Professional assistance with dupatta or veil arrangement."
                      value={bridalParty.dupattaSetting}
                      onValueChange={(val) => updateBridalParty({ dupattaSetting: val })}
                      onButtonClick={updateBridalPartyQty}
                  />
                  <PartyServiceInput
                      name="hairExtensionInstallation"
                      label="Hair Extensions Installation"
                      description="*Note: We do not provide the hair extensions. Each person must have their own."
                      value={bridalParty.hairExtensionInstallation}
                      onValueChange={(val) => updateBridalParty({ hairExtensionInstallation: val })}
                      onButtonClick={updateBridalPartyQty}
                  />
                  <PartyServiceInput
                      name="partySareeDraping"
                      label="Saree Draping"
                      description="Traditional technique creating beautiful draping effect for dupatta or veil."
                      value={bridalParty.partySareeDraping}
                      onValueChange={(val) => updateBridalParty({ partySareeDraping: val })}
                      onButtonClick={updateBridalPartyQty}
                  />
                  <PartyServiceInput
                      name="partyHijabSetting"
                      label="Hijab Setting"
                      description="Professional assistance with hijab styling and arrangement."
                      value={bridalParty.partyHijabSetting}
                      onValueChange={(val) => updateBridalParty({ partyHijabSetting: val })}
                      onButtonClick={updateBridalPartyQty}
                  />
                  <Separator/>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="party-airbrush" className="flex flex-col gap-1 cursor-pointer">
                          <span>Air Brush Service</span>
                          <span className='text-xs text-muted-foreground'>Add airbrushing for a flawless finish.</span>
                      </Label>
                      <Switch id="party-airbrush" name="party_airbrush" checked={bridalParty.airbrush} onCheckedChange={(checked) => updateBridalParty({ airbrush: checked })} />
                  </div>
              </CardContent>
          )}
      </Card>
    </>
  )
}


function PartyServiceInput({ name, label, description, value, onValueChange, onButtonClick }: {
    name: keyof BridalPartyServices,
    label: string,
    description: string,
    value: number,
    onValueChange: (value: number) => void,
    onButtonClick: (field: keyof BridalPartyServices, increase: boolean) => void
}) {
    const id = `party-${name}`;
    return (
        <div>
            <div className="flex items-center justify-between">
                <Label htmlFor={id} className="flex flex-col gap-1">
                    <span>{label}</span>
                    <span className='text-xs text-muted-foreground font-normal'>{description}</span>
                </Label>
                <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => onButtonClick(name, false)}><Minus className="h-4 w-4" /></Button>
                    <Input id={id} name={`party_${name}`} type="number" min="0" className="w-16 text-center" value={value} onChange={(e) => onValueChange(parseInt(e.target.value, 10) || 0)} />
                    <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => onButtonClick(name, true)}><Plus className="h-4 w-4" /></Button>
                </div>
            </div>
        </div>
    )
}


function SubmitButton({ isInvalid, showQuote }: { isInvalid: boolean, showQuote: boolean }) {
    const { pending } = useFormStatus();
    
    if (showQuote) {
        return (
             <Button type="submit" size="lg" className="w-full text-lg font-bold">
                Accept Quote & Book Now (Coming Soon)
            </Button>
        )
    }

    return (
        <Button type="submit" size="lg" className="w-full text-lg font-bold" disabled={isInvalid || pending}>
            {pending ? <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating...
            </> : "Generate My Quote"}
        </Button>
    )
}
