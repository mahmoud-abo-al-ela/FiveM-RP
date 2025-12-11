import { createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminSessionId = cookieStore.get("admin_session")?.value;

    if (!adminSessionId) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    // Verify admin session
    const { data: admin, error } = await supabase
      .from("admin_users")
      .select("id, username, email")
      .eq("id", adminSessionId)
      .eq("active", true)
      .single();

    if (error || !admin) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ 
      authenticated: true, 
      admin: { username: admin.username } 
    });
  } catch (error) {
    console.error("Admin verify error:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
