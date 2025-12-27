import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyStripeWebhook } from '@/lib/payments/stripe';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const event = await verifyStripeWebhook(body, signature);

    if (!event) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }


    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        
        // Extract metadata
        const { userId, itemId, paymentProvider } = session.metadata;

        if (!userId || !itemId) {
          return NextResponse.json({ received: true });
        }

        const supabase = createServiceRoleClient();
        
        // Deliver the item and send receipt
        try {
          // Get user and item details for the receipt
          const { data: userData } = await supabase
            .from('users')
            .select('discord_id')
            .eq('id', userId)
            .single();

          const { data: itemData } = await supabase
            .from('store_items')
            .select('name')
            .eq('id', parseInt(itemId))
            .single();

          // Record the successful payment with the item name
          const { error: insertError } = await supabase
            .from('payment_transactions')
            .insert({
              user_id: userId,
              item_id: parseInt(itemId),
              item_name: itemData?.name || session.metadata?.itemName || 'Unknown Item',
              payment_provider: paymentProvider || 'stripe',
              transaction_id: session.id,
              amount: session.amount_total / 100, // Convert from cents
              currency: session.currency.toUpperCase(),
              status: 'completed',
              metadata: session.metadata || {},
              created_at: new Date().toISOString(),
            });

          if (insertError) {
            // Failed silently as per request
          }

          if (userData?.discord_id) {
            const { sendReceiptMessage } = await import('@/lib/discord/client');
            await sendReceiptMessage({
              discordId: userData.discord_id,
              itemName: itemData?.name || 'Unknown Item',
              price: session.amount_total / 100,
              transactionId: session.id,
              status: 'completed',
              method: 'Stripe (Credit Card)',
            });
          }
        } catch (receiptError) {
          // Failed silently as per request
        }

        break;
      }

      case 'checkout.session.expired': {
        break;
      }

      case 'payment_intent.payment_failed': {
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
