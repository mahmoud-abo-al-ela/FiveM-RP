import { createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function GET() {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    const countOptions: { count: "exact"; head: true } = { count: "exact", head: true };

    const [
      totalUsersRes,
      totalAdminsRes,
      activeUsersRes,
      pendingRes,
      storeItemsRes,
      availableItemsRes,
      pendingPaymentsRes,
    ] = await Promise.all([
      supabase.from("users").select("id", countOptions).eq("role", "user"),
      supabase.from("users").select("id", countOptions).eq("role", "admin"),
      supabase.from("users").select("id", countOptions).eq("activated", true).eq("role", "user"),
      supabase
        .from("users")
        .select("id", countOptions)
        .eq("activated", false)
        .is("rejected_at", null)
        .not("display_name", "is", null)
        .not("in_game_name", "is", null)
        .not("bio", "is", null),
      supabase.from("store_items").select("id", countOptions),
      supabase.from("store_items").select("id", countOptions).eq("available", true),
      supabase.from("payment_requests").select("id", countOptions).eq("status", "pending"),
    ]);

    // Handle any Supabase errors inside Promise.all
    const errors = [
      totalUsersRes.error,
      totalAdminsRes.error,
      activeUsersRes.error,
      pendingRes.error,
      storeItemsRes.error,
      availableItemsRes.error,
      pendingPaymentsRes.error,
    ].filter(Boolean);

    if (errors.length > 0) {
      throw errors[0];
    }

    return NextResponse.json({
      totalUsers: totalUsersRes.count ?? 0,
      totalAdmins: totalAdminsRes.count ?? 0,
      activeUsers: activeUsersRes.count ?? 0,
      pendingActivations: pendingRes.count ?? 0,
      storeItems: storeItemsRes.count ?? 0,
      availableItems: availableItemsRes.count ?? 0,
      pendingPayments: pendingPaymentsRes.count ?? 0,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
