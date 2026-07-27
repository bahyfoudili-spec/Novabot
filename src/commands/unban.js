const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { baseEmbed, COLORS } = require('../utils/embeds');
const { logAction } = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('إلغاء حظر عضو باستخدام الآيدي الخاص به')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption(opt => opt.setName('ايدي_العضو').setDescription('آيدي العضو المراد إلغاء حظره').setRequired(true)),

  async execute(interaction) {
    const userId = interaction.options.getString('ايدي_العضو');

    try {
      await interaction.guild.members.unban(userId);
    } catch (err) {
      return interaction.reply({ content: '⚠️ تعذر إلغاء الحظر. تأكد من صحة الآيدي وأن العضو محظور فعلاً.', ephemeral: true });
    }

    const embed = baseEmbed({
      title: '✅ تم إلغاء الحظر',
      description: `**آيدي العضو:** ${userId}\n**بواسطة:** ${interaction.user.tag}`,
      color: COLORS.success
    });

    await interaction.reply({ embeds: [embed] });
    await logAction(interaction.guild, embed);
  }
};
