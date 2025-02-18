import { REST, Routes } from "discord.js";
import { commands } from "./commands";

if (!process.env.DISCORD_TOKEN) {
  throw new Error("DISCORD_TOKEN is required");
}

const commandData = Array.from(commands.values()).map(command => command.data.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

export async function deployCommands() {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID ?? ''),
      { body: commandData },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
}
