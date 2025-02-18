import { REST, Routes } from "discord.js";
import { commands } from "./commands";

if (!process.env.DISCORD_TOKEN) {
  throw new Error("DISCORD_TOKEN is required");
}

if (!process.env.CLIENT_ID) {
  throw new Error("CLIENT_ID is required");
}

export async function deployCommands() {
  try {
    // Convert commands to JSON payload
    const commandsArray = Array.from(commands.values()).map(command => command.data.toJSON());

    console.log("Commands to deploy:", commandsArray.map(cmd => cmd.name));

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    console.log(`Started refreshing ${commandsArray.length} application (/) commands.`);

    // Deploy commands globally
    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commandsArray },
    );

    console.log(`Successfully reloaded ${Array.isArray(data) ? data.length : 0} application (/) commands.`);
  } catch (error) {
    console.error('Error deploying commands:', error);
    throw error;
  }
}