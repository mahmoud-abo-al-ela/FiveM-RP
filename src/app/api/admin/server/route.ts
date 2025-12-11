import { createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin-auth";

interface ServerStatusPayload {
  id?: number;
  online: boolean;
  current_players: number;
  max_players: number;
  ping: number;
  uptime_seconds?: number;
  updated_at?: string;
}

/* GET latest server status */
export async function GET() {
  try {
    const admin = await verifyAdminSession();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from("server_status")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json(
      data ?? {
        id: 0,
        online: true,
        current_players: 0,
        max_players: 200,
        ping: 0,
        uptime_seconds: 0,
        updated_at: new Date().toISOString(),
      }
    );
  } catch (error) {
    console.error("GET server status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* PATCH / upsert server status */
export async function PATCH(request: Request) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createServiceRoleClient();
    const body: ServerStatusPayload = await request.json();

    if (body.current_players < 0 || body.max_players < 1 || body.ping < 0) {
      return NextResponse.json({ error: "Invalid server status values" }, { status: 400 });
    }

    const payload: ServerStatusPayload = {
      ...body,
      updated_at: new Date().toISOString(),
      uptime_seconds: body.uptime_seconds ?? 0,
    };

    const { error } = await supabase
      .from("server_status")
      .upsert(payload, { onConflict: "id" });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH server status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
