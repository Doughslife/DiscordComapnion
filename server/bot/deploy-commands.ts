import { REST, Routes } from "discord.js";
import { commands } from "./commands";

if (!process.env.DISCORD_TOKEN) {
  throw new Error("DISCORD_TOKEN is required");
}

if (!process.env.CLIENT_ID) {
  throw new Error("CLIENT_ID is required");
}

const commandData = Array.from(commands.values()).map(command => {
  console.log(`Registering command: ${command.data.name}`);
  return command.data.toJSON();
});

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

export async function deployCommands() {
  try {
    console.log(`Started refreshing ${commandData.length} application (/) commands.`);
    console.log('Available commands:', commandData.map(cmd => cmd.name).join(', '));

    // Deploy commands globally
    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commandData },
    );

    console.log(`Successfully reloaded ${Array.isArray(data) ? data.length : 0} application (/) commands.`);
  } catch (error) {
    console.error('Error deploying commands:', error);
    throw error; // Re-throw to trigger error handling in index.ts
  }
}