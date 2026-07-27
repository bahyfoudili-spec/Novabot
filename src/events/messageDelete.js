const { getGuildData } = require('../utils/db');
const { baseEmbed, COLORS } = require('../utils/embeds');

module.exports = {
  name: 'messageDelete',
  async execute(message) {
    if (!message.guild || message.author?.bot) return;

    const data = getGuildData(message.guild.id);
    const { logsChannel } = data.settings;
    if (!logsChannel) return;

    const channel = await message.guild.channels.fetch(logsChannel).catch(() => null);
    if (!channel || channel.id === message.channel.id) return;

    const embed = baseEmbed({
      title: '🗑️ تم حذف رسالة',
      description: `**الكاتب:** ${message.author?.tag || 'غير معروف'}\n**القناة:** ${message.channel}\n**المحتوى:**\n${message.content || '*(بدون نص - قد تحتوي مرفقات)*'}`,
      color: COLORS.warning
    });

    channel.send({ embeds: [embed] }).catch(() => null);
  }
};
