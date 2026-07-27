const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { baseEmbed, COLORS } = require('../utils/embeds');
const { logAction } = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('إلغاء الإسكات عن عضو')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt => opt.setName('العضو').setDescription('العضو المراد إلغاء إسكاته').setRequired(true)),

  async execute(interaction) {
    const target = interaction.options.getUser('العضو');
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member) {
      return interaction.reply({ content: '⚠️ لم يتم العثور على هذا العضو.', ephemeral: true });
    }

    await member.timeout(null).catch(() => null);

    const embed = baseEmbed({
      title: '🔊 تم إلغاء الإسكات',
      description: `**العضو:** ${target.tag}\n**بواسطة:** ${interaction.user.tag}`,
      color: COLORS.success
    });

    await interaction.reply({ embeds: [embed] });
    await logAction(interaction.guild, embed);
  }
};
