const { getGuildData } = require('./db');

async function logAction(guild, embed) {
  try {
    const data = getGuildData(guild.id);
    const channelId = data.settings.logsChannel;
    if (!channelId) return;

    const channel = await guild.channels.fetch(channelId).catch(() => null);
    if (!channel) return;

    await channel.send({ embeds: [embed] }).catch(() => null);
  } catch (err) {
    console.error('logAction error:', err);
  }
}

module.exports = { logAction };
