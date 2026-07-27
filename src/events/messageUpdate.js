const { getGuildData } = require('../utils/db');
const { baseEmbed, COLORS } = require('../utils/embeds');

module.exports = {
  name: 'messageUpdate',
  async execute(oldMessage, newMessage) {
    if (!newMessage.guild || newMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return;

    const data = getGuildData(newMessage.guild.id);
    const { logsChannel } = data.settings;
    if (!logsChannel) return;

    const channel = await newMessage.guild.channels.fetch(logsChannel).catch(() => null);
    if (!channel || channel.id === newMessage.channel.id) return;

    const embed = baseEmbed({
      title: '✏️ تم تعديل رسالة',
      description:
        `**الكاتب:** ${newMessage.author?.tag || 'غير معروف'}\n**القناة:** ${newMessage.channel}\n` +
        `**قبل:**\n${oldMessage.content || '*(فارغ)*'}\n**بعد:**\n${newMessage.content || '*(فارغ)*'}\n[الذهاب للرسالة](${newMessage.url})`,
      color: COLORS.info
    });

    channel.send({ embeds: [embed] }).catch(() => null);
  }
};
