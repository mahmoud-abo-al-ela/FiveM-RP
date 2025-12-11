import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "playtime";
    const limit = parseInt(searchParams.get("limit") || "10");

    const supabase = await createClient();
    
    const { data: leaderboard, error } = await supabase
      .from("leaderboard")
      .select(`
        *,
        user:users!leaderboard_user_id_fkey(
          discord_username,
          discord_avatar
        ),
        profile:users!leaderboard_user_id_fkey(
          display_name,
          level
        )
      `)
      .eq("category", category)
      .order("rank", { ascending: true })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(leaderboard);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
