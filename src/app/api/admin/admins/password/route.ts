import { NextResponse } from "next/server";
import { getSupabase, verifyAdminSession, hashPassword } from "@/lib/admin-utils";

export async function PATCH(request: Request) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { adminId, newPassword } = await request.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const supabase = await getSupabase();

    const hashed = hashPassword(newPassword);

    const { error } = await supabase
      .from("admin_users")
      .update({ password: hashed })
      .eq("id", adminId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /admins/password error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
