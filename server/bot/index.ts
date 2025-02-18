import { Client, GatewayIntentBits } from "discord.js";
import { registerCommands } from "./commands";
import { registerEvents } from "./events";
import { deployCommands } from "./deploy-commands";

if (!process.env.DISCORD_TOKEN) {
  throw new Error("DISCORD_TOKEN is required");
}

if (!process.env.CLIENT_ID) {
  throw new Error("CLIENT_ID is required");
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ]
});

async function initializeBot() {
  try {
    // Register command handlers first
    console.log('Registering command handlers...');
    registerCommands(client);
    registerEvents(client);

    // Then deploy commands
    console.log('Deploying commands...');
    await deployCommands();

    // Finally login
    console.log('Logging in to Discord...');
    await client.login(process.env.DISCORD_TOKEN);

  } catch (error) {
    console.error('Failed to initialize bot:', error);
    process.exit(1);
  }
}

// Initialize the bot
initializeBot();

export default client;