const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { baseEmbed, COLORS } = require('../utils/embeds');
const { getGuildData } = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-panel')
    .setDescription('إرسال لوحة فتح التذاكر في قناة معينة')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(opt =>
      opt.setName('القناة').setDescription('القناة التي سترسل فيها اللوحة').addChannelTypes(ChannelType.GuildText).setRequired(true)
    ),

  async execute(interaction) {
    const data = getGuildData(interaction.guild.id);
    if (!data.settings.ticketCategory || !data.settings.ticketSupportRole) {
      return interaction.reply({ content: '⚠️ يجب استخدام الأمر `/ticket-setup` أولاً قبل إرسال اللوحة.', ephemeral: true });
    }

    const channel = interaction.options.getChannel('القناة');

    const embed = baseEmbed({
      title: '🎫 نظام التذاكر',
      description: 'هل تحتاج مساعدة أو لديك استفسار؟\nاضغط على الزر أدناه لفتح تذكرة خاصة وسيقوم فريق الدعم بمساعدتك في أقرب وقت.',
      color: COLORS.primary
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ticket_open').setLabel('افتح تذكرة 🎫').setStyle(ButtonStyle.Primary)
    );

    await channel.send({ embeds: [embed], components: [row] });

    await interaction.reply({
      embeds: [baseEmbed({ title: '✅ تم إرسال اللوحة', description: `تم إرسال لوحة التذاكر في ${channel}.`, color: COLORS.success })],
      ephemeral: true
    });
  }
};
