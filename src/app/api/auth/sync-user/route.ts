import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    
    // Verify user is authenticated using their session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use service role client for DB operations to bypass RLS
    // This is required for admin_users and safer for users table
    const adminDb = createServiceRoleClient();

    // Extract Discord data from user metadata
    const metadata = user.user_metadata;
    const discordId = metadata?.provider_id || metadata?.sub;
    const discordUsername = metadata?.custom_claims?.global_name || metadata?.full_name || metadata?.name;
    const discordAvatar = metadata?.avatar_url || metadata?.picture;
    const email = user.email;

    // Check if user already exists
    const { data: existingUser } = await adminDb
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (existingUser) {
      // Update only mutable fields for existing users
      const { error: updateError } = await adminDb
        .from("users")
        .update({
          discord_id: discordId,
          discord_username: discordUsername,
          discord_avatar: discordAvatar,
          // We update email just in case it changed on Discord
          email: email,
          last_login: new Date().toISOString(),
          // DO NOT update role, stats, or display_name (if we want to keep custom names)
          // keeping display_name sync for now as it seemed intended, but definitely preserving role/stats
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("User update error:", updateError);
        // We log but proceed
      }
    } else {
      // Check if this is the FIRST user ever (optional: make them admin?) - skipping for now as per instructions
      // Insert new user with defaults
      const { error: insertError } = await adminDb
        .from("users")
        .insert({
          id: user.id,
          discord_id: discordId,
          discord_username: discordUsername,
          discord_avatar: discordAvatar,
          email: email,
          display_name: discordUsername || email?.split("@")[0] || "User",
          last_login: new Date().toISOString(),
          role: "user",
          playtime_hours: 0,
          level: 1,
          experience_points: 0,
          reputation_score: 0,
        });

      if (insertError) {
        console.error("User insert error:", insertError);
        return NextResponse.json(
          { error: "Failed to create user", details: insertError.message },
          { status: 500 }
        );
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
