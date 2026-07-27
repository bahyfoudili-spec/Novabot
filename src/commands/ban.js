const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { baseEmbed, COLORS } = require('../utils/embeds');
const { logAction } = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('حظر عضو من السيرفر')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(opt => opt.setName('العضو').setDescription('العضو المراد حظره').setRequired(true))
    .addStringOption(opt => opt.setName('السبب').setDescription('سبب الحظر').setRequired(false))
    .addIntegerOption(opt =>
      opt.setName('حذف_الرسائل')
        .setDescription('عدد الأيام لحذف رسائله (0-7)')
        .setMinValue(0)
        .setMaxValue(7)
        .setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('العضو');
    const reason = interaction.options.getString('السبب') || 'لم يذكر سبب';
    const days = interaction.options.getInteger('حذف_الرسائل') || 0;
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (member && !member.bannable) {
      return interaction.reply({ content: '⚠️ لا أستطيع حظر هذا العضو (صلاحياته أعلى مني أو مساوية).', ephemeral: true });
    }

    await interaction.guild.members.ban(target.id, { deleteMessageSeconds: days * 86400, reason }).catch(() => null);

    const embed = baseEmbed({
      title: '🔨 تم حظر عضو',
      description: `**العضو:** ${target.tag}\n**بواسطة:** ${interaction.user.tag}\n**السبب:** ${reason}`,
      color: COLORS.danger
    });

    await interaction.reply({ embeds: [embed] });
    await logAction(interaction.guild, embed);
  }
};
