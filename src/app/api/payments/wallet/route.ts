import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getWalletPaymentInstructions } from '@/lib/payments/wallet';

/**
 * GET - Get wallet payment instructions
 */
export async function GET() {
  try {
    const instructions = getWalletPaymentInstructions();
    
    return NextResponse.json({
      success: true,
      ...instructions,
    });
  } catch (error: any) {
    console.error('Failed to get wallet instructions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get instructions' },
      { status: 500 }
    );
  }
}

/**
 * POST - Get user's payment requests
 */
export async function POST(request: Request) {
  try {
    const { action } = await request.json();

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (action === 'list') {
      // Get user's payment requests
      const { data, error } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return NextResponse.json({
        success: true,
        requests: data,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Wallet payment request error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
