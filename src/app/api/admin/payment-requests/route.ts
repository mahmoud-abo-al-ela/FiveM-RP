import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { approveWalletPayment, rejectWalletPayment } from '@/lib/payments/wallet';

/**
 * GET - Get all payment requests (admin only)
 */
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || userData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get all manual payment requests
    const { data: requests, error: requestsError } = await supabase
      .from('payment_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (requestsError) {
      throw requestsError;
    }

    // Get all automated payment transactions (Stripe)
    const { data: transactions, error: transactionsError } = await supabase
      .from('payment_transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (transactionsError) {
      // Failed silently
    }

    // Fetch user details for both
    const userIds = [...new Set([
      ...(requests || []).map((r) => r.user_id),
      ...(transactions || []).map((t) => t.user_id)
    ])];
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, discord_username, display_name, discord_id')
      .in('id', userIds);

    // Fetch item names for transactions
    const itemIds = [...new Set((transactions || []).map(t => t.item_id))];
    const { data: items } = await supabase
      .from('store_items')
      .select('id, name')
      .in('id', itemIds);

    // Map users to requests
    const enrichedRequests = (requests || []).map((req) => {
      const user = users?.find((u) => u.id === req.user_id);
      return {
        ...req,
        type: 'manual',
        users: user || null,
        display_amount: req.amount_egp,
        display_currency: 'EGP'
      };
    });

    // Map users and items to transactions
    const enrichedTransactions = (transactions || []).map((tx) => {
      const user = users?.find((u) => u.id === tx.user_id);
      
      // Try to find item from store_items first
      const item = items?.find((i) => i.id === tx.item_id);
      
      // Robust fallback for metadata (it might be double-stringified in some old records)
      let metadataObj = tx.metadata;
      if (typeof metadataObj === 'string') {
        try {
          // Attempt to parse if it's a double-stringified JSON
          metadataObj = JSON.parse(metadataObj);
          if (typeof metadataObj === 'string') metadataObj = JSON.parse(metadataObj);
        } catch (e) {
          metadataObj = {};
        }
      }

      const itemName = item?.name || metadataObj?.itemName || metadataObj?.item_name || `Item #${tx.item_id}`;

      return {
        id: tx.id,
        user_id: tx.user_id,
        user_email: user?.discord_username || 'Unknown',
        item_name: itemName,
        amount_usd: tx.amount,
        amount_egp: Math.round(tx.amount * 30.5), // Estimate
        payment_method: tx.payment_provider,
        payment_provider: tx.payment_provider,
        status: tx.status,
        created_at: tx.created_at,
        type: 'automated',
        transaction_id: tx.transaction_id,
        users: user || null,
        display_amount: tx.amount,
        display_currency: tx.currency?.toUpperCase() || 'USD'
      };
    });

    // Combine and sort by date
    const allPayments = [...enrichedRequests, ...enrichedTransactions].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({
      success: true,
      requests: allPayments,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get payment requests' },
      { status: 500 }
    );
  }
}

/**
 * POST - Approve or reject payment request (admin only)
 */
export async function POST(request: Request) {
  try {
    const { action, paymentRequestId, reason } = await request.json();

    if (!action || !paymentRequestId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || userData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Process action
    let result;
    if (action === 'approve') {
      result = await approveWalletPayment(paymentRequestId, user.id);
    } else if (action === 'reject') {
      result = await rejectWalletPayment(paymentRequestId, user.id, reason);
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Payment request ${action}d successfully`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to process action' },
      { status: 500 }
    );
  }
}
