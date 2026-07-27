const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { baseEmbed, COLORS } = require('../utils/embeds');
const { updateSettings } = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('logs-setup')
    .setDescription('تحديد قناة السجلات (Logs) للسيرفر')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(opt =>
      opt.setName('القناة').setDescription('القناة التي سترسل إليها السجلات').addChannelTypes(ChannelType.GuildText).setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('القناة');
    updateSettings(interaction.guild.id, { logsChannel: channel.id });

    await interaction.reply({
      embeds: [baseEmbed({
        title: '✅ تم إعداد السجلات',
        description: `سيتم إرسال جميع سجلات الإشراف والأحداث إلى ${channel}.`,
        color: COLORS.success
      })],
      ephemeral: true
    });
  }
};
