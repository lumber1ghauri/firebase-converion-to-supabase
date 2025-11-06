'use server';

import { z } from 'zod';
import { format } from 'date-fns';
import { updateAvailability } from '@/ai/flows/intelligent-availability';
import { SERVICES, LOCATION_OPTIONS, ADDON_PRICES, BRIDAL_PARTY_PRICES } from '@/lib/services';
import type { ActionState, FinalQuote, Day, BridalTrial, ServiceOption, BridalPartyServices, PartyBooking } from '@/lib/types';
import { SERVICE_OPTION_DETAILS } from '@/lib/types';
import { sendQuoteEmail } from '@/lib/email';
import { saveBooking as saveBookingToDb } from '@/firebase/firestore/bookings';

const phoneRegex = /^(?:\+?1\s?)?\(?([2-9][0-8][0-9])\)?\s?-?([2-9][0-9]{2})\s?-?([0-9]{4})$/;
const postalCodeRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;


const FormSchema = z.object({
  name: z.string().min(2, { message: 'Please enter your full name.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().regex(phoneRegex, { message: 'Please enter a valid phone number.' }),
  location: z.enum(['toronto', 'outside-toronto'], { required_error: 'Please select a location.' }),
});

const AddressSchema = z.object({
    street: z.string().min(5, { message: 'Please enter a valid street address.'}),
    city: z.string().min(2, { message: 'Please enter a city.'}),
    province: z.literal('ON', { required_error: 'Province must be Ontario.'}),
    postalCode: z.string().regex(postalCodeRegex, { message: 'Please enter a valid Canadian postal code.'}),
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

function parseBridalPartyServicesFromFormData(formData: FormData): BridalPartyServices {
    return {
        addServices: formData.get('addPartyServices') === 'on',
        hairAndMakeup: parseInt(formData.get('party_hairAndMakeup') as string || '0', 10),
        makeupOnly: parseInt(formData.get('party_makeupOnly') as string || '0', 10),
        hairOnly: parseInt(formData.get('party_hairOnly') as string || '0', 10),
        dupattaSetting: parseInt(formData.get('party_dupattaSetting') as string || '0', 10),
        hairExtensionInstallation: parseInt(formData.get('party_hairExtensionInstallation') as string || '0', 10),
        partySareeDraping: parseInt(formData.get('party_sareeDraping') as string || '0', 10),
        partyHijabSetting: parseInt(formData.get('party_hijabSetting') as string || '0', 10),
        airbrush: formData.get('party_airbrush') === 'on',
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
    const bridalParty = parseBridalPartyServicesFromFormData(formData);

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
    if (bridalServiceDay && bridalTrial.addTrial && (!bridalTrial.date || !bridalTrial.time)) {
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
              lineItems.push({ description: `  - Bride's Hair Extensions (x${day.hairExtensions})`, price: extensionPrice });
              subtotal += extensionPrice;
              addOns.push(`Bride's Hair Extensions (x${day.hairExtensions})`);
          }
          if (day.jewellerySetting) {
              lineItems.push({ description: `  - Bride's Jewellery Setting`, price: ADDON_PRICES.jewellerySetting });
              subtotal += ADDON_PRICES.jewellerySetting;
              addOns.push("Bride's Jewellery Setting");
          }
          if ((service.id === 'bridal' || service.id === 'semi-bridal') && day.sareeDraping) {
              lineItems.push({ description: `  - Bride's Saree Draping`, price: ADDON_PRICES.sareeDraping });
              subtotal += ADDON_PRICES.sareeDraping;
              addOns.push("Bride's Saree Draping");
          }
           if ((service.id === 'bridal' || service.id === 'semi-bridal') && day.hijabSetting) {
              lineItems.push({ description: `  - Bride's Hijab Setting`, price: ADDON_PRICES.hijabSetting });
              subtotal += ADDON_PRICES.hijabSetting;
              addOns.push("Bride's Hijab Setting");
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
    
    const bridalPartyBookings: {services: PartyBooking[], airbrush: boolean} | undefined = bridalParty.addServices ? { services: [], airbrush: bridalParty.airbrush } : undefined;
    
    if (bridalParty.addServices && bridalPartyBookings) {
        if(bridalParty.hairAndMakeup > 0) {
            const price = bridalParty.hairAndMakeup * BRIDAL_PARTY_PRICES.hairAndMakeup;
            lineItems.push({ description: `Party: Hair & Makeup (x${bridalParty.hairAndMakeup})`, price });
            subtotal += price;
            bridalPartyBookings.services.push({ service: 'Hair & Makeup', quantity: bridalParty.hairAndMakeup });
        }
        if(bridalParty.makeupOnly > 0) {
            const price = bridalParty.makeupOnly * BRIDAL_PARTY_PRICES.makeupOnly;
            lineItems.push({ description: `Party: Makeup Only (x${bridalParty.makeupOnly})`, price });
            subtotal += price;
            bridalPartyBookings.services.push({ service: 'Makeup Only', quantity: bridalParty.makeupOnly });
        }
        if(bridalParty.hairOnly > 0) {
            const price = bridalParty.hairOnly * BRIDAL_PARTY_PRICES.hairOnly;
            lineItems.push({ description: `Party: Hair Only (x${bridalParty.hairOnly})`, price });
            subtotal += price;
            bridalPartyBookings.services.push({ service: 'Hair Only', quantity: bridalParty.hairOnly });
        }
        if(bridalParty.dupattaSetting > 0) {
            const price = bridalParty.dupattaSetting * BRIDAL_PARTY_PRICES.dupattaSetting;
            lineItems.push({ description: `Party: Dupatta Setting (x${bridalParty.dupattaSetting})`, price });
            subtotal += price;
            bridalPartyBookings.services.push({ service: 'Dupatta/Veil Setting', quantity: bridalParty.dupattaSetting });
        }
        if(bridalParty.hairExtensionInstallation > 0) {
            const price = bridalParty.hairExtensionInstallation * BRIDAL_PARTY_PRICES.hairExtensionInstallation;
            lineItems.push({ description: `Party: Hair Extensions (x${bridalParty.hairExtensionInstallation})`, price });
            subtotal += price;
            bridalPartyBookings.services.push({ service: 'Hair Extension Installation', quantity: bridalParty.hairExtensionInstallation });
        }
        if(bridalParty.partySareeDraping > 0) {
            const price = bridalParty.partySareeDraping * BRIDAL_PARTY_PRICES.partySareeDraping;
            lineItems.push({ description: `Party: Saree Draping (x${bridalParty.partySareeDraping})`, price });
            subtotal += price;
            bridalPartyBookings.services.push({ service: 'Saree Draping', quantity: bridalParty.partySareeDraping });
        }
        if(bridalParty.partyHijabSetting > 0) {
            const price = bridalParty.partyHijabSetting * BRIDAL_PARTY_PRICES.partyHijabSetting;
            lineItems.push({ description: `Party: Hijab Setting (x${bridalParty.partyHijabSetting})`, price });
            subtotal += price;
            bridalPartyBookings.services.push({ service: 'Hijab Setting', quantity: bridalParty.partyHijabSetting });
        }
        if(bridalParty.airbrush) {
            lineItems.push({ description: `Party: Airbrush Service`, price: BRIDAL_PARTY_PRICES.airbrush });
            subtotal += BRIDAL_PARTY_PRICES.airbrush;
        }
    }


    const locationSurcharge = LOCATION_OPTIONS[validatedFields.data.location].surcharge;
    const total = subtotal + locationSurcharge;
    
    const bookingId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const finalQuote: FinalQuote = {
        id: bookingId,
        contact: {
            name: validatedFields.data.name,
            email: validatedFields.data.email,
        },
        booking: {
            days: bookingDays,
            location: LOCATION_OPTIONS[validatedFields.data.location].label,
            trial: (bridalTrial.addTrial && bridalTrial.date && bridalTrial.time) 
                ? { date: format(bridalTrial.date, "PPP"), time: bridalTrial.time }
                : undefined,
            bridalParty: bridalPartyBookings,
        },
        quote: {
            lineItems,
            surcharge: locationSurcharge > 0 ? { description: "Travel Surcharge", price: locationSurcharge } : null,
            total,
        },
        status: 'quoted'
    };
    
    // The 'try...catch' block is removed to allow errors to be thrown.
    // The calling component will handle the error and display a message.
    await Promise.all([
      sendQuoteEmail(finalQuote),
      saveBookingToDb({ id: bookingId, finalQuote, createdAt: new Date() })
    ]);
    
    return {
        status: 'success',
        message: 'Success',
        quote: finalQuote,
        errors: null,
    };
}


export async function confirmBookingAction(prevState: any, formData: FormData): Promise<ActionState> {

    const finalQuoteString = formData.get('finalQuote') as string;
    if (!finalQuoteString) {
        return {
            status: 'error',
            message: 'Quote data is missing. Please generate a quote first.',
            quote: null,
            errors: { form: ['Quote data is missing.'] },
        }
    }
    const finalQuote: FinalQuote = JSON.parse(finalQuoteString);

    const addressData = {
        street: formData.get('street'),
        city: formData.get('city'),
        province: formData.get('province'),
        postalCode: formData.get('postalCode'),
    };
    
    const validatedAddress = AddressSchema.safeParse(addressData);
    if (!validatedAddress.success) {
        return {
            status: 'success', // Keep rendering the confirmation page
            message: 'Please correct the address errors.',
            quote: finalQuote,
            errors: validatedAddress.error.flatten().fieldErrors,
        }
    }

    const updatedQuote: FinalQuote = {
        ...finalQuote,
        booking: {
            ...finalQuote.booking,
            address: validatedAddress.data,
        },
        status: 'confirmed'
    };
    
    // The 'try...catch' block is removed to allow errors to be thrown.
    await Promise.all([
        sendQuoteEmail(updatedQuote),
        saveBookingToDb({ id: updatedQuote.id, finalQuote: updatedQuote, createdAt: new Date() })
    ]);

    // This is where you would redirect to Stripe
    console.log("Redirecting to Stripe with quote:", updatedQuote);


    // For now, we'll just return a success state with a different message
     return {
        status: 'success',
        message: 'Booking Confirmed! A confirmation email with the address has been sent.',
        quote: updatedQuote, // Return the updated quote
        errors: null,
    };
}
