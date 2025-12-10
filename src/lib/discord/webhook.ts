/**
 * Discord Webhook Service
 * Handles webhooks, buttons, DMs, and role assignments.
 * Compatible with serverless environments like Vercel
 */

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  timestamp?: string;
  footer?: {
    text: string;
  };
}

export interface DiscordButton {
  type: 2; // always 2 for buttons
  style: 1 | 2 | 3 | 4 | 5; // 1: primary, 2: secondary, 3: success, 4: danger, 5: link
  label: string;
  custom_id?: string; // required for non-link buttons
  url?: string; // only for link buttons
}

// Universal webhook sender with optional buttons
export async function sendDiscordWebhook(
  webhookUrl: string,
  content?: string,
  embeds?: DiscordEmbed[],
  components?: Array<{ type: 1; components: DiscordButton[] }>
) {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, embeds, components }),
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, id: data.id };
  } catch (error) {
    console.error("Failed to send Discord webhook:", error);
    return { success: false, error };
  }
}

// Send activation request to staff with buttons
export async function sendActivationRequestToStaff(
  characterName: string,
  userId: string,
  discordUserId: string,
  discordUsername: string,
  activationData: { age: number; steamOrEpicLink: string; rpExperience: string }
) {
  const webhookUrl = process.env.DISCORD_STAFF_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("Staff webhook URL not configured");
    return { success: false, reason: "Webhook URL not configured" };
  }

  const embed: DiscordEmbed = {
    title: "📋 New Activation Request",
    description: `<@${discordUserId}> has submitted an activation request`,
    color: 0xffa500,
    fields: [
      { name: "👤 Character Name", value: characterName, inline: true },
      { name: "💬 Discord User", value: discordUsername, inline: true },
      { name: "🎂 Age", value: activationData.age.toString(), inline: true },
      { name: "🎮 Steam/Epic Link", value: activationData.steamOrEpicLink, inline: false },
      {
        name: "📝 RP Experience",
        value:
          activationData.rpExperience.length > 1000
            ? activationData.rpExperience.substring(0, 1000) + "..."
            : activationData.rpExperience,
        inline: false,
      },
      { name: "🆔 User ID", value: userId, inline: false },
    ],
    timestamp: new Date().toISOString(),
    footer: { text: "FiveM Hub Activation System" },
  };

  const components: { type: 1; components: DiscordButton[] }[] = [
  {
    type: 1, // literal 1, not number
    components: [
      { type: 2, style: 3, label: "Approve", custom_id: `approve_${userId}` },
      { type: 2, style: 4, label: "Reject", custom_id: `reject_${userId}` },
    ],
  },
];

  return await sendDiscordWebhook(webhookUrl, `<@${discordUserId}>`, [embed], components);
}

// Send activation success webhook
export async function sendActivationSuccessWebhook(
  characterName: string,
  userId: string,
  discordUsername?: string
) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return { success: false, reason: "Webhook URL not configured" };

  const embed: DiscordEmbed = {
    title: "🎉 Activation Successful!",
    description: "A new user has successfully completed the activation process.",
    color: 0x00ff00,
    fields: [
      { name: "👤 Character Name", value: characterName, inline: true },
      { name: "🆔 User ID", value: userId, inline: true },
    ],
    timestamp: new Date().toISOString(),
    footer: { text: "FiveM Hub Activation System" },
  };

  if (discordUsername) {
    embed.fields?.push({ name: "💬 Discord User", value: discordUsername, inline: true });
  }

  return await sendDiscordWebhook(webhookUrl, undefined, [embed]);
}

// Send DM to a user
export async function sendDirectMessage(userId: string, message: string) {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) throw new Error("DISCORD_BOT_TOKEN is not configured");

  try {
    const dmChannelRes = await fetch("https://discord.com/api/v10/users/@me/channels", {
      method: "POST",
      headers: { Authorization: `Bot ${botToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ recipient_id: userId }),
    });

    if (!dmChannelRes.ok) throw new Error(`Failed to create DM channel: ${dmChannelRes.statusText}`);
    const dmChannel = await dmChannelRes.json();

    const messageRes = await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
      method: "POST",
      headers: { Authorization: `Bot ${botToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    });

    if (!messageRes.ok) throw new Error(`Failed to send DM: ${messageRes.statusText}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to send Discord DM:", error);
    return { success: false, error };
  }
}

// Shortcut functions for approval/rejection DMs
export async function sendActivationDM(discordUserId: string, characterName: string) {
  return await sendDirectMessage(
    discordUserId,
    `🎉 **Congratulations!**\n\nYour activation for **${characterName}** has been successfully completed!\n\nWelcome to the community! 🚀`
  );
}

export async function sendApprovalDM(discordUserId: string, characterName: string) {
  return await sendDirectMessage(
    discordUserId,
    `🎉 **Congratulations!**\n\nYour activation for **${characterName}** has been approved!\n\nYou may now join the FiveM server. 🚀`
  );
}

export async function sendRejectionDM(discordUserId: string, characterName: string, reason: string) {
  return await sendDirectMessage(
    discordUserId,
    `❌ **Activation Request Rejected**\n\nYour activation request for **${characterName}** was rejected.\n\n**Reason:** ${reason}\n\nYou may submit a new request after 24 hours.`
  );
}

// Assign role to user
export async function assignDiscordRole(guildId: string, userId: string, roleId: string) {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) throw new Error("DISCORD_BOT_TOKEN is not configured");

  try {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${roleId}`,
      { method: "PUT", headers: { Authorization: `Bot ${botToken}`, "Content-Type": "application/json" } }
    );

    if (!res.ok) throw new Error(`Failed to assign role: ${res.statusText}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to assign Discord role:", error);
    return { success: false, error };
  }
}
