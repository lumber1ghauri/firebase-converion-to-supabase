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

export const LOCATION_OPTIONS = {
  toronto: {
    id: 'toronto',
    label: 'Toronto / GTA',
    surcharge: 0,
  },
  'outside-toronto': {
    id: 'outside-toronto',
    label: 'Outside Toronto / GTA',
    surcharge: 100,
  },
};

export const ADDON_PRICES = {
    hairExtension: 25, // Price per extension
    jewellerySetting: 20,
    sareeDraping: 30,
    hijabSetting: 30,
    bridalTrial: 150,
};
