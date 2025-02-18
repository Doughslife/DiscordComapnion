import { EmbedBuilder, Message, MessageReaction, User } from "discord.js";
import { Command } from "../index";

export class HelpMenu {
  private pages: EmbedBuilder[];
  private currentPage: number;
  private message: Message | null;
  private collector: any;

  constructor(commands: Map<string, Command>) {
    this.pages = this.createPages(commands);
    this.currentPage = 0;
    this.message = null;
  }

  private createPages(commands: Map<string, Command>): EmbedBuilder[] {
    const commandList = Array.from(commands.values());
    const categories = {
      Moderation: commandList.filter(cmd => cmd.data.name.startsWith("mod")),
      Custom: commandList.filter(cmd => cmd.data.name.startsWith("custom")),
      General: commandList.filter(cmd => !cmd.data.name.startsWith("mod") && !cmd.data.name.startsWith("custom"))
    };

    return Object.entries(categories).map(([category, cmds], index) => {
      const embed = new EmbedBuilder()
        .setTitle(`${category} Commands`)
        .setColor("#0099ff")
        .setFooter({ text: `Page ${index + 1}/${Object.keys(categories).length}` });

      if (cmds.length > 0) {
        embed.setDescription(
          cmds.map(cmd => `\`/${cmd.data.name}\` - ${cmd.data.description}`).join('\n')
        );
      } else {
        embed.setDescription("No commands in this category");
      }

      return embed;
    });
  }

  public async start(interaction: any) {
    // Send initial embed
    const initialEmbed = this.pages[0];
    const reply = await interaction.reply({ 
      embeds: [initialEmbed], 
      fetchReply: true 
    });

    if (reply) {
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
        await reaction.users.remove(interaction.user.id);

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

        if (this.message) {
          await this.message.edit({ embeds: [this.pages[this.currentPage]] });
        }
      });

      // Handle menu timeout
      this.collector.on('end', async () => {
        await this.close();
      });
    }
  }

  private async close() {
    if (this.message?.deletable) {
      await this.message.delete().catch(() => {});
    }
    this.collector?.stop();
  }
}