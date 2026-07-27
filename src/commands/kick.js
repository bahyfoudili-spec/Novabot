const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { baseEmbed, COLORS } = require('../utils/embeds');
const { logAction } = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('طرد عضو من السيرفر')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(opt => opt.setName('العضو').setDescription('العضو المراد طرده').setRequired(true))
    .addStringOption(opt => opt.setName('السبب').setDescription('سبب الطرد').setRequired(false)),

  async execute(interaction) {
    const target = interaction.options.getUser('العضو');
    const reason = interaction.options.getString('السبب') || 'لم يذكر سبب';
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member) {
      return interaction.reply({ content: '⚠️ لم يتم العثور على هذا العضو في السيرفر.', ephemeral: true });
    }
    if (!member.kickable) {
      return interaction.reply({ content: '⚠️ لا أستطيع طرد هذا العضو (صلاحياته أعلى مني أو مساوية).', ephemeral: true });
    }

    await member.kick(reason).catch(() => null);

    const embed = baseEmbed({
      title: '👢 تم طرد عضو',
      description: `**العضو:** ${target.tag}\n**بواسطة:** ${interaction.user.tag}\n**السبب:** ${reason}`,
      color: COLORS.warning
    });

    await interaction.reply({ embeds: [embed] });
    await logAction(interaction.guild, embed);
  }
};
