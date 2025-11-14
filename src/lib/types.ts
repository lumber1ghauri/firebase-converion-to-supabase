
import type { LucideIcon } from "lucide-react";
import { MOBILE_LOCATION_OPTIONS } from "./services";

export type ServiceOption = 'makeup-hair' | 'makeup-only' | 'hair-only';

export const SERVICE_OPTION_DETAILS: Record<ServiceOption, { label: string; priceModifier: number }> = {
    'makeup-hair': { label: 'Makeup & Hair', priceModifier: 1 },
    'makeup-only': { label: 'Makeup Only', priceModifier: 0.8 },
    'hair-only': { label: 'Hair Only', priceModifier: 0.5 },
};

export type PriceTier = 'lead' | 'team';

export type DualPrice = {
    lead: number;
    team: number;
}

export type Service = {
  id: string;
  name: string;
  description: string;
  basePrice: DualPrice;
  duration: number; // in minutes
  icon: LucideIcon;
  askServiceType: boolean; // Can choose makeup/hair/both
};

export type BridalPartyServices = {
    addServices: boolean;
    hairAndMakeup: number;
    makeupOnly: number;
    hairOnly: number;
    dupattaSetting: number;
    hairExtensionInstallation: number;
    partySareeDraping: number;
    partyHijabSetting: number;
    airbrush: number;
};

export type ServiceType = 'studio' | 'mobile';

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
  serviceType: ServiceType;
  mobileLocation?: keyof typeof MOBILE_LOCATION_OPTIONS;
};

export type BridalTrial = {
    addTrial: boolean;
    date: Date | undefined;
    time: string;
}

export type Quote = {
  lineItems: { description: string; price: number }[];
  subtotal: number;
  tax: number;
  total: number;
};

export type Address = {
    street: string;
    city: string;
    province: 'ON';
    postalCode: string;
};

export type PartyBooking = {
    service: string;
    quantity: number;
};

export type PaymentStatus = 'pending' | 'received';

export type PaymentInfo = {
    status: PaymentStatus;
    amount: number;
    screenshotUrl?: string;
}

export type FinalQuote = {
  id: string; // Unique booking ID
  contact: { name: string; email: string; phone: string; };
  booking: {
    days: { 
        date: string; 
        getReadyTime: string;
        serviceName: string;
        serviceOption: string;
        serviceType: ServiceType;
        location: string;
        addOns: string[];
    }[];
    hasMobileService: boolean;
    bridalParty?: {
        services: PartyBooking[];
        airbrush: number;
    },
    address?: Address;
    trial?: {
        date: string;
        time: string;
    }
  };
  quotes: {
    lead: Quote;
    team: Quote;
  };
  paymentDetails?: {
      deposit: PaymentInfo;
      final: PaymentInfo;
  };
  selectedQuote?: PriceTier;
  status: 'quoted' | 'confirmed' | 'cancelled';
};

export type ActionState = {
  status: 'idle' | 'success' | 'error';
  message: string;
  quote: FinalQuote | null;
  errors: Record<string, string[] | undefined> | null;
  fieldValues?: Record<string, any>;
};
