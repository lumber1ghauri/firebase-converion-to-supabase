'use server';
import 'dotenv/config';
import { z } from 'zod';
import { format } from 'date-fns';
import { updateAvailability } from '@/ai/flows/intelligent-availability';
import { SERVICES, MOBILE_LOCATION_OPTIONS, ADDON_PRICES, BRIDAL_PARTY_PRICES, GST_RATE } from '@/lib/services';
import type { ActionState, FinalQuote, Day, BridalTrial, ServiceOption, BridalPartyServices, ServiceType, PartyBooking, PaymentStatus, Quote } from '@/lib/types';
import { SERVICE_OPTION_DETAILS } from '@/lib/types';


const phoneRegex = /^(?:\+?1\s?)?\(?([2-9][0-8][0-9])\)?\s?-?([2-9][0-9]{2})\s?-?([0-9]{4})$/;
const postalCodeRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;


const FormSchema = z.object({
  name: z.string().min(2, { message: 'Please enter your full name.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().regex(phoneRegex, { message: 'Please enter a valid phone number.' }),
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
                serviceType: formData.get(`serviceType_${i}`) as ServiceType,
                mobileLocation: formData.get(`mobileLocation_${i}`) as keyof typeof MOBILE_LOCATION_OPTIONS | undefined,
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
        airbrush: parseInt(formData.get('party_airbrush') as string || '0', 10),
    }
}

type PriceTier = 'lead' | 'team';

const calculateQuoteForTier = (tier: PriceTier, days: Omit<Day, 'id'>[], bridalTrial: BridalTrial, bridalParty: BridalPartyServices): Quote => {
    const lineItems: { description: string; price: number }[] = [];
    let subtotal = 0;

    days.forEach((day, index) => {
        const service = SERVICES.find((s) => s.id === day.serviceId);
        if (service && day.date && day.getReadyTime) {
          const serviceOptionDetail = service.askServiceType && day.serviceOption ? SERVICE_OPTION_DETAILS[day.serviceOption] : SERVICE_OPTION_DETAILS['makeup-hair'];
          
          let priceModifier = serviceOptionDetail.priceModifier;
          if (tier === 'team' && serviceOptionDetail.teamPriceModifier) {
              priceModifier = serviceOptionDetail.teamPriceModifier;
          }

          let price = service.basePrice[tier] * (service.askServiceType ? priceModifier : 1);
          
          lineItems.push({
            description: `Day ${index + 1}: ${service.name} (${service.askServiceType ? serviceOptionDetail.label : 'Standard'})`,
            price: price,
          });
          subtotal += price;

          if (day.hairExtensions > 0) {
              const extensionPrice = day.hairExtensions * ADDON_PRICES.hairExtension[tier];
              lineItems.push({ description: `  - Bride's Hair Extensions (x${day.hairExtensions})`, price: extensionPrice });
              subtotal += extensionPrice;
          }
          if (day.jewellerySetting) {
              lineItems.push({ description: `  - Bride's Jewellery Setting`, price: ADDON_PRICES.jewellerySetting[tier] });
              subtotal += ADDON_PRICES.jewellerySetting[tier];
          }
          if ((service.id === 'bridal' || service.id === 'semi-bridal') && day.sareeDraping) {
              lineItems.push({ description: `  - Bride's Saree Draping`, price: ADDON_PRICES.sareeDraping[tier] });
              subtotal += ADDON_PRICES.sareeDraping[tier];
          }
           if ((service.id === 'bridal' || service.id === 'semi-bridal') && day.hijabSetting) {
              lineItems.push({ description: `  - Bride's Hijab Setting`, price: ADDON_PRICES.hijabSetting[tier] });
              subtotal += ADDON_PRICES.hijabSetting[tier];
          }
          
          if (day.serviceType === 'mobile' && day.mobileLocation && MOBILE_LOCATION_OPTIONS[day.mobileLocation]) {
              const locationInfo = MOBILE_LOCATION_OPTIONS[day.mobileLocation];
              const daySurcharge = locationInfo.surcharge[tier];
              if (daySurcharge > 0) {
                  lineItems.push({ description: `  - Travel Surcharge (${locationInfo.label})`, price: daySurcharge });
                  subtotal += daySurcharge;
              }
          }
        }
    });

    if (bridalTrial.addTrial) {
        lineItems.push({ description: 'Bridal Trial', price: ADDON_PRICES.bridalTrial[tier] });
        subtotal += ADDON_PRICES.bridalTrial[tier];
    }
    
    if (bridalParty.addServices) {
        if(bridalParty.hairAndMakeup > 0) {
            const price = bridalParty.hairAndMakeup * BRIDAL_PARTY_PRICES.hairAndMakeup[tier];
            lineItems.push({ description: `Party: Hair & Makeup (x${bridalParty.hairAndMakeup})`, price });
            subtotal += price;
        }
        if(bridalParty.makeupOnly > 0) {
            const price = bridalParty.makeupOnly * BRIDAL_PARTY_PRICES.makeupOnly[tier];
            lineItems.push({ description: `Party: Makeup Only (x${bridalParty.makeupOnly})`, price });
            subtotal += price;
        }
        if(bridalParty.hairOnly > 0) {
            const price = bridalParty.hairOnly * BRIDAL_PARTY_PRICES.hairOnly[tier];
            lineItems.push({ description: `Party: Hair Only (x${bridalParty.hairOnly})`, price });
            subtotal += price;
        }
        if(bridalParty.dupattaSetting > 0) {
            const price = bridalParty.dupattaSetting * BRIDAL_PARTY_PRICES.dupattaSetting[tier];
            lineItems.push({ description: `Party: Dupatta Setting (x${bridalParty.dupattaSetting})`, price });
            subtotal += price;
        }
        if(bridalParty.hairExtensionInstallation > 0) {
            const price = bridalParty.hairExtensionInstallation * BRIDAL_PARTY_PRICES.hairExtensionInstallation[tier];
            lineItems.push({ description: `Party: Hair Extensions (x${bridalParty.hairExtensionInstallation})`, price });
            subtotal += price;
        }
        if(bridalParty.partySareeDraping > 0) {
            const price = bridalParty.partySareeDraping * BRIDAL_PARTY_PRICES.partySareeDraping[tier];
            lineItems.push({ description: `Party: Saree Draping (x${bridalParty.partySareeDraping})`, price });
            subtotal += price;
        }
        if(bridalParty.partyHijabSetting > 0) {
            const price = bridalParty.partyHijabSetting * BRIDAL_PARTY_PRICES.partyHijabSetting[tier];
            lineItems.push({ description: `Party: Hijab Setting (x${bridalParty.partyHijabSetting})`, price });
            subtotal += price;
        }
        if(bridalParty.airbrush > 0) {
            const price = bridalParty.airbrush * BRIDAL_PARTY_PRICES.airbrush[tier];
            lineItems.push({ description: `Party: Airbrush Service (x${bridalParty.airbrush})`, price });
            subtotal += price;
        }
    }
    
    const tax = subtotal * GST_RATE;
    const total = subtotal + tax;

    return { lineItems, subtotal, tax, total };
}


export async function generateQuoteAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
    const fieldValues = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
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

     if (days.some(d => d.serviceType === 'mobile' && !d.mobileLocation)) {
        return {
            status: 'error',
            message: 'Please select a mobile service location for all mobile service days.',
            quote: null,
            errors: { mobileLocation: ['Please select a mobile service location for all mobile service days.'] },
            fieldValues
        };
    }
    
    const bridalServiceDay = days.find(d => d.serviceId === 'bridal');
    if (bridalServiceDay && bridalTrial.addTrial && bridalServiceDay?.date && bridalTrial.date) {
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
    
    const quoteLead = calculateQuoteForTier('lead', days, bridalTrial, bridalParty);
    const quoteTeam = calculateQuoteForTier('team', days, bridalTrial, bridalParty);

    const bookingDays: FinalQuote['booking']['days'] = [];
    const addOnsByDay: Record<number, string[]> = {};

    days.forEach((day, index) => {
        const service = SERVICES.find((s) => s.id === day.serviceId);
        if (service && day.date && day.getReadyTime) {
            const serviceOption = service.askServiceType && day.serviceOption ? SERVICE_OPTION_DETAILS[day.serviceOption] : SERVICE_OPTION_DETAILS['makeup-hair'];
            addOnsByDay[index] = [];
            
            if (day.hairExtensions > 0) addOnsByDay[index].push(`Bride's Hair Extensions (x${day.hairExtensions})`);
            if (day.jewellerySetting) addOnsByDay[index].push("Bride's Jewellery Setting");
            if ((service.id === 'bridal' || service.id === 'semi-bridal') && day.sareeDraping) addOnsByDay[index].push("Bride's Saree Draping");
            if ((service.id === 'bridal' || service.id === 'semi-bridal') && day.hijabSetting) addOnsByDay[index].push("Bride's Hijab Setting");

            bookingDays.push({ 
                date: format(day.date, "PPP"), 
                getReadyTime: day.getReadyTime,
                serviceName: service.name,
                serviceType: day.serviceType,
                location: day.serviceType === 'mobile' && day.mobileLocation ? MOBILE_LOCATION_OPTIONS[day.mobileLocation].label : "Studio",
                serviceOption: service.askServiceType ? serviceOption.label : 'Standard',
                addOns: addOnsByDay[index]
            });
        }
    });

    const bridalPartyBookings: FinalQuote['booking']['bridalParty'] | undefined = bridalParty.addServices ? { services: [], airbrush: bridalParty.airbrush } : undefined;
    
    if (bridalParty.addServices && bridalPartyBookings) {
        if(bridalParty.hairAndMakeup > 0) bridalPartyBookings.services.push({ service: 'Hair & Makeup', quantity: bridalParty.hairAndMakeup });
        if(bridalParty.makeupOnly > 0) bridalPartyBookings.services.push({ service: 'Makeup Only', quantity: bridalParty.makeupOnly });
        if(bridalParty.hairOnly > 0) bridalPartyBookings.services.push({ service: 'Hair Only', quantity: bridalParty.hairOnly });
        if(bridalParty.dupattaSetting > 0) bridalPartyBookings.services.push({ service: 'Dupatta/Veil Setting', quantity: bridalParty.dupattaSetting });
        if(bridalParty.hairExtensionInstallation > 0) bridalPartyBookings.services.push({ service: 'Hair Extension Installation', quantity: bridalParty.hairExtensionInstallation });
        if(bridalParty.partySareeDraping > 0) bridalPartyBookings.services.push({ service: 'Saree Draping', quantity: bridalParty.partySareeDraping });
        if(bridalParty.partyHijabSetting > 0) bridalPartyBookings.services.push({ service: 'Hijab Setting', quantity: bridalParty.partyHijabSetting });
    }
    
    const bookingId = Math.floor(1000 + Math.random() * 9000).toString();

    const booking: FinalQuote['booking'] = {
        days: bookingDays,
        hasMobileService: days.some(d => d.serviceType === 'mobile'),
    };

    if (bridalServiceDay && bridalTrial.addTrial && bridalTrial.date && bridalTrial.time) {
        booking.trial = { date: format(bridalTrial.date, "PPP"), time: bridalTrial.time };
    }

    if (bridalPartyBookings) {
        booking.bridalParty = bridalPartyBookings;
    }

    const finalQuote: FinalQuote = {
        id: bookingId,
        contact: {
            name: validatedFields.data.name,
            email: validatedFields.data.email,
            phone: validatedFields.data.phone,
        },
        booking,
        quotes: {
            lead: quoteLead,
            team: quoteTeam,
        },
        status: 'quoted'
    };
    
    // Instead of saving here and redirecting, return the quote to the client.
    // The client component will handle saving and redirection.
     return {
        status: 'success',
        message: 'Quote generated successfully!',
        quote: finalQuote,
        errors: null,
        fieldValues
    };
}
