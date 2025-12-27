import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { instapay } from '@/lib/payments/instapay';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('x-instapay-signature') || '';

    // Verify webhook signature
    const isValid = instapay.verifyWebhookSignature(body, signature);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const data = JSON.parse(body);

    // Handle different event types
    switch (data.event_type) {
      case 'payment.completed':
      case 'payment.success': {
        const { transaction_id, metadata, amount, currency } = data;

        if (!metadata?.userId || !metadata?.itemId) {
          console.error('Missing metadata in InstaPay webhook:', metadata);
          return NextResponse.json({ received: true });
        }

        // Record the successful payment
        const supabase = await createClient();
        
        const { error: insertError } = await supabase
          .from('payment_transactions')
          .insert({
            user_id: metadata.userId,
            item_id: parseInt(metadata.itemId),
            payment_provider: 'instapay',
            transaction_id: transaction_id,
            amount: amount,
            currency: currency || 'EGP',
            status: 'completed',
            metadata: JSON.stringify(metadata),
            created_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error('Failed to record InstaPay payment:', insertError);
        }

        // TODO: Deliver the item to the user

        console.log('InstaPay payment completed:', {
          userId: metadata.userId,
          itemId: metadata.itemId,
          amount,
        });

        break;
      }

      case 'payment.failed': {
        console.log('InstaPay payment failed:', data.transaction_id);
        // TODO: Notify user of failed payment
        break;
      }

      case 'payment.cancelled': {
        console.log('InstaPay payment cancelled:', data.transaction_id);
        break;
      }

      default:
        console.log('Unhandled InstaPay event type:', data.event_type);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('InstaPay webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
