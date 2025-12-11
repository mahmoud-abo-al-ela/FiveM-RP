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
      activeUsersRes,
      pendingRes,
      storeItemsRes,
      availableItemsRes,
    ] = await Promise.all([
      supabase.from("users").select("id", countOptions),
      supabase.from("users").select("id", countOptions).eq("activated", true),
      supabase
        .from("users")
        .select("id", countOptions)
        .eq("activated", false)
        .is("rejected_at", null),
      supabase.from("store_items").select("id", countOptions),
      supabase.from("store_items").select("id", countOptions).eq("available", true),
    ]);

    // Handle any Supabase errors inside Promise.all
    const errors = [
      totalUsersRes.error,
      activeUsersRes.error,
      pendingRes.error,
      storeItemsRes.error,
      availableItemsRes.error,
    ].filter(Boolean);

    if (errors.length > 0) {
      throw errors[0];
    }

    return NextResponse.json({
      totalUsers: totalUsersRes.count ?? 0,
      activeUsers: activeUsersRes.count ?? 0,
      pendingActivations: pendingRes.count ?? 0,
      storeItems: storeItemsRes.count ?? 0,
      availableItems: availableItemsRes.count ?? 0,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
