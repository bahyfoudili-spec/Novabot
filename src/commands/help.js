const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed, COLORS } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder().setName('help').setDescription('عرض جميع أوامر البوت وميزاته'),

  async execute(interaction) {
    const embed = baseEmbed({
      title: '📖 دليل أوامر البوت',
      color: COLORS.primary,
      description: 'إليك جميع الأنظمة والأوامر المتوفرة:'
    })
      .addFields(
        {
          name: '🎫 نظام التذاكر',
          value: '`/ticket-setup` `/ticket-panel`',
          inline: false
        },
        {
          name: '✅ نظام التوثيق',
          value: '`/verify-setup`',
          inline: false
        },
        {
          name: '🛡️ الإشراف',
          value: '`/kick` `/ban` `/unban` `/mute` `/unmute` `/warn` `/warnings` `/clear`',
          inline: false
        },
        {
          name: '📜 السجلات',
          value: '`/logs-setup`',
          inline: false
        },
        {
          name: '👋 الترحيب',
          value: '`/welcome-setup`',
          inline: false
        },
        {
          name: '🎭 الرتب التلقائية',
          value: '`/autorole-setup`',
          inline: false
        }
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
