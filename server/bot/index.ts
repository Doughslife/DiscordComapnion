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
    GatewayIntentBits.MessageContent
  ]
});

// Deploy commands first
deployCommands().then(() => {
  // Register commands and events after deployment
  registerCommands(client);
  registerEvents(client);

  client.login(process.env.DISCORD_TOKEN);
}).catch(error => {
  console.error("Failed to deploy commands:", error);
  process.exit(1);
});

export default client;