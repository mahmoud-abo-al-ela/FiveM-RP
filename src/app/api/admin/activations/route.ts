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

// ---------------------------
// POST: Approve or Reject User
// ---------------------------
export async function POST(request: Request) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, action } = await request.json();

    // Fast validation
    if (!userId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const supabase = await getSupabase();

    let updatePayload: Record<string, any> = {};

    if (action === "approve") {
      updatePayload = { activated: true, rejected_at: null };
    } else {
      updatePayload = { rejected_at: new Date().toISOString() };
    }

    const { error } = await supabase
      .from("users")
      .update(updatePayload)
      .eq("id", userId);

    if (error) {
      console.error("Supabase POST error:", error);
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Server POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
