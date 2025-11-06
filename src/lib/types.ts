import type { LucideIcon } from "lucide-react";

export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  icon: LucideIcon;
};

export type Day = {
  id: number;
  date: Date | undefined;
  serviceId: string | null;
};

export type Quote = {
  lineItems: { description: string; price: number }[];
  surcharge: { description:string; price: number } | null;
  total: number;
};

export type FinalQuote = {
  contact: { name: string; email: string };
  booking: {
    days: { date: string; serviceName: string }[];
    location: string;
  };
  quote: Quote;
};

export type ActionState = {
  message: string;
  quote: FinalQuote | null;
  errors: Record<string, string[] | undefined> | null;
  fieldValues?: Record<string, string>;
};
