
import { NextResponse } from 'next/server';
import { getBooking } from '@/lib/database';
import Stripe from 'stripe';
import type { PriceTier } from '@/lib/types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: Request) {
  const { bookingId, tier } = await request.json();

  if (!bookingId || !tier) {
    return NextResponse.json({ error: 'Missing bookingId or tier' }, { status: 400 });
  }

  try {
    const bookingDoc = await getBooking(bookingId);
    if (!bookingDoc) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const selectedQuote = bookingDoc.finalQuote.quotes[tier as PriceTier];
    if (!selectedQuote) {
      return NextResponse.json({ error: 'Invalid pricing tier selected' }, { status: 400 });
    }
    
    // 50% deposit amount
    const depositAmount = selectedQuote.total * 0.5;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: `Deposit for Booking #${bookingId}`,
              description: `50% deposit for services from Looks by Anum.`,
            },
            unit_amount: Math.round(depositAmount * 100), // amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/book/${bookingId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/book/${bookingId}/cancel`,
      metadata: {
        bookingId: bookingId,
        tier: tier,
      },
    });

    return NextResponse.json({ sessionId: session.id });

  } catch (err: any) {
    console.error('Stripe session creation error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
