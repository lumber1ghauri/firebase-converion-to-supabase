'use server';

import type { FinalQuote } from './types';

// This file is intentionally left blank to disable email functionality.

export async function sendQuoteEmail(quote: FinalQuote) {
  // NO-OP
  console.log("Email functionality is disabled. Quote data:", quote);
  return Promise.resolve();
}
