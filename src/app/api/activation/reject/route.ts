import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendRejectionDM } from "@/lib/discord/webhook";

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
    const { userId, reason } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: "Rejection reason is required" },
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

    // Update profile to rejected
    const { error: updateError } = await supabase
      .from("users")
      .update({
        activated: false,
        rejected_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq("id", userId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to reject user" },
        { status: 500 }
      );
    }

    // Send DM to user
    try {
      const activationData = profile.activation_request_data as any;
      const discordId = activationData?.discordId;
      const characterName = profile.display_name || activationData?.characterName;

      if (discordId) {
        await sendRejectionDM(discordId, characterName, reason);
      }
    } catch (dmError) {
      // Don't fail the rejection if DM fails
    }

    return NextResponse.json({ 
      success: true,
      message: "User rejected successfully"
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
