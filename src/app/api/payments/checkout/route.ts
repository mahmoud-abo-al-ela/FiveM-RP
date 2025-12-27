import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createStripeCheckoutSession } from '@/lib/payments/stripe';
import { instapay } from '@/lib/payments/instapay';
import { createWalletPaymentRequest } from '@/lib/payments/wallet';
import type { PaymentProvider } from '@/lib/payments/provider';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      itemId,
      paymentProvider,
      walletNumber,
      paymentProofUrl,
      notes,
    } = body;

    if (!itemId || !paymentProvider) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get store item details
    const { data: item, error: itemError } = await supabase
      .from('store_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    if (!item.available) {
      return NextResponse.json(
        { error: 'Item is not available' },
        { status: 400 }
      );
    }

    // Parse price (assuming format like "$10" or "10")
    const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/store/success?item=${itemId}`;
    const cancelUrl = `${baseUrl}/store?cancelled=true`;

    // Handle different payment providers
    switch (paymentProvider as PaymentProvider) {
      case 'stripe': {
        const result = await createStripeCheckoutSession({
          itemId: item.id,
          itemName: item.name,
          price,
          userId: user.id,
          userEmail: user.email || '',
          successUrl,
          cancelUrl,
          metadata: {
            category: item.category,
          },
        });

        if (!result.success) {
          return NextResponse.json(
            { error: result.error },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          provider: 'stripe',
          sessionId: result.sessionId,
          url: result.url,
        });
      }

      case 'instapay':
      case 'wallet': {
        if (!walletNumber) {
          return NextResponse.json(
            { error: 'Phone/Wallet number is required' },
            { status: 400 }
          );
        }

        if (!paymentProofUrl) {
          return NextResponse.json(
            { error: 'Payment proof screenshot is required' },
            { status: 400 }
          );
        }

        const result = await createWalletPaymentRequest({
          itemId: item.id,
          itemName: item.name,
          price,
          userId: user.id,
          userEmail: user.email || '',
          paymentMethod: paymentProvider,
          walletNumber,
          paymentProofUrl,
          notes,
        });

        if (!result.success) {
          return NextResponse.json(
            { error: result.error },
            { status: 500 }
          );
        }

        // Send Discord receipt for manual payment (Pending state)
        try {
          const { data: profile } = await supabase
            .from('users')
            .select('discord_id')
            .eq('id', user.id)
            .single();

          if (profile?.discord_id) {
            const { sendReceiptMessage } = await import('@/lib/discord/client');
            await sendReceiptMessage({
              discordId: profile.discord_id,
              itemName: item.name,
              price: price,
              transactionId: String(result.paymentRequestId),
              status: 'pending',
              method: paymentProvider === 'wallet' ? 'Vodafone Cash' : 'InstaPay',
            });
          }
        } catch (discordError) {
          console.error('Failed to send Discord receipt:', discordError);
          // Don't fail the whole request if Discord notification fails
        }

        return NextResponse.json({
          success: true,
          provider: paymentProvider,
          paymentRequestId: result.paymentRequestId,
          message: result.message,
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid payment provider' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Payment checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
