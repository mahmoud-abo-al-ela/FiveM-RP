import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      if (profileError.code === "PGRST116") {
        // ... (profile creation logic)
      }
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }

    // Fetch payments (transactions and requests)
    const [transactionsRes, requestsRes] = await Promise.all([
      supabase
        .from("payment_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("payment_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    const transactions = transactionsRes.data || [];
    const requests = requestsRes.data || [];

    // Fetch item names from store_items table to ensure accuracy
    const allItemIds = [...new Set([
      ...transactions.map(t => t.item_id),
      ...requests.map(r => r.item_id)
    ])].filter(Boolean);

    const { data: storeItems } = await supabase
      .from('store_items')
      .select('id, name')
      .in('id', allItemIds);

    // Combine and standardize
    const payments = [
      ...transactions.map(t => {
        const item = storeItems?.find(si => si.id === t.item_id);
        
        // Robust fallback for metadata (it might be double-stringified in some old records)
        let metadataObj = t.metadata;
        if (typeof metadataObj === 'string') {
          try {
            metadataObj = JSON.parse(metadataObj);
            if (typeof metadataObj === 'string') metadataObj = JSON.parse(metadataObj);
          } catch (e) {
            metadataObj = {};
          }
        }

        return {
          id: `tx_${t.id}`,
          type: "transaction",
          item: item?.name || metadataObj?.itemName || metadataObj?.item_name || `Item #${t.item_id}`,
          amount: t.amount,
          currency: t.currency?.toUpperCase() || "USD",
          status: t.status,
          date: t.created_at,
          method: t.payment_provider
        };
      }),
      ...requests.map(r => {
        const item = storeItems?.find(si => si.id === r.item_id);
        return {
          id: `req_${r.id}`,
          type: "request",
          item: item?.name || r.item_name,
          amount: r.amount_egp,
          currency: "EGP",
          status: r.status,
          date: r.created_at,
          method: r.payment_method
        };
      })
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ ...profile, payments });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { display_name, bio, in_game_name } = body;

    const { data: profile, error: updateError } = await supabase
      .from("users")
      .update({
        display_name,
        bio,
        in_game_name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
