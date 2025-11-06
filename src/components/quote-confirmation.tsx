import { CheckCircle2 } from "lucide-react";
import type { FinalQuote } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function QuoteConfirmation({ quote }: { quote: FinalQuote }) {
  return (
    <div className="w-full max-w-3xl mx-auto py-8">
        <Card className="shadow-xl border-primary/20 animate-in fade-in-50 duration-500">
            <CardHeader className="text-center items-center">
                <CheckCircle2 className="h-16 w-16 text-primary" />
                <CardTitle className="font-headline text-4xl mt-4">Quote Generated!</CardTitle>
                <CardDescription className="text-lg">
                Thank you, {quote.contact.name}. A summary has been sent to {quote.contact.email}.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 border rounded-lg">
                    <h3 className="font-headline text-xl mb-2">Booking Summary</h3>
                    <ul className="space-y-1">
                        {quote.booking.days.map((day, index) => (
                            <li key={index} className="flex justify-between">
                                <span>{day.date}:</span>
                                <span className="font-medium">{day.serviceName}</span>
                            </li>
                        ))}
                    </ul>
                     <Separator className="my-2" />
                     <div className="flex justify-between">
                        <span>Location:</span>
                        <span className="font-medium">{quote.booking.location}</span>
                     </div>
                </div>

                <div className="p-4 border rounded-lg">
                    <h3 className="font-headline text-xl mb-2">Price Breakdown</h3>
                    <ul className="space-y-1">
                        {quote.quote.lineItems.map((item, index) => (
                        <li key={index} className="flex justify-between">
                            <span>{item.description}</span>
                            <span className="font-medium">${item.price.toFixed(2)}</span>
                        </li>
                        ))}
                        {quote.quote.surcharge && (
                            <li className="flex justify-between text-muted-foreground">
                                <span>{quote.quote.surcharge.description}</span>
                                <span className="font-medium">${quote.quote.surcharge.price.toFixed(2)}</span>
                            </li>
                        )}
                    </ul>
                </div>
            </CardContent>
            <CardFooter className="bg-primary/10 p-6 rounded-b-lg">
                <div className="w-full flex justify-between items-baseline">
                    <span className="text-xl font-bold font-headline">Grand Total</span>
                    <span className="text-4xl font-bold text-primary">${quote.quote.total.toFixed(2)}</span>
                </div>
            </CardFooter>
        </Card>
    </div>
  );
}
