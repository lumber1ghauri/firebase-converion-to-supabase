'use server';

import { z } from 'zod';
import { format } from 'date-fns';
import { updateAvailability } from '@/ai/flows/intelligent-availability';
import { SERVICES, LOCATION_OPTIONS } from '@/lib/services';
import type { ActionState, FinalQuote, Day } from '@/lib/types';

const FormSchema = z.object({
  name: z.string().min(2, { message: 'Please enter your full name.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  location: z.enum(['toronto', 'outside-toronto']),
});

function parseDaysFromFormData(formData: FormData): Omit<Day, 'id'>[] {
    const daysData: Omit<Day, 'id'>[] = [];
    let i = 0;
    while (formData.has(`date_${i}`)) {
        const dateStr = formData.get(`date_${i}`) as string;
        const serviceId = formData.get(`service_${i}`) as string | null;
        if(dateStr && serviceId){
            daysData.push({
                date: new Date(dateStr),
                serviceId: serviceId,
            });
        }
        i++;
    }
    return daysData;
}

export async function generateQuoteAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
    const fieldValues = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        location: formData.get('location') as 'toronto' | 'outside-toronto'
    };

    const validatedFields = FormSchema.safeParse(fieldValues);

    const days = parseDaysFromFormData(formData);

    if (days.length === 0 || days.some(d => !d.date || !d.serviceId)) {
        return {
            message: 'Please select a date and service for each day.',
            quote: null,
            errors: {},
            fieldValues
        };
    }
    
    if (!validatedFields.success) {
        return {
            message: 'Please correct the errors below.',
            quote: null,
            errors: validatedFields.error.flatten().fieldErrors,
            fieldValues
        };
    }

    // Sort days chronologically
    days.sort((a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0));
    
    const firstDate = days[0].date;
    const totalDuration = days.reduce((acc, day) => {
        const service = SERVICES.find(s => s.id === day.serviceId);
        return acc + (service?.duration || 0);
    }, 0);

    const availabilityInput = {
        existingBookings: JSON.stringify([
            { "date": "2024-10-26T10:00:00Z", "service": "Bridal Makeup", "duration": 120 },
            { "date": "2024-10-26T15:00:00Z", "service": "Party Glam", "duration": 75 },
            { "date": "2024-10-27T11:00:00Z", "service": "Photoshoot Makeup", "duration": 90 },
        ]),
        serviceDuration: totalDuration,
        travelTime: 60, // Assumed 60 mins travel time within GTA
        newAppointmentDateTime: firstDate?.toISOString() || new Date().toISOString(),
    };

    try {
        const availabilityResult = await updateAvailability(availabilityInput);

        if (!availabilityResult.isAvailable) {
            return {
                message: availabilityResult.reason || "The selected time slot is not available due to a schedule conflict.",
                quote: null,
                errors: null,
                fieldValues
            };
        }
    } catch (error) {
        console.error("AI availability check failed:", error);
        // Continue with quote generation if AI fails, but log the error
    }


    const lineItems: { description: string; price: number }[] = [];
    let subtotal = 0;
    const bookingDays: {date: string; serviceName: string}[] = [];

    days.forEach((day, index) => {
        const service = SERVICES.find((s) => s.id === day.serviceId);
        if (service && day.date) {
          lineItems.push({
            description: `Day ${index + 1}: ${service.name}`,
            price: service.price,
          });
          subtotal += service.price;
          bookingDays.push({ date: format(day.date, "PPP"), serviceName: service.name });
        }
    });

    const locationSurcharge = LOCATION_OPTIONS[validatedFields.data.location].surcharge;
    const total = subtotal + locationSurcharge;

    const finalQuote: FinalQuote = {
        contact: {
            name: validatedFields.data.name,
            email: validatedFields.data.email,
        },
        booking: {
            days: bookingDays,
            location: LOCATION_OPTIONS[validatedFields.data.location].label,
        },
        quote: {
            lineItems,
            surcharge: locationSurcharge > 0 ? { description: "Travel Surcharge", price: locationSurcharge } : null,
            total,
        }
    };

    console.log("Generated Quote Email Payload:", finalQuote);

    return {
        message: 'Success',
        quote: finalQuote,
        errors: null,
    };
}
