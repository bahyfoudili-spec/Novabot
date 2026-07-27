const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { baseEmbed, COLORS } = require('../utils/embeds');
const { logAction } = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('حذف عدد من الرسائل في القناة')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(opt =>
      opt.setName('العدد').setDescription('عدد الرسائل (1-100)').setRequired(true).setMinValue(1).setMaxValue(100)
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger('العدد');
    await interaction.deferReply({ ephemeral: true });

    const deleted = await interaction.channel.bulkDelete(amount, true).catch(() => null);

    if (!deleted) {
      return interaction.editReply('⚠️ تعذر حذف الرسائل (قد تكون أقدم من 14 يوم).');
    }

    await interaction.editReply(`🧹 تم حذف **${deleted.size}** رسالة.`);

    const embed = baseEmbed({
      title: '🧹 حذف رسائل',
      description: `**القناة:** ${interaction.channel}\n**العدد:** ${deleted.size}\n**بواسطة:** ${interaction.user.tag}`,
      color: COLORS.info
    });
    await logAction(interaction.guild, embed);
  }
};
