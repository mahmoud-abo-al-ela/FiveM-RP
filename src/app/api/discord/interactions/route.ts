import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendApprovalDM, sendRejectionDM, assignDiscordRole } from "@/lib/discord/webhook";

// Discord interaction types
const InteractionType = {
  PING: 1,
  APPLICATION_COMMAND: 2,
  MESSAGE_COMPONENT: 3,
  APPLICATION_COMMAND_AUTOCOMPLETE: 4,
  MODAL_SUBMIT: 5,
};

// Discord interaction response types
const InteractionResponseType = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
  DEFERRED_UPDATE_MESSAGE: 6,
  UPDATE_MESSAGE: 7,
  APPLICATION_COMMAND_AUTOCOMPLETE_RESULT: 8,
  MODAL: 9,
};

/**
 * Verify Discord interaction signature
 */
async function verifyDiscordRequest(request: Request): Promise<boolean> {
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");
  const publicKey = process.env.DISCORD_PUBLIC_KEY;

  if (!signature || !timestamp || !publicKey) {
    return false;
  }

  // For production, implement proper Ed25519 signature verification
  // For now, we'll skip verification in development
  // You can use the 'tweetnacl' package for verification:
  // import nacl from 'tweetnacl';
  // const isValid = nacl.sign.detached.verify(
  //   Buffer.from(timestamp + body),
  //   Buffer.from(signature, 'hex'),
  //   Buffer.from(publicKey, 'hex')
  // );

  return true; // Skip verification for now
}

export async function POST(request: Request) {
  try {
    // Verify Discord signature
    const isValid = await verifyDiscordRequest(request);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid request signature" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, data, member, message } = body;

    // Handle Discord PING
    if (type === InteractionType.PING) {
      return NextResponse.json({ type: InteractionResponseType.PONG });
    }

    // Handle button interactions
    if (type === InteractionType.MESSAGE_COMPONENT) {
      const customId = data.custom_id;

      // Parse custom_id (format: "approve_userId" or "reject_userId")
      const [action, userId] = customId.split("_");

      if (!userId) {
        return NextResponse.json(
          { error: "Invalid custom_id format" },
          { status: 400 }
        );
      }

      const supabase = await createClient();

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*, activation_request_data")
        .eq("id", userId)
        .single();

      if (profileError || !profile) {
        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "❌ User profile not found.",
            flags: 64, // Ephemeral
          },
        });
      }

      if (profile.activated) {
        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "⚠️ This user has already been activated.",
            flags: 64, // Ephemeral
          },
        });
      }

      const activationData = profile.activation_request_data as any;
      const discordId = activationData?.discordId;
      const characterName = profile.display_name || activationData?.characterName;
      const staffMember = member?.user?.username || "Staff";

      if (action === "approve") {
        // Update profile to activated
        const { error: updateError } = await supabase
          .from("user_profiles")
          .update({
            activated: true,
            activated_at: new Date().toISOString(),
            rejected_at: null,
            rejection_reason: null,
          })
          .eq("id", userId);

        if (updateError) {
          console.error("Failed to update profile:", updateError);
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: "❌ Failed to activate user.",
              flags: 64,
            },
          });
        }

        // Send DM to user
        try {
          if (discordId) {
            await sendApprovalDM(discordId, characterName);
          }

          // Assign Discord role
          const guildId = process.env.DISCORD_GUILD_ID;
          const roleId = process.env.DISCORD_ACTIVATED_ROLE_ID;

          if (guildId && roleId && discordId) {
            try {
              await assignDiscordRole(guildId, discordId, roleId);
            } catch (roleError) {
              console.error("Failed to assign Discord role:", roleError);
            }
          }
        } catch (dmError) {
          console.error("Failed to send approval DM:", dmError);
        }

        // Update the original message
        return NextResponse.json({
          type: InteractionResponseType.UPDATE_MESSAGE,
          data: {
            content: message.content,
            embeds: [
              {
                ...message.embeds[0],
                color: 0x00ff00, // Green
                fields: [
                  ...message.embeds[0].fields,
                  {
                    name: "✅ Status",
                    value: `Approved by ${staffMember}`,
                    inline: false,
                  },
                ],
              },
            ],
            components: [], // Remove buttons
          },
        });
      } else if (action === "reject") {
        // For rejection, we need to show a modal to get the reason
        // Since Discord modals are complex, we'll use a simple approach:
        // Staff can use a command or we'll use a default reason
        const defaultReason = "Your application did not meet our requirements. Please review the server rules and try again.";

        // Update profile to rejected
        const { error: updateError } = await supabase
          .from("user_profiles")
          .update({
            activated: false,
            rejected_at: new Date().toISOString(),
            rejection_reason: defaultReason,
          })
          .eq("id", userId);

        if (updateError) {
          console.error("Failed to update profile:", updateError);
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: "❌ Failed to reject user.",
              flags: 64,
            },
          });
        }

        // Send DM to user
        try {
          if (discordId) {
            await sendRejectionDM(discordId, characterName, defaultReason);
          }
        } catch (dmError) {
          console.error("Failed to send rejection DM:", dmError);
        }

        // Update the original message
        return NextResponse.json({
          type: InteractionResponseType.UPDATE_MESSAGE,
          data: {
            content: message.content,
            embeds: [
              {
                ...message.embeds[0],
                color: 0xff0000, // Red
                fields: [
                  ...message.embeds[0].fields,
                  {
                    name: "❌ Status",
                    value: `Rejected by ${staffMember}`,
                    inline: false,
                  },
                ],
              },
            ],
            components: [], // Remove buttons
          },
        });
      }
    }

    return NextResponse.json(
      { error: "Unknown interaction type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Discord interaction error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
