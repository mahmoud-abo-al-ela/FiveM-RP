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
    throw error;
  }
}

export async function sendDiscordDirectMessage(discordUserId: string, message: string | any) {
  try {
    const client = await getDiscordClient();
    const user = await client.users.fetch(discordUserId);

    if (!user) {
      throw new Error(`Could not find Discord user with ID: ${discordUserId}`);
    }

    await user.send(message);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to send Discord DM:', error);
    return { success: false, error: error.message };
  }
}

export async function sendReceiptMessage({
  discordId,
  itemName,
  price,
  transactionId,
  status,
  method,
}: {
  discordId: string;
  itemName: string;
  price: number;
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  method: string;
}) {
  const statusEmoji = status === 'completed' ? '✅' : status === 'pending' ? '⏳' : '❌';
  const statusText = status.toUpperCase();

  const embed = {
    color: status === 'completed' ? 0x00ff00 : status === 'pending' ? 0xffea00 : 0xff0000,
    title: `${statusEmoji} Payment ${statusText}`,
    description: `Thank you for your purchase from Legacy RP!`,
    fields: [
      { name: 'Item', value: itemName, inline: true },
      { name: 'Price', value: `$${price}`, inline: true },
      { name: 'Method', value: method || 'Manual', inline: true },
      { name: 'Transaction ID', value: `\`${transactionId}\`` },
      { 
        name: 'Status Info', 
        value: status === 'pending' 
          ? 'Your manual payment is being verified by our staff. We will notify you once it is approved!'
          : 'Your transaction has been processed successfully. Your items should be available in-game soon!'
      },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: 'Legacy RP Store • Do not share your transaction ID',
    },
  };

  return sendDiscordDirectMessage(discordId, { embeds: [embed] });
}

export async function sendActivationSuccessMessage(
  userId: string,
  characterName: string,
  discordUsername?: string
) {
  const channelId = process.env.DISCORD_CHANNEL_ID;
  
  if (!channelId) {
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
    return { success: false, error };
  }
}
