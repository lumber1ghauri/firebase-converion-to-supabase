'use server';

import { z } from 'zod';
import { format, parseISO } from 'date-fns';
import { updateAvailability } from '@/ai/flows/intelligent-availability';
import { SERVICES, LOCATION_OPTIONS, ADDON_PRICES } from '@/lib/services';
import type { ActionState, FinalQuote, Day, BridalTrial, ServiceOption } from '@/lib/types';
import { SERVICE_OPTION_DETAILS } from '@/lib/types';

const FormSchema = z.object({
  name: z.string().min(2, { message: 'Please enter your full name.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  location: z.enum(['toronto', 'outside-toronto'], { required_error: 'Please select a location.' }),
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
                getReadyTime: formData.get(`getReadyTime_${i}`) as string,
                serviceId: serviceId,
                serviceOption: formData.get(`serviceOption_${i}`) as ServiceOption | null,
                hairExtensions: parseInt(formData.get(`hairExtensions_${i}`) as string || '0', 10),
                jewellerySetting: formData.get(`jewellerySetting_${i}`) === 'on',
                sareeDraping: formData.get(`sareeDraping_${i}`) === 'on',
                hijabSetting: formData.get(`hijabSetting_${i}`) === 'on',
            });
        }
        i++;
    }
    return daysData;
}

function parseBridalTrialFromFormData(formData: FormData): BridalTrial {
    const addTrial = formData.get('addTrial') === 'on';
    const trialDateStr = formData.get('trialDate') as string | null;
    return {
        addTrial,
        date: trialDateStr ? new Date(trialDateStr) : undefined,
        time: formData.get('trialTime') as string,
    }
}


