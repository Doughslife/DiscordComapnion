import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { commands } from "./index";

export const helpCommand = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Lists all available commands"),
    
  async execute(interaction: any) {
    const embed = new EmbedBuilder()
      .setTitle("Available Commands")
      .setColor("#0099ff");
      
    const commandList = Array.from(commands.values());
    
    // Group commands by category
    const categories = {
      Moderation: commandList.filter(cmd => cmd.data.name.startsWith("mod")),
      Custom: commandList.filter(cmd => cmd.data.name.startsWith("custom")),
      General: commandList.filter(cmd => !cmd.data.name.startsWith("mod") && !cmd.data.name.startsWith("custom"))
    };
    
    Object.entries(categories).forEach(([category, cmds]) => {
      if (cmds.length > 0) {
        embed.addFields({
          name: category,
          value: cmds.map(cmd => `\`/${cmd.data.name}\` - ${cmd.data.description}`).join('\n')
        });
      }
    });
    
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
