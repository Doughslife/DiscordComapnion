import { SlashCommandBuilder } from "discord.js";
import { storage } from "../../storage";

export const moderationCommands = [
  {
    data: new SlashCommandBuilder()
      .setName("warn")
      .setDescription("Warn a user")
      .addUserOption(option => 
        option.setName("user")
          .setDescription("The user to warn")
          .setRequired(true)
      )
      .addStringOption(option =>
        option.setName("reason")
          .setDescription("Reason for warning")
          .setRequired(true)
      ),
      
    async execute(interaction: any) {
      if (!interaction.member.permissions.has("MODERATE_MEMBERS")) {
        return interaction.reply({
          content: "You don't have permission to use this command",
          ephemeral: true
        });
      }
      
      const user = interaction.options.getUser("user");
      const reason = interaction.options.getString("reason");
      
      const warned = await storage.addWarning(user.id);
      
      await interaction.reply({
        content: `Warned ${user.tag} (${warned.warnings} warnings total)\nReason: ${reason}`,
        ephemeral: true
      });
    }
  },
  
  {
    data: new SlashCommandBuilder()
      .setName("modtoggle")
      .setDescription("Toggle auto-moderation for this server"),
      
    async execute(interaction: any) {
      if (!interaction.member.permissions.has("MANAGE_GUILD")) {
        return interaction.reply({
          content: "You don't have permission to use this command",
          ephemeral: true
        });
      }
      
      const settings = await storage.getGuildSettings(interaction.guildId);
      if (!settings) {
        await storage.setGuildSettings({
          guildId: interaction.guildId,
          moderationEnabled: 1
        });
        return interaction.reply("Auto-moderation enabled");
      }
      
      await storage.setGuildSettings({
        ...settings,
        moderationEnabled: settings.moderationEnabled ? 0 : 1
      });
      
      await interaction.reply(`Auto-moderation ${settings.moderationEnabled ? 'disabled' : 'enabled'}`);
    }
  }
];
