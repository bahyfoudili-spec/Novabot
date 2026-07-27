const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`🚀 تم تسجيل الدخول باسم ${client.user.tag}`);
    console.log(`📊 يعمل حالياً في ${client.guilds.cache.size} سيرفر`);

    client.user.setPresence({
      activities: [{ name: 'يحرس السيرفر | /help', type: ActivityType.Watching }],
      status: 'online'
    });
  }
};
