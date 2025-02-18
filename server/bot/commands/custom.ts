import { SlashCommandBuilder } from "discord.js";
import { storage } from "../../storage";
import type { Command } from "./index";

export const customCommands: Command[] = [
  {
    data: new SlashCommandBuilder()
      .setName("addcmd")
      .setDescription("Add a custom command")
      .addStringOption(option => 
        option.setName("name")
          .setDescription("Command name")
          .setRequired(true)
      )
      .addStringOption(option =>
        option.setName("response")
          .setDescription("Command response")
          .setRequired(true)
      ),

    async execute(interaction) {
      if (!interaction.member?.permissions.has("MANAGE_GUILD")) {
        return interaction.reply({
          content: "You don't have permission to use this command",
          ephemeral: true
        });
      }

      const name = interaction.options.getString("name");
      const response = interaction.options.getString("response");

      await storage.createCommand({
        name,
        response,
        createdBy: interaction.user.id
      });

      await interaction.reply(`Custom command \`${name}\` created!`);
    }
  },

  {
    data: new SlashCommandBuilder()
      .setName("delcmd")
      .setDescription("Delete a custom command")
      .addStringOption(option =>
        option.setName("name")
          .setDescription("Command name")
          .setRequired(true)
      ),

    async execute(interaction) {
      if (!interaction.member?.permissions.has("MANAGE_GUILD")) {
        return interaction.reply({
          content: "You don't have permission to use this command",
          ephemeral: true
        });
      }

      const name = interaction.options.getString("name");
      await storage.deleteCommand(name);

      await interaction.reply(`Custom command \`${name}\` deleted!`);
    }
  }
];