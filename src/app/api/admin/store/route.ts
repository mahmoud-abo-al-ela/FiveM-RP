import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/admin-auth";

// Utility to get Supabase client
const getDb = () => createServiceRoleClient();

// --------------------------------------------------
// GET — Fetch all items
// --------------------------------------------------
export async function GET() {
  try {
    const admin = await verifyAdminSession();
    if (!admin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = getDb();

    const { data, error } = await supabase
      .from("store_items")
      .select("*") // Select all fields to ensure frontend has everything it needs
      .order("id", { ascending: true });

    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("GET /store error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// --------------------------------------------------
// POST — Create item
// --------------------------------------------------
export async function POST(request: Request) {
  try {
    const admin = await verifyAdminSession();
    if (!admin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    // Basic safety validation
    if (!body?.name || !body?.price) {
      return NextResponse.json(
        { error: "Missing required fields: name, price" },
        { status: 400 }
      );
    }

    const supabase = getDb();

    const { error } = await supabase.from("store_items").insert(body);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /store error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// --------------------------------------------------
// PATCH — Update item
// --------------------------------------------------
export async function PATCH(request: Request) {
  try {
    const admin = await verifyAdminSession();
    if (!admin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No update fields provided" },
        { status: 400 }
      );
    }

    const supabase = getDb();

    const { error } = await supabase
      .from("store_items")
      .update(updates)
      .eq("id", id)
      .select("id")
      .single(); // ensures exactly 1 row is updated

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /store error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// --------------------------------------------------
// DELETE — Delete item
// --------------------------------------------------
export async function DELETE(request: Request) {
  try {
    const admin = await verifyAdminSession();
    if (!admin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = new URL(request.url).searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    const supabase = getDb();

    const { error } = await supabase.from("store_items").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /store error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
