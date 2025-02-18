import { Client, Collection, SlashCommandBuilder, CommandInteraction } from "discord.js";
import { helpCommand } from "./help";
import { moderationCommands } from "./moderation";
import { customCommands } from "./custom";
import { roleCommands } from "./roles";

export interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction) => Promise<void>;
}

// Create a collection to store all commands
export const commands = new Collection<string, Command>();

// Register all commands
export function registerCommands(client: Client) {
  // Core commands
  commands.set("help", helpCommand);

  // Moderation commands
  moderationCommands.forEach((command) => {
    commands.set(command.data.name, command);
  });

  // Custom commands handler
  customCommands.forEach((command) => {
    commands.set(command.data.name, command);
  });

  // Role commands
  roleCommands.forEach((command) => {
    commands.set(command.data.name, command);
  });

  // Log registered commands
  console.log("Registered commands:", Array.from(commands.keys()));

  // Register with Discord
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error executing this command!",
        ephemeral: true
      });
    }
  });
}