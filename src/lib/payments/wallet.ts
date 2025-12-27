/**
 * Wallet/Cash Payment System for Egyptian Users
 * This handles manual payment verification for wallet transfers and cash payments
 */

import { createClient } from '@/lib/supabase/server';

export interface WalletPaymentRequest {
  itemId: number;
  itemName: string;
  price: number;
  userId: string;
  userEmail: string;
  paymentMethod: 'wallet' | 'instapay';
  walletNumber: string; // User's wallet number
  paymentProofUrl: string; // Required: URL of uploaded payment proof screenshot
  notes?: string;
}

export interface WalletPaymentResponse {
  success: boolean;
  paymentRequestId?: number;
  error?: string;
  message?: string;
}

/**
 * Create a wallet/cash payment request that requires admin approval
 */
export async function createWalletPaymentRequest(
  params: WalletPaymentRequest
): Promise<WalletPaymentResponse> {
  const {
    itemId,
    itemName,
    price,
    userId,
    userEmail,
    paymentMethod,
    walletNumber,
    paymentProofUrl,
    notes,
  } = params;

  try {
    // Convert USD to EGP
    const priceInEGP = Math.round(price * 30.5);

    const supabase = await createClient();

    // Create a payment request in the database
    const { data, error } = await supabase
      .from('payment_requests')
      .insert({
        user_id: userId,
        user_email: userEmail,
        item_id: itemId,
        item_name: itemName,
        amount_usd: price,
        amount_egp: priceInEGP,
        payment_method: paymentMethod,
        payment_provider: paymentMethod,
        wallet_number: walletNumber,
        payment_proof_url: paymentProofUrl,
        notes: notes,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      paymentRequestId: data.id,
      message: 'Payment request submitted successfully. Please wait for admin approval.',
    };
  } catch (error: any) {
    console.error('Wallet payment request creation failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to create payment request',
    };
  }
}

/**
 * Approve a wallet/cash payment request (admin only)
 */
export async function approveWalletPayment(
  paymentRequestId: number,
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Update payment request status
    const { data: request, error: updateError } = await supabase
      .from('payment_requests')
      .update({
        status: 'approved',
        approved_by: adminId,
        approved_at: new Date().toISOString(),
      })
      .eq('id', paymentRequestId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Notify user via Discord
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('discord_id')
        .eq('id', request.user_id)
        .single();

      if (userData?.discord_id) {
        const { sendReceiptMessage } = await import('@/lib/discord/client');
        await sendReceiptMessage({
          discordId: userData.discord_id,
          itemName: request.item_name,
          price: request.amount_usd,
          transactionId: request.id.toString(),
          status: 'completed',
          method: request.payment_method === 'wallet' ? 'Vodafone Cash' : 'InstaPay',
        });
      }
    } catch (notifyError) {
      console.error('Failed to send approval notification:', notifyError);
      // Determine if we should treat this as a critical failure.
      // Usually, notification failure shouldn't rollback the approval.
    }

    return { success: true };
  } catch (error: any) {
    console.error('Wallet payment approval failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to approve payment',
    };
  }
}

/**
 * Reject a wallet/cash payment request (admin only)
 */
export async function rejectWalletPayment(
  paymentRequestId: number,
  adminId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error: updateError } = await supabase
      .from('payment_requests')
      .update({
        status: 'rejected',
        rejected_by: adminId,
        rejected_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq('id', paymentRequestId);

    if (updateError) {
      throw updateError;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Wallet payment rejection failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to reject payment',
    };
  }
}

/**
 * Get manual payment instructions for Egyptian users
 */
export function getWalletPaymentInstructions(): {
  walletNumbers: string[];
  instaPayId?: string;
  instructions: string[];
} {
  return {
    walletNumbers: [
      process.env.VODAFONE_CASH_NUMBER || '01XXXXXXXXX',
    ],
    instaPayId: process.env.INSTAPAY_ID || 'your-username@instapay',
    instructions: [
      'Transfer the exact amount to the provided account/number',
      'Take a screenshot of the successful transfer',
      'Upload the screenshot and enter the number you sent from',
      'Wait for admin approval (usually within 24 hours)',
      'Your item will be delivered once payment is verified',
    ],
  };
}
