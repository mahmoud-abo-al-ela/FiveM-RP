import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

export interface CreateCheckoutSessionParams {
  itemId: number;
  itemName: string;
  price: number;
  userId: string;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export async function createStripeCheckoutSession(params: CreateCheckoutSessionParams) {
  const {
    itemId,
    itemName,
    price,
    userId,
    userEmail,
    successUrl,
    cancelUrl,
    metadata = {},
  } = params;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: itemName,
              description: `Store Item #${itemId}`,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: userEmail,
      metadata: {
        userId,
        itemId: itemId.toString(),
        itemName: itemName,
        paymentProvider: 'stripe',
        ...metadata,
      },
    });

    return {
      success: true,
      sessionId: session.id,
      url: session.url,
    };
  } catch (error: any) {
    console.error('Stripe checkout session creation failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to create checkout session',
    };
  }
}

export async function verifyStripeWebhook(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event | null> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return null;
  }

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    return event;
  } catch (error: any) {
    console.error('❌ Stripe Webhook Construction Failed:', error.message);
    return null;
  }
}
