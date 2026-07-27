const { getGuildData } = require('../utils/db');
const { baseEmbed, COLORS } = require('../utils/embeds');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    const data = getGuildData(member.guild.id);
    const { logsChannel } = data.settings;
    if (!logsChannel) return;

    const channel = await member.guild.channels.fetch(logsChannel).catch(() => null);
    if (!channel) return;

    const embed = baseEmbed({
      title: '➖ مغادرة عضو',
      description: `**العضو:** ${member.user.tag}\n**انضم بتاريخ:** ${member.joinedAt ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'غير معروف'}`,
      color: COLORS.danger
    }).setThumbnail(member.user.displayAvatarURL());

    channel.send({ embeds: [embed] }).catch(() => null);
  }
};
