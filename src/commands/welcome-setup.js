const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { baseEmbed, COLORS } = require('../utils/embeds');
const { updateSettings } = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('welcome-setup')
    .setDescription('إعداد نظام الترحيب بالأعضاء الجدد')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(opt =>
      opt.setName('القناة').setDescription('قناة الترحيب').addChannelTypes(ChannelType.GuildText).setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('الرسالة')
        .setDescription('رسالة الترحيب (استخدم {user} للإشارة للعضو و {server} لاسم السيرفر)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('القناة');
    const message = interaction.options.getString('الرسالة') || 'مرحباً بك {user} في سيرفر {server}! 🎉';

    updateSettings(interaction.guild.id, { welcomeChannel: channel.id, welcomeMessage: message });

    await interaction.reply({
      embeds: [baseEmbed({
        title: '✅ تم إعداد الترحيب',
        description: `سيتم ترحيب الأعضاء الجدد في ${channel}\n**نص الرسالة:** ${message}`,
        color: COLORS.success
      })],
      ephemeral: true
    });
  }
};
