import { Client, TextChannel } from "discord.js";
import { storage } from "../../storage";

const XP_COOLDOWN = new Set<string>();

export function setupLevelSystem(client: Client) {
  client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;

    // XP cooldown (1 minute)
    const key = `${message.author.id}-${message.guild.id}`;
    if (XP_COOLDOWN.has(key)) return;

    XP_COOLDOWN.add(key);
    setTimeout(() => XP_COOLDOWN.delete(key), 60000);

    // Award XP
    let user = await storage.getUser(message.author.id);
    if (!user) {
      user = await storage.createUser({
        discordId: message.author.id,
        level: 0,
        xp: 0,
        warnings: 0
      });
    }

    const oldLevel = user.level;
    const updatedUser = await storage.updateUserXP(message.author.id, 
      Math.floor(Math.random() * 11) + 15
    );

    // Level up announcement
    if (updatedUser.level > oldLevel) {
      const settings = await storage.getGuildSettings(message.guild.id);
      const channel = settings?.levelChannel
        ? (message.guild.channels.cache.get(settings.levelChannel) as TextChannel)
        : message.channel;

      await channel.send(
        `🎉 Congratulations ${message.author}! You've reached level ${updatedUser.level}!`
      );
    }
  });
}