import { Client, TextChannel } from "discord.js";
import { storage } from "../../storage";

export function setupWelcomeSystem(client: Client) {
  client.on("guildMemberAdd", async (member) => {
    const settings = await storage.getGuildSettings(member.guild.id);
    if (!settings?.welcomeChannel) return;

    const channel = member.guild.channels.cache.get(settings.welcomeChannel) as TextChannel;
    if (!channel) return;

    const message = settings.welcomeMessage
      ? settings.welcomeMessage
          .replace("{user}", member.toString())
          .replace("{server}", member.guild.name)
      : `Welcome ${member.toString()} to ${member.guild.name}!`;

    await channel.send(message);
  });
}