'use server';

// This file is intentionally left blank to disable email functionality.

export async function sendQuoteEmail(quote: any) {
  // NO-OP
  console.log("Email functionality is disabled. Quote data:", quote);
  return Promise.resolve();
}
