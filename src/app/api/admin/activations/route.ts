import { createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin-auth";

const SELECT_FIELDS =
  "id, display_name, in_game_name, bio, discord_username, discord_avatar, created_at";

async function getSupabase() {
  return createServiceRoleClient();
}

// ---------------------------
// GET: Fetch pending users
// ---------------------------
export async function GET() {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await getSupabase();

    const { data, error } = await supabase
      .from("users")
      .select(SELECT_FIELDS)
      .eq("activated", false)
      .is("rejected_at", null)
      .not("display_name", "is", null)
      .not("in_game_name", "is", null)
      .not("bio", "is", null)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Supabase GET error:", error);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("Server GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Note: Approval/Rejection is now handled through Discord interactions
// See: src/app/api/discord/interactions/route.ts
// See: src/app/api/activation/approve/route.ts
// See: src/app/api/activation/reject/route.ts