export async function generateQuoteAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
    const fieldValues = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        location: formData.get('location') as 'toronto' | 'outside-toronto',
        // We will pass the rest of the form data to fieldValues to repopulate the form
        ...Object.fromEntries(formData.entries()),
    };

    const validatedFields = FormSchema.safeParse(fieldValues);
    
    if (!validatedFields.success) {
        return {
            status: 'error',
            message: 'Please correct the errors below.',
            quote: null,
            errors: validatedFields.error.flatten().fieldErrors,
            fieldValues
        };
    }

    const days = parseDaysFromFormData(formData);
    const bridalTrial = parseBridalTrialFromFormData(formData);

    if (days.length === 0 || days.some(d => !d.date || !d.serviceId || !d.getReadyTime)) {
        return {
            status: 'error',
            message: 'Please select a date, time, and service for each booking.',
            quote: null,
            errors: { form: ['Please select a date, time, and service for each booking day.'] },
            fieldValues
        };
    }
    
    const bridalServiceDay = days.find(d => d.serviceId === 'bridal');
    if (bridalTrial.addTrial && bridalServiceDay?.date && bridalTrial.date) {
        if (bridalTrial.date >= bridalServiceDay.date) {
            return {
                status: 'error',
                message: 'Bridal trial date must be before the event date.',
                quote: null,
                errors: { trialDate: ['Trial date must be before the event date.'] },
                fieldValues
            };
        }
    }
    if (bridalTrial.addTrial && (!bridalTrial.date || !bridalTrial.time)) {
        return {
            status: 'error',
            message: 'Please select a date and time for the bridal trial.',
            quote: null,
            errors: { trialDate: ['Please select a date and time for the trial.'] },
            fieldValues
        }
    }


    // Sort days chronologically
    days.sort((a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0));
    
    const firstDate = days[0].date;
    const firstTime = days[0].getReadyTime;
    const combinedDateTime = firstDate && firstTime ? `${format(firstDate, 'yyyy-MM-dd')}T${firstTime}:00Z` : new Date().toISOString();


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
        newAppointmentDateTime: combinedDateTime,
    };

    try {
        const availabilityResult = await updateAvailability(availabilityInput);

        if (!availabilityResult.isAvailable) {
            return {
                status: 'error',
                message: availabilityResult.reason || "The selected time slot is not available due to a schedule conflict.",
                quote: null,
                errors: null,
                fieldValues
            };
        }
    } catch (error) {
        console.error("AI availability check failed:", error);
    }


    const lineItems: { description: string; price: number }[] = [];
    let subtotal = 0;
    const bookingDays: FinalQuote['booking']['days'] = [];

    days.forEach((day, index) => {
        const service = SERVICES.find((s) => s.id === day.serviceId);
        if (service && day.date && day.getReadyTime) {
          const serviceOption = service.askServiceType && day.serviceOption ? SERVICE_OPTION_DETAILS[day.serviceOption] : SERVICE_OPTION_DETAILS['makeup-hair'];
          let price = service.basePrice * (service.askServiceType ? serviceOption.priceModifier : 1);
          
          const addOns: string[] = [];
          
          lineItems.push({
            description: `Day ${index + 1}: ${service.name} (${service.askServiceType ? serviceOption.label : 'Standard'})`,
            price: price,
          });
          subtotal += price;

          if (day.hairExtensions > 0) {
              const extensionPrice = day.hairExtensions * ADDON_PRICES.hairExtension;
              lineItems.push({ description: `  - Hair Extensions (x${day.hairExtensions})`, price: extensionPrice });
              subtotal += extensionPrice;
              addOns.push(`Hair Extensions (x${day.hairExtensions})`);
          }
          if (day.jewellerySetting) {
              lineItems.push({ description: `  - Jewellery/Dupatta Setting`, price: ADDON_PRICES.jewellerySetting });
              subtotal += ADDON_PRICES.jewellerySetting;
              addOns.push('Jewellery Setting');
          }
          if ((service.id === 'bridal' || service.id === 'semi-bridal') && day.sareeDraping) {
              lineItems.push({ description: `  - Saree Draping`, price: ADDON_PRICES.sareeDraping });
              subtotal += ADDON_PRICES.sareeDraping;
              addOns.push('Saree Draping');
          }
           if ((service.id === 'bridal' || service.id === 'semi-bridal') && day.hijabSetting) {
              lineItems.push({ description: `  - Hijab Setting`, price: ADDON_PRICES.hijabSetting });
              subtotal += ADDON_PRICES.hijabSetting;
              addOns.push('Hijab Setting');
          }

          bookingDays.push({ 
              date: format(day.date, "PPP"), 
              getReadyTime: day.getReadyTime,
              serviceName: service.name,
              serviceOption: service.askServiceType ? serviceOption.label : 'Standard',
              addOns
          });
        }
    });

    if (bridalTrial.addTrial) {
        lineItems.push({ description: 'Bridal Trial', price: ADDON_PRICES.bridalTrial });
        subtotal += ADDON_PRICES.bridalTrial;
    }

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
            trial: (bridalTrial.addTrial && bridalTrial.date && bridalTrial.time) 
                ? { date: format(bridalTrial.date, "PPP"), time: bridalTrial.time }
                : undefined
        },
        quote: {
            lineItems,
            surcharge: locationSurcharge > 0 ? { description: "Travel Surcharge", price: locationSurcharge } : null,
            total,
        }
    };

    // TODO: Implement email sending functionality
    // This is where you would integrate an email service like Resend, SendGrid, or Nodemailer.
    // Example using a hypothetical sendEmail function:
    // try {
    //   await sendEmail({
    //     to: finalQuote.contact.email,
    //     subject: 'Your Makeup Quote from GlamBook Pro',
    //     react: <QuoteEmailTemplate quote={finalQuote} />,
    //   });
    // } catch (error) {
    //   console.error("Failed to send quote email:", error);
    //   // You might want to handle this error, but for now we'll proceed
    // }

    return {
        status: 'success',
        message: 'Success',
        quote: finalQuote,
        errors: null,
    };
}
