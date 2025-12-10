import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has a profile
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("id, display_name, in_game_name")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Profile check error:", profileError);
      return NextResponse.json(
        { error: "Failed to check profile" },
        { status: 500 }
      );
    }

    // User has profile if display_name and in_game_name are set
    const hasProfile = profile && profile.display_name && profile.in_game_name;

    return NextResponse.json({ hasProfile: !!hasProfile });
  } catch (error) {
    console.error("Profile check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
