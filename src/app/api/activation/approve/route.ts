import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendApprovalDM, assignDiscordRole } from "@/lib/discord/webhook";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // Check if user is authenticated and is staff/admin
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // TODO: Add staff role check here
    // const { data: userData } = await supabase
    //   .from("users")
    //   .select("role")
    //   .eq("id", user.id)
    //   .single();
    // 
    // if (userData?.role !== "admin" && userData?.role !== "staff") {
    //   return NextResponse.json(
    //     { error: "Forbidden - Staff access required" },
    //     { status: 403 }
    //   );
    // }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user profile with activation request data
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*, activation_request_data")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    if (profile.activated) {
      return NextResponse.json(
        { error: "User is already activated" },
        { status: 400 }
      );
    }

    // Update profile to activated
    const { error: updateError } = await supabase
      .from("users")
      .update({
        activated: true,
        activated_at: new Date().toISOString(),
        rejected_at: null,
        rejection_reason: null,
      })
      .eq("id", userId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to activate user" },
        { status: 500 }
      );
    }

    // Send DM to user
    try {
      const activationData = profile.activation_request_data as any;
      const discordId = activationData?.discordId;
      const characterName = profile.display_name || activationData?.characterName;

      if (discordId) {
        await sendApprovalDM(discordId, characterName);
      }

      // Assign Discord role (optional - requires bot token and guild/role IDs)
      const guildId = process.env.DISCORD_GUILD_ID;
      const roleId = process.env.DISCORD_ACTIVATED_ROLE_ID;

      if (guildId && roleId && discordId) {
        try {
          await assignDiscordRole(guildId, discordId, roleId);
        } catch (roleError) {
          // Don't fail the approval if role assignment fails
        }
      }
    } catch (dmError) {
      // Don't fail the approval if DM fails
    }

    return NextResponse.json({ 
      success: true,
      message: "User activated successfully"
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
