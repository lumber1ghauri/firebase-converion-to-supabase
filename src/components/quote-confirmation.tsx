import { CheckCircle2, IndianRupee, FileText } from "lucide-react";
import type { FinalQuote } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "./ui/button";

export function QuoteConfirmation({ quote }: { quote: FinalQuote }) {
  return (
    <div className="w-full max-w-3xl mx-auto py-8">
        <Card className="shadow-xl border-primary/20 animate-in fade-in-50 duration-500">
            <CardHeader className="text-center items-center">
                <CheckCircle2 className="h-16 w-16 text-primary" />
                <CardTitle className="font-headline text-4xl mt-4">Quote Generated!</CardTitle>
                <CardDescription className="text-lg max-w-prose">
                Thank you, {quote.contact.name}. Your quote is ready. A summary has been sent to {quote.contact.email}.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 border rounded-lg">
                    <h3 className="font-headline text-xl mb-3">Booking Summary</h3>
                    <ul className="space-y-3">
                        {quote.booking.days.map((day, index) => (
                            <li key={index} className="text-sm">
                                <div className="flex justify-between font-medium">
                                    <span>{day.date} at {day.getReadyTime}</span>
                                    <span>{day.serviceName}</span>
                                </div>
                                <div className="text-muted-foreground ml-2">- {day.serviceOption}</div>
                                {day.addOns.map((addon, i) => (
                                    <div key={i} className="text-muted-foreground ml-2">- {addon}</div>
                                ))}
                            </li>
                        ))}
                         {quote.booking.trial && (
                             <li className="text-sm">
                                <div className="flex justify-between font-medium">
                                    <span>Bridal Trial: {quote.booking.trial.date} at {quote.booking.trial.time}</span>
                                </div>
                             </li>
                         )}
                    </ul>
                     <Separator className="my-3" />
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium">{quote.booking.location}</span>
                     </div>
                </div>

                <div className="p-4 border rounded-lg">
                    <h3 className="font-headline text-xl mb-3">Price Breakdown</h3>
                    <ul className="space-y-1 text-sm">
                        {quote.quote.lineItems.map((item, index) => (
                        <li key={index} className="flex justify-between">
                            <span className={item.description.startsWith('  -') ? 'pl-4 text-muted-foreground' : ''}>{item.description}</span>
                            <span className="font-medium">${item.price.toFixed(2)}</span>
                        </li>
                        ))}
                        {quote.quote.surcharge && (
                            <>
                            <Separator className="my-2" />
                            <li className="flex justify-between font-medium">
                                <span>{quote.quote.surcharge.description}</span>
                                <span>${quote.quote.surcharge.price.toFixed(2)}</span>
                            </li>
                            </>
                        )}
                    </ul>
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-4 bg-primary/10 p-6 rounded-b-lg">
                <div className="w-full flex justify-between items-baseline">
                    <span className="text-xl font-bold font-headline">Grand Total</span>
                    <span className="text-4xl font-bold text-primary">${quote.quote.total.toFixed(2)}</span>
                </div>
                 <Button size="lg" className="w-full font-bold text-lg" disabled>
                    <IndianRupee className="mr-2 h-5 w-5" /> Proceed to Payment (Coming Soon)
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}
