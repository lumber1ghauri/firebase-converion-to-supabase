'use client';

import { useState, useMemo, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { generateQuoteAction } from '@/app/actions';
import type { ActionState, Day } from '@/lib/types';
import { SERVICES, LOCATION_OPTIONS } from '@/lib/services';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuoteSummary } from '@/components/quote-summary';
import { QuoteConfirmation } from '@/components/quote-confirmation';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const initialState: ActionState = {
  message: '',
  quote: null,
  errors: null,
};

export default function BookingFlow() {
  const [state, formAction] = useFormState(generateQuoteAction, initialState);
  const { toast } = useToast();

  const [days, setDays] = useState<Day[]>([
    { id: Date.now(), date: new Date(), serviceId: null },
  ]);
  const [location, setLocation] = useState<keyof typeof LOCATION_OPTIONS>('toronto');

  useEffect(() => {
    if (state.message && state.message !== 'Success' && !state.errors) {
      toast({
        variant: 'destructive',
        title: 'Availability Check Failed',
        description: state.message,
      });
    }
  }, [state, toast]);

  const addDay = () => {
    setDays([...days, { id: Date.now(), date: undefined, serviceId: null }]);
  };

  const removeDay = (id: number) => {
    if (days.length > 1) {
      setDays(days.filter((day) => day.id !== id));
    }
  };

  const updateDay = (id: number, newDayData: Partial<Omit<Day, 'id'>>) => {
    setDays(days.map((day) => (day.id === id ? { ...day, ...newDayData } : day)));
  };

  const isFormInvalid = useMemo(() => {
    return days.some(day => !day.date || !day.serviceId);
  }, [days]);

  if (state.quote) {
    return <QuoteConfirmation quote={state.quote} />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      <form action={formAction} className="lg:col-span-3 space-y-8">
        {state.message && state.message !== 'Success' && state.errors && (
             <Alert variant="destructive">
                <AlertTitle>Could not generate quote</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
            </Alert>
        )}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">1. Services & Dates</CardTitle>
            <CardDescription>Select a date and service for each day of your booking.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {days.map((day, index) => (
              <div key={day.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-center p-4 rounded-lg border bg-card/50">
                <input type="hidden" name={`day_id_${index}`} value={day.id} />
                <div>
                  <Label htmlFor={`date-${index}`}>Day {index + 1}</Label>
                   <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !day.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {day.date ? format(day.date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={day.date}
                        onSelect={(date) => updateDay(day.id, { date: date as Date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <input type="hidden" name={`date_${index}`} value={day.date?.toISOString()} />
                </div>

                <div>
                    <Label htmlFor={`service-${index}`}>Service</Label>
                    <Select name={`service_${index}`} onValueChange={(serviceId) => updateDay(day.id, { serviceId })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                        {SERVICES.map((service) => {
                            const Icon = service.icon;
                            return (
                            <SelectItem key={service.id} value={service.id}>
                                <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                <span>{service.name}</span>
                                </div>
                            </SelectItem>
                            );
                        })}
                        </SelectContent>
                    </Select>
                </div>

                <Button type="button" variant="ghost" size="icon" onClick={() => removeDay(day.id)} disabled={days.length <= 1} className="self-end hover:bg-destructive/20 hover:text-destructive">
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addDay} className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Add Another Day
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">2. Your Location</CardTitle>
                <CardDescription>Travel fees may apply for locations outside the GTA.</CardDescription>
            </CardHeader>
            <CardContent>
                <RadioGroup name="location" defaultValue={location} onValueChange={(value) => setLocation(value as keyof typeof LOCATION_OPTIONS)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.values(LOCATION_OPTIONS).map(opt => (
                        <Label key={opt.id} className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-accent/10 has-[[data-state=checked]]:bg-accent/20 has-[[data-state=checked]]:border-primary transition-colors">
                            <RadioGroupItem value={opt.id} id={opt.id} />
                            <span>{opt.label}</span>
                        </Label>
                    ))}
                </RadioGroup>
            </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">3. Your Details</CardTitle>
            <CardDescription>Enter your contact information to finalize the quote.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" placeholder="Jane Doe" required defaultValue={state.fieldValues?.name} />
               {state.errors?.name && <p className="text-sm text-destructive mt-1">{state.errors.name[0]}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" placeholder="jane.doe@example.com" required defaultValue={state.fieldValues?.email} />
              {state.errors?.email && <p className="text-sm text-destructive mt-1">{state.errors.email[0]}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" type="tel" placeholder="(416) 555-1234" required defaultValue={state.fieldValues?.phone}/>
               {state.errors?.phone && <p className="text-sm text-destructive mt-1">{state.errors.phone[0]}</p>}
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full text-lg font-bold" disabled={isFormInvalid}>
          Generate My Quote
        </Button>
      </form>
      
      <div className="lg:col-span-2">
        <QuoteSummary days={days} location={location} />
      </div>
    </div>
  );
}
