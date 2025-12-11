import { createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function GET(request: Request) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const roleFilter = searchParams.get("role");

    let query = supabase
      .from("users")
      .select("id, display_name, in_game_name, activated, level, playtime_hours, discord_username, discord_avatar, created_at")
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`display_name.ilike.%${search}%,in_game_name.ilike.%${search}%`);
    }

    const { data: users, error } = await query;

    if (error) throw error;

    return NextResponse.json(users || []);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    const body = await request.json();
    const { userId, activated } = body;

    const updates: any = {};
    if (activated !== undefined) updates.activated = activated;

    const { error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
