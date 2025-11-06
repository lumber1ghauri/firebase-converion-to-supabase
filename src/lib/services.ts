import { Camera, Gem, PartyPopper, Sparkles } from "lucide-react";
import type { Service } from "./types";

export const SERVICES: Service[] = [
  {
    id: "bridal",
    name: "Bridal Makeup",
    description: "Look your absolute best on your special day.",
    price: 350,
    duration: 120,
    icon: Gem,
  },
  {
    id: "semi-bridal",
    name: "Semi-Bridal / Engagement",
    description: "For engagement parties or other pre-wedding events.",
    price: 250,
    duration: 90,
    icon: Sparkles,
  },
  {
    id: "party",
    name: "Party Glam",
    description: "A glamorous look for any party or night out.",
    price: 150,
    duration: 75,
    icon: PartyPopper,
  },
  {
    id: "photoshoot",
    name: "Photoshoot Makeup",
    description: "Camera-ready makeup that looks flawless.",
    price: 200,
    duration: 90,
    icon: Camera,
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
