'use server';

import type { FinalQuote } from '@/lib/types';
import { sendQuoteEmail } from '@/lib/email';
import { format } from 'date-fns';

/**
 * A server action to send a test email.
 * This should be removed after testing is complete.
 */
export async function sendTestEmailAction() {
  console.log('Attempting to send test email...');
  const testQuote: FinalQuote = {
    id: 'TEST-001',
    contact: { name: 'Test User', email: 'user@example.com' }, // Changed to a placeholder user email
    booking: {
      days: [
        {
          date: format(new Date(), 'PPP'),
          getReadyTime: '12:00 PM',
          serviceName: 'Test Service',
          serviceOption: 'Makeup & Hair',
          serviceType: 'mobile',
          location: 'Test Location',
          addOns: ['Test Add-on'],
        },
      ],
      hasMobileService: true,
      address: {
        street: '123 Test St',
        city: 'Toronto',
        province: 'ON',
        postalCode: 'M1M 1M1',
      }
    },
    quotes: {
      lead: {
        lineItems: [{ description: 'Test Item', price: 100 }],
        subtotal: 100,
        tax: 13,
        total: 113,
      },
      team: {
        lineItems: [{ description: 'Test Item', price: 80 }],
        subtotal: 80,
        tax: 10.4,
        total: 90.4,
      },
    },
    selectedQuote: 'lead',
    status: 'confirmed',
  };

  try {
    await sendQuoteEmail(testQuote);
    console.log('Test email action completed successfully.');
    return { success: true, message: `Test email sent successfully! Please check the inboxes for ${testQuote.contact.email} and the admin email.` };
  } catch (error: any) {
    console.error('Test email action failed:', error);
    return { success: false, message: `Failed to send test email: ${error.message}` };
  }
}
