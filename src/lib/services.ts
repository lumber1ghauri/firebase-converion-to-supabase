import { Camera, Gem, PartyPopper, Sparkles } from "lucide-react";
import type { Service } from "./types";

export const SERVICES: Service[] = [
  {
    id: "bridal",
    name: "Bridal Makeup",
    description: "Look your absolute best on your special day.",
    basePrice: 350,
    duration: 120,
    icon: Gem,
    askServiceType: true,
  },
  {
    id: "semi-bridal",
    name: "Semi-Bridal / Engagement",
    description: "For engagement parties or other pre-wedding events.",
    basePrice: 250,
    duration: 90,
    icon: Sparkles,
    askServiceType: true,
  },
  {
    id: "party",
    name: "Party Glam",
    description: "A glamorous look for any party or night out.",
    basePrice: 150,
    duration: 75,
    icon: PartyPopper,
    askServiceType: true,
  },
  {
    id: "photoshoot",
    name: "Photoshoot Makeup",
    description: "Camera-ready makeup that looks flawless.",
    basePrice: 200,
    duration: 90,
    icon: Camera,
    askServiceType: false, // This service might be makeup only by default
  },
];

export const SERVICE_TYPE_OPTIONS = {
  studio: {
    id: 'studio',
    label: 'Studio Service',
    description: 'Visit our professional studio for your makeup session.',
  },
  mobile: {
    id: 'mobile',
    label: 'Mobile Service',
    description: 'We travel to your location (additional fees may apply).',
  }
}

export const STUDIO_ADDRESS: {street: string, city: string, province: string, postalCode: string, country: string} = {
    street: "123 Glamour Lane",
    city: "Toronto",
    province: "ON",
    postalCode: "M5V 2T6",
    country: "Canada",
}


export const MOBILE_LOCATION_OPTIONS = {
  toronto: {
    id: 'toronto',
    label: 'Toronto / GTA',
    surcharge: 0,
  },
  'outside-toronto': {
    id: 'outside-toronto',
    label: 'Outside Toronto / GTA',
    surcharge: 50,
  },
};

export const ADDON_PRICES = {
    hairExtension: 20, // Price per extension
    jewellerySetting: 15,
    sareeDraping: 25,
    hijabSetting: 25,
    bridalTrial: 100,
};

export const BRIDAL_PARTY_PRICES = {
    hairAndMakeup: 180,
    makeupOnly: 100,
    hairOnly: 100,
    dupattaSetting: 15,
    hairExtensionInstallation: 20,
    partySareeDraping: 25,
    partyHijabSetting: 25,
    airbrush: 50,
};
