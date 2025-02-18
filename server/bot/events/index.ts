import { Client } from "discord.js";
import { setupWelcomeSystem } from "./welcome";
import { setupLevelSystem } from "./levels";

export function registerEvents(client: Client) {
  setupWelcomeSystem(client);
  setupLevelSystem(client);
  
  // Log when bot is ready
  client.once("ready", () => {
    console.log(`Logged in as ${client.user?.tag}!`);
  });
}
