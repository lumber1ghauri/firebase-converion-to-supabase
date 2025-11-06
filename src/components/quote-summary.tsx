'use client';

import { useMemo } from 'react';
import type { Day } from '@/lib/types';
import { SERVICES, LOCATION_OPTIONS } from '@/lib/services';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface QuoteSummaryProps {
  days: Day[];
  location: keyof typeof LOCATION_OPTIONS;
}

export function QuoteSummary({ days, location }: QuoteSummaryProps) {
  const quote = useMemo(() => {
    const lineItems: { description: string; price: number }[] = [];
    let subtotal = 0;

    days.forEach((day, index) => {
      if (day.serviceId) {
        const service = SERVICES.find((s) => s.id === day.serviceId);
        if (service) {
          lineItems.push({
            description: `Day ${index + 1}: ${service.name}`,
            price: service.price,
          });
          subtotal += service.price;
        }
      }
    });

    const surcharge = LOCATION_OPTIONS[location].surcharge;
    const total = subtotal + surcharge;

    return { lineItems, surcharge, total };
  }, [days, location]);

  const hasSelections = quote.lineItems.length > 0;

  return (
    <Card className="sticky top-8 shadow-lg bg-card border-primary/20">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Quote Summary</CardTitle>
        <CardDescription>Your estimated cost based on selections.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasSelections ? (
          <ul className="space-y-2">
            {quote.lineItems.map((item, index) => (
              <li key={index} className="flex justify-between">
                <span>{item.description}</span>
                <span className="font-medium">${item.price.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-center py-8">Select a service to see your quote.</p>
        )}

        {hasSelections && quote.surcharge > 0 && (
          <>
            <Separator />
            <div className="flex justify-between text-muted-foreground">
              <span>Travel Surcharge</span>
              <span className="font-medium">${quote.surcharge.toFixed(2)}</span>
            </div>
          </>
        )}
      </CardContent>
      {hasSelections && (
        <CardFooter className="bg-primary/10 p-6 rounded-b-lg">
          <div className="w-full flex justify-between items-baseline">
            <span className="text-lg font-bold font-headline">Total</span>
            <span className="text-3xl font-bold text-primary">${quote.total.toFixed(2)}</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
