import type { LucideIcon } from "lucide-react";

export type ServiceOption = 'makeup-hair' | 'makeup-only' | 'hair-only';

export const SERVICE_OPTION_DETAILS: Record<ServiceOption, { label: string; priceModifier: number }> = {
    'makeup-hair': { label: 'Makeup & Hair', priceModifier: 1 },
    'makeup-only': { label: 'Makeup Only', priceModifier: 0.8 },
    'hair-only': { label: 'Hair Only', priceModifier: 0.5 },
};

export type Service = {
  id: string;
  name: string;
  description: string;
  basePrice: number; // Changed from price
  duration: number; // in minutes
  icon: LucideIcon;
  askServiceType: boolean; // Can choose makeup/hair/both
};

export type Day = {
  id: number;
  date: Date | undefined;
  getReadyTime: string; // e.g., "10:00"
  serviceId: string | null;
  serviceOption: ServiceOption | null;
  hairExtensions: number; // Number of extensions
  jewellerySetting: boolean;
  sareeDraping: boolean;
  hijabSetting: boolean;
};

export type BridalTrial = {
    addTrial: boolean;
    date: Date | undefined;
    time: string;
}

export type Quote = {
  lineItems: { description: string; price: number }[];
  surcharge: { description:string; price: number } | null;
  total: number;
};

export type Address = {
    street: string;
    city: string;
    province: 'ON';
    postalCode: string;
};

export type FinalQuote = {
  contact: { name: string; email: string };
  booking: {
    days: { 
        date: string; 
        getReadyTime: string;
        serviceName: string;
        serviceOption: string;
        addOns: string[];
    }[];
    location: string;
    address?: Address;
    trial?: {
        date: string;
        time: string;
    }
  };
  quote: Quote;
};

export type ActionState = {
  status: 'idle' | 'success' | 'error';
  message: string;
  quote: FinalQuote | null;
  errors: Record<string, string[] | undefined> | null;
  fieldValues?: Record<string, any>;
};