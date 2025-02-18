import { Client, GatewayIntentBits } from "discord.js";
import { registerCommands } from "./commands";
import { registerEvents } from "./events";

if (!process.env.DISCORD_TOKEN) {
  throw new Error("DISCORD_TOKEN is required");
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ]
});

// Register commands and events
registerCommands(client);
registerEvents(client);

client.login(process.env.DISCORD_TOKEN);

export default client;
