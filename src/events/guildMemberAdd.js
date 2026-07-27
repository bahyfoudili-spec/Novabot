const { getGuildData } = require('../utils/db');
const { baseEmbed, COLORS } = require('../utils/embeds');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const data = getGuildData(member.guild.id);
    const { welcomeChannel, welcomeMessage, autoRole, logsChannel } = data.settings;

    // === الترحيب ===
    if (welcomeChannel) {
      const channel = await member.guild.channels.fetch(welcomeChannel).catch(() => null);
      if (channel) {
        const text = (welcomeMessage || 'مرحباً بك {user} في سيرفر {server}! 🎉')
          .replace('{user}', `${member}`)
          .replace('{server}', member.guild.name);

        const embed = baseEmbed({
          title: '👋 عضو جديد',
          description: text,
          color: COLORS.primary,
          footer: `عضو رقم ${member.guild.memberCount}`
        }).setThumbnail(member.user.displayAvatarURL());

        channel.send({ embeds: [embed] }).catch(() => null);
      }
    }

    // === الرتبة التلقائية ===
    if (autoRole) {
      member.roles.add(autoRole).catch(() => null);
    }

    // === سجل الانضمام ===
    if (logsChannel) {
      const channel = await member.guild.channels.fetch(logsChannel).catch(() => null);
      if (channel) {
        const embed = baseEmbed({
          title: '➕ انضمام عضو',
          description: `**العضو:** ${member.user.tag}\n**تاريخ إنشاء الحساب:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
          color: COLORS.success
        }).setThumbnail(member.user.displayAvatarURL());
        channel.send({ embeds: [embed] }).catch(() => null);
      }
    }
  }
};
