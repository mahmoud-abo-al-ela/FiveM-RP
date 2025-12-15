import { createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const supabase = createServiceRoleClient();
    const { data: { session }, error: sessionError } = await (await import("@/lib/supabase/server")).createClient().then(client => client.auth.getSession());

    if (sessionError || !session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Verify admin session via users table role
    const { data: admin, error } = await supabase
      .from("users")
      .select("id")
      .eq("id", session.user.id)
      .eq("role", "admin")
      .single();

    if (error || !admin) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ 
      authenticated: true, 
      admin: { id: admin.id } 
    });
  } catch (error) {
    console.error("Admin verify error:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
