import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract Discord data from user metadata
    const metadata = user.user_metadata;
    const discordId = metadata?.provider_id || metadata?.sub;
    const discordUsername = metadata?.custom_claims?.global_name || metadata?.full_name || metadata?.name;
    const discordAvatar = metadata?.avatar_url || metadata?.picture;
    const email = user.email;

    // Upsert user data into custom users table
    const { error: upsertError } = await supabase
      .from("users")
      .upsert(
        {
          id: user.id,
          discord_id: discordId,
          discord_username: discordUsername,
          discord_avatar: discordAvatar,
          email: email,
          last_login: new Date().toISOString(),
          role: "user",
        },
        {
          onConflict: "id",
        }
      );

    if (upsertError) {
      return NextResponse.json(
        { error: "Failed to sync user data" },
        { status: 500 }
      );
    }

    // Check if user profile exists, create if not
    const { data: existingProfile } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!existingProfile) {
      const { error: profileError } = await supabase
        .from("users")
        .insert({
          id: user.id,
          display_name: discordUsername || email?.split("@")[0] || "User",
          playtime_hours: 0,
          level: 1,
          experience_points: 0,
          reputation_score: 0,
        });

      if (profileError) {
        // Don't fail the request if profile creation fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
