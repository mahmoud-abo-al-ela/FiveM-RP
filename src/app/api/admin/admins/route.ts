import { NextResponse } from "next/server";
import { getSupabase, verifyAdminSession, hashPassword } from "@/lib/admin-utils";

// ---------------------------------------
// GET — List admins
// ---------------------------------------
export async function GET() {
  try {
    const admin = await verifyAdminSession();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = await getSupabase();

    const { data, error } = await supabase
      .from("admin_users")
      .select("id, username, email, created_at, last_login, active")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("GET /admins error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ---------------------------------------
// POST — Create admin
// ---------------------------------------
export async function POST(request: Request) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { username, password, email } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const supabase = await getSupabase();

    // Username exists check
    const { data: exists } = await supabase
      .from("admin_users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (exists) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }

    const hashedPassword = hashPassword(password);

    const { error } = await supabase.from("admin_users").insert({
      username,
      password: hashedPassword,
      email: email || null,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /admins error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ---------------------------------------
// PATCH — Activate/Deactivate admin
// ---------------------------------------
export async function PATCH(request: Request) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { adminId, active } = await request.json();

    if (typeof active !== "boolean") {
      return NextResponse.json({ error: "Invalid 'active' value" }, { status: 400 });
    }

    const supabase = await getSupabase();

    const { data: target } = await supabase
      .from("admin_users")
      .select("username")
      .eq("id", adminId)
      .single();

    if (!target) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // Safety rules
    if (target.username === "admin" && active === false) {
      return NextResponse.json(
        { error: 'Cannot deactivate the "admin" account' },
        { status: 400 }
      );
    }

    if (adminId === admin.id && active === false) {
      return NextResponse.json(
        { error: "You cannot deactivate your own account" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("admin_users")
      .update({ active })
      .eq("id", adminId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /admins error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ---------------------------------------
// DELETE — Delete admin user
// ---------------------------------------
export async function DELETE(request: Request) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminId = new URL(request.url).searchParams.get("id");
    if (!adminId) {
      return NextResponse.json({ error: "Missing admin ID" }, { status: 400 });
    }

    const supabase = await getSupabase();

    const { data: target } = await supabase
      .from("admin_users")
      .select("username")
      .eq("id", adminId)
      .single();

    if (!target) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    if (target.username === "admin") {
      return NextResponse.json(
        { error: 'Cannot delete the "admin" account' },
        { status: 400 }
      );
    }

    if (adminId === admin.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("admin_users").delete().eq("id", adminId);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /admins error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
