'use client';

import { useMemo } from 'react';
import type { Day, BridalTrial } from '@/lib/types';
import { SERVICES, LOCATION_OPTIONS, ADDON_PRICES } from '@/lib/services';
import { SERVICE_OPTION_DETAILS } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface QuoteSummaryProps {
  days: Day[];
  location: keyof typeof LOCATION_OPTIONS;
  bridalTrial: BridalTrial;
}

export function QuoteSummary({ days, location, bridalTrial }: QuoteSummaryProps) {
  const quote = useMemo(() => {
    const lineItems: { description: string; price: number }[] = [];
    let subtotal = 0;

    days.forEach((day, index) => {
      if (day.serviceId) {
        const service = SERVICES.find((s) => s.id === day.serviceId);
        if (service) {
          const serviceOption = service.askServiceType && day.serviceOption ? SERVICE_OPTION_DETAILS[day.serviceOption] : SERVICE_OPTION_DETAILS['makeup-hair'];
          let price = service.basePrice * (service.askServiceType ? serviceOption.priceModifier : 1);
          
          lineItems.push({
            description: `Day ${index + 1}: ${service.name} (${service.askServiceType ? serviceOption.label : 'Standard'})`,
            price: price,
          });
          subtotal += price;

          if (day.hairExtensions > 0) {
              const extensionPrice = day.hairExtensions * ADDON_PRICES.hairExtension;
              lineItems.push({ description: `  - Hair Extensions (x${day.hairExtensions})`, price: extensionPrice });
              subtotal += extensionPrice;
          }
          if (day.jewellerySetting) {
              lineItems.push({ description: `  - Jewellery Setting`, price: ADDON_PRICES.jewellerySetting });
              subtotal += ADDON_PRICES.jewellerySetting;
          }
          if ((service.id === 'bridal' || service.id === 'semi-bridal') && day.sareeDraping) {
              lineItems.push({ description: `  - Saree Draping`, price: ADDON_PRICES.sareeDraping });
              subtotal += ADDON_PRICES.sareeDraping;
          }
           if ((service.id === 'bridal' || service.id === 'semi-bridal') && day.hijabSetting) {
              lineItems.push({ description: `  - Hijab Setting`, price: ADDON_PRICES.hijabSetting });
              subtotal += ADDON_PRICES.hijabSetting;
          }
        }
      }
    });

    if (bridalTrial.addTrial) {
        lineItems.push({ description: 'Bridal Trial', price: ADDON_PRICES.bridalTrial });
        subtotal += ADDON_PRICES.bridalTrial;
    }

    const surcharge = LOCATION_OPTIONS[location].surcharge;
    const total = subtotal + surcharge;

    return { lineItems, surcharge, total };
  }, [days, location, bridalTrial]);

  const hasSelections = days.some(d => d.serviceId);

  return (
    <Card className="sticky top-8 shadow-lg bg-card border-primary/20">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Quote Summary</CardTitle>
        <CardDescription>Your estimated cost based on selections.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasSelections ? (
          <ul className="space-y-2 text-sm">
            {quote.lineItems.map((item, index) => (
              <li key={index} className="flex justify-between">
                <span className={item.description.startsWith('  -') ? 'pl-4 text-muted-foreground' : ''}>{item.description}</span>
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
