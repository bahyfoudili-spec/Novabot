const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { baseEmbed, COLORS } = require('../utils/embeds');
const { updateSettings } = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-setup')
    .setDescription('إعداد نظام التذاكر (التصنيف، رتبة الدعم، وقناة السجلات)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(opt =>
      opt.setName('التصنيف').setDescription('التصنيف الذي ستُنشأ فيه قنوات التذاكر').addChannelTypes(ChannelType.GuildCategory).setRequired(true)
    )
    .addRoleOption(opt => opt.setName('رتبة_الدعم').setDescription('الرتبة التي ستستطيع رؤية التذاكر والرد عليها').setRequired(true))
    .addChannelOption(opt =>
      opt.setName('قناة_السجلات').setDescription('قناة سجل إغلاق التذاكر (اختياري)').addChannelTypes(ChannelType.GuildText).setRequired(false)
    ),

  async execute(interaction) {
    const category = interaction.options.getChannel('التصنيف');
    const supportRole = interaction.options.getRole('رتبة_الدعم');
    const logsChannel = interaction.options.getChannel('قناة_السجلات');

    updateSettings(interaction.guild.id, {
      ticketCategory: category.id,
      ticketSupportRole: supportRole.id,
      ticketLogsChannel: logsChannel ? logsChannel.id : null
    });

    await interaction.reply({
      embeds: [baseEmbed({
        title: '✅ تم إعداد نظام التذاكر',
        description:
          `**التصنيف:** ${category}\n**رتبة الدعم:** ${supportRole}\n**قناة السجلات:** ${logsChannel ? logsChannel : 'غير محددة'}\n\n` +
          'استخدم الأمر `/ticket-panel` لإرسال لوحة فتح التذاكر في القناة التي تريدها.',
        color: COLORS.success
      })],
      ephemeral: true
    });
  }
};
