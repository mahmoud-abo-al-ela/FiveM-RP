import { Client, GatewayIntentBits, TextChannel } from 'discord.js';

let discordClient: Client | null = null;

export async function getDiscordClient() {
  if (discordClient && discordClient.isReady()) {
    return discordClient;
  }

  const token = process.env.DISCORD_BOT_TOKEN;
  
  if (!token) {
    throw new Error('DISCORD_BOT_TOKEN is not configured');
  }

  discordClient = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
    ],
  });

  await discordClient.login(token);

  // Wait for the client to be ready
  await new Promise<void>((resolve) => {
    discordClient!.once('ready', () => {
      console.log(`Discord bot logged in as ${discordClient!.user?.tag}`);
      resolve();
    });
  });

  return discordClient;
}

export async function sendDiscordMessage(channelId: string, message: string) {
  try {
    const client = await getDiscordClient();
    const channel = await client.channels.fetch(channelId);

    if (!channel || !channel.isTextBased()) {
      throw new Error('Invalid channel or channel is not text-based');
    }

    await (channel as TextChannel).send(message);
    return { success: true };
  } catch (error) {
    console.error('Failed to send Discord message:', error);
    throw error;
  }
}

export async function sendActivationSuccessMessage(
  userId: string,
  characterName: string,
  discordUsername?: string
) {
  const channelId = process.env.DISCORD_CHANNEL_ID;
  
  if (!channelId) {
    console.warn('DISCORD_CHANNEL_ID is not configured, skipping Discord notification');
    return { success: false, reason: 'Channel ID not configured' };
  }

  const message = `🎉 **Activation Successful!**\n\n` +
    `**Character Name:** ${characterName}\n` +
    `**Discord User:** ${discordUsername || 'Unknown'}\n` +
    `**User ID:** ${userId}\n\n` +
    `Welcome to the server! Your account has been successfully activated.`;

  try {
    await sendDiscordMessage(channelId, message);
    return { success: true };
  } catch (error) {
    console.error('Failed to send activation message:', error);
    return { success: false, error };
  }
}
