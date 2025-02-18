import { SlashCommandBuilder, CommandInteraction, EmbedBuilder, TextChannel } from "discord.js";
import { storage } from "../../storage";
import type { Command } from "./index";

export const roleCommands: Command[] = [
  {
    data: new SlashCommandBuilder()
      .setName("rolewizard")
      .setDescription("Start the role assignment setup wizard"),

    async execute(interaction) {
      if (!interaction.member?.permissions.has("MANAGE_ROLES")) {
        return interaction.reply({
          content: "You need the Manage Roles permission to use this command",
          ephemeral: true
        });
      }

      // Create initial embed
      const embed = new EmbedBuilder()
        .setTitle("Role Assignment Wizard")
        .setDescription("Let's set up role assignments! React with:\n\n" +
          "1️⃣ Add a new role assignment\n" +
          "2️⃣ View current role assignments\n" +
          "3️⃣ Remove a role assignment\n" +
          "❌ Cancel")
        .setColor("#0099ff");

      const message = await interaction.reply({ embeds: [embed], fetchReply: true });
      
      // Add reaction options
      await Promise.all([
        message.react('1️⃣'),
        message.react('2️⃣'),
        message.react('3️⃣'),
        message.react('❌')
      ]);

      // Create reaction collector
      const collector = message.createReactionCollector({
        filter: (_, user) => user.id === interaction.user.id,
        time: 60000 // 1 minute
      });

      collector.on('collect', async (reaction, user) => {
        // Remove user's reaction
        await reaction.users.remove(user).catch(() => {});

        switch (reaction.emoji.name) {
          case '1️⃣':
            await handleAddRole(interaction);
            break;
          case '2️⃣':
            await handleViewRoles(interaction);
            break;
          case '3️⃣':
            await handleRemoveRole(interaction);
            break;
          case '❌':
            await message.delete().catch(() => {});
            break;
        }
      });

      // Clean up after timeout
      collector.on('end', () => {
        if (!message.deleted) {
          message.delete().catch(() => {});
        }
      });
    }
  }
];

async function handleAddRole(interaction: CommandInteraction) {
  await interaction.followUp({
    content: "Please mention the role you want to set up:",
    ephemeral: true
  });

  // Create a message collector for the role mention
  const filter = (m: any) => m.author.id === interaction.user.id && m.mentions.roles.size > 0;
  const collector = (interaction.channel as TextChannel).createMessageCollector({
    filter,
    time: 30000,
    max: 1
  });

  collector.on('collect', async message => {
    const role = message.mentions.roles.first();
    if (!role) return;

    // Store the role assignment
    await storage.createRoleAssignment({
      guildId: interaction.guildId!,
      roleId: role.id,
      emoji: "👍", // Default emoji, can be customized later
      description: "Click to receive this role",
      messageId: null,
      channelId: null
    });

    await interaction.followUp({
      content: `Role ${role.name} has been set up for self-assignment!`,
      ephemeral: true
    });
  });
}

async function handleViewRoles(interaction: CommandInteraction) {
  const assignments = await storage.getRoleAssignments(interaction.guildId!);
  
  if (assignments.length === 0) {
    await interaction.followUp({
      content: "No role assignments set up yet!",
      ephemeral: true
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle("Current Role Assignments")
    .setDescription(
      assignments.map(assignment => 
        `${assignment.emoji} <@&${assignment.roleId}> - ${assignment.description}`
      ).join('\n')
    )
    .setColor("#0099ff");

  await interaction.followUp({
    embeds: [embed],
    ephemeral: true
  });
}

async function handleRemoveRole(interaction: CommandInteraction) {
  const assignments = await storage.getRoleAssignments(interaction.guildId!);
  
  if (assignments.length === 0) {
    await interaction.followUp({
      content: "No role assignments to remove!",
      ephemeral: true
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle("Remove Role Assignment")
    .setDescription(
      assignments.map((assignment, index) => 
        `${index + 1}️⃣ ${assignment.emoji} <@&${assignment.roleId}>`
      ).join('\n')
    )
    .setFooter({ text: "React with the number to remove that role assignment" })
    .setColor("#ff0000");

  const message = await interaction.followUp({
    embeds: [embed],
    fetchReply: true
  });

  // Add number reactions
  for (let i = 0; i < assignments.length; i++) {
    await message.react(`${i + 1}️⃣`);
  }

  // Create collector for removal selection
  const collector = message.createReactionCollector({
    filter: (_, user) => user.id === interaction.user.id,
    time: 30000
  });

  collector.on('collect', async (reaction, user) => {
    const match = reaction.emoji.name?.match(/(\d+)️⃣/);
    if (!match) return;

    const index = parseInt(match[1]) - 1;
    if (index >= 0 && index < assignments.length) {
      await storage.deleteRoleAssignment(assignments[index].id);
      await interaction.followUp({
        content: `Role assignment removed!`,
        ephemeral: true
      });
      await message.delete().catch(() => {});
    }
  });
}
