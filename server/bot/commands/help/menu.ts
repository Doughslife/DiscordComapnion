import { EmbedBuilder, Message, MessageReaction, User, CommandInteraction } from "discord.js";
import type { Command } from "../index";

export class HelpMenu {
  private pages: EmbedBuilder[];
  private currentPage: number;
  private message: Message | null;
  private collector: any;
  private commands: Map<string, Command>;

  constructor(commands: Map<string, Command>) {
    this.commands = commands;
    this.pages = [];
    this.currentPage = 0;
    this.message = null;
    this.createPages();
  }

  private createPages() {
    // Organize commands by category
    const categories = {
      "🛡️ Moderation": Array.from(this.commands.values()).filter(cmd => 
        cmd.data.name.startsWith("mod") || cmd.data.name === "warn"
      ),
      "⚙️ Custom Commands": Array.from(this.commands.values()).filter(cmd => 
        cmd.data.name.startsWith("addcmd") || cmd.data.name.startsWith("delcmd")
      ),
      "ℹ️ General": Array.from(this.commands.values()).filter(cmd => 
        !cmd.data.name.startsWith("mod") && 
        !cmd.data.name.startsWith("add") && 
        !cmd.data.name === "warn"
      ),
    };

    // Create embeds for each category
    this.pages = Object.entries(categories).map(([category, cmds], index) => {
      const embed = new EmbedBuilder()
        .setTitle(`${category} Commands`)
        .setColor("#0099ff")
        .setDescription(
          cmds.length > 0
            ? cmds.map(cmd => `\`/${cmd.data.name}\` - ${cmd.data.description}`).join('\n')
            : "*No commands in this category*"
        )
        .setFooter({ 
          text: `Page ${index + 1}/${Object.keys(categories).length} • Use ⬅️ ➡️ to navigate • ❌ to close` 
        });

      return embed;
    });
  }

  public async start(interaction: CommandInteraction) {
    try {
      // Send initial embed
      const reply = await interaction.reply({ 
        embeds: [this.pages[0]], 
        fetchReply: true 
      });

      if (!(reply instanceof Message)) {
        throw new Error("Failed to send help menu");
      }

      this.message = reply;

      // Add navigation reactions
      await Promise.all([
        reply.react('⬅️'),
        reply.react('➡️'),
        reply.react('❌')
      ]);

      // Create reaction collector
      this.collector = reply.createReactionCollector({
        filter: (_: MessageReaction, user: User) => user.id === interaction.user.id,
        time: 300000 // 5 minutes
      });

      // Handle reactions
      this.collector.on('collect', async (reaction: MessageReaction) => {
        // Remove user's reaction
        await reaction.users.remove(interaction.user.id).catch(() => {});

        switch (reaction.emoji.name) {
          case '⬅️':
            this.currentPage = (this.currentPage - 1 + this.pages.length) % this.pages.length;
            break;
          case '➡️':
            this.currentPage = (this.currentPage + 1) % this.pages.length;
            break;
          case '❌':
            await this.close();
            return;
        }

        if (this.message && !this.message.deleted) {
          await this.message.edit({ embeds: [this.pages[this.currentPage]] });
        }
      });

      // Handle menu timeout
      this.collector.on('end', () => this.close());

    } catch (error) {
      console.error('Error in help menu:', error);
      if (!interaction.replied) {
        await interaction.reply({
          content: 'There was an error showing the help menu. Please try again later.',
          ephemeral: true
        });
      }
    }
  }

  private async close() {
    if (this.message && !this.message.deleted) {
      await this.message.delete().catch(() => {});
    }
    if (this.collector) {
      this.collector.stop();
    }
  }
}