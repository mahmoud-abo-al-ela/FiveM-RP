import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { sendActivationRequestToStaff } from "@/lib/discord/webhook";

const activationSchema = z.object({
  characterName: z
    .string()
    .min(3, "Character name must be at least 3 characters")
    .max(50, "Character name must be less than 50 characters")
    .regex(/^[\p{L}\p{M}]+ [\p{L}\p{M}]+$/u, "Character name must be in format: FirstName LastName"),
  age: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(13, "You must be at least 13 years old").max(100, "Invalid age")),
  steamOrEpicLink: z
    .string()
    .min(1, "Steam or Epic link is required")
    .refine(
      (url) => {
        try {
          new URL(url);
          return url.includes("steamcommunity.com") ||
            url.includes("store.steampowered.com") ||
            url.includes("epicgames.com");
        } catch {
          return false;
        }
      },
      "Must be a valid Steam or Epic Games profile link"
    ),
  rpExperience: z
    .string()
    .min(30, "Please provide at least 50 characters describing your RP experience")
    .max(1000, "RP experience description is too long"),
  agreeToRules: z.boolean().refine((val) => val === true, "You must agree to the server rules"),
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms of service"),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate with Zod
    const validation = activationSchema.safeParse(body);
    
    if (!validation.success) {
      const errors = validation.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const { characterName, age, steamOrEpicLink, rpExperience } = validation.data;

    // Get Discord info from user metadata
    const discordId = user.user_metadata?.provider_id || user.user_metadata?.sub;
    const discordUsername = user.user_metadata?.full_name || user.user_metadata?.user_name || 'Unknown';

    if (!discordId) {
      return NextResponse.json(
        { error: "Discord ID not found. Please sign in with Discord." },
        { status: 400 }
      );
    }

    // Store activation request data (not activated yet)
    const activationRequestData = {
      characterName,
      age,
      steamOrEpicLink,
      rpExperience,
      discordId,
      discordUsername,
      submittedAt: new Date().toISOString(),
    };

    // Update or create user profile with pending activation
    const { error: profileError } = await supabase
      .from("users")
      .upsert({
        id: user.id,
        display_name: characterName,
        in_game_name: characterName,
        bio: rpExperience,
        activated: false, // Not activated yet - waiting for staff approval
        activation_request_data: activationRequestData,
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    // Update user info
    const { error: userError } = await supabase
      .from("users")
      .update({ 
        role: "user",
        last_login: new Date().toISOString()
      })
      .eq("id", user.id);

    // Store Steam/Epic link in user metadata
    await supabase.auth.updateUser({
      data: { steam_or_epic_link: steamOrEpicLink }
    });

    if (userError) {
      // User update error
    }

    // Send activation request to staff Discord channel
    try {
      const result = await sendActivationRequestToStaff(
        characterName,
        user.id,
        discordId,
        discordUsername,
        {
          age,
          steamOrEpicLink,
          rpExperience,
        }
      );

      // Store Discord message ID for later reference
      if (result.success && result.id) {
        await supabase
          .from("users")
          .update({ discord_message_id: result.id })
          .eq("id", user.id);
      }
    } catch (discordError) {
      // Don't fail the activation if Discord notification fails
    }

    return NextResponse.json({ 
      success: true,
      message: "Activation request submitted! Staff will review your request shortly."
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
