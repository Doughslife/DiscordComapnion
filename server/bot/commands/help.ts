import { SlashCommandBuilder } from "discord.js";
import { commands } from "./index";
import { HelpMenu } from "./help/menu";

export const helpCommand = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows an interactive help menu with all available commands"),

  async execute(interaction: any) {
    const menu = new HelpMenu(commands);
    await menu.start(interaction);
  }
};