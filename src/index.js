require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');

if (!process.env.DISCORD_TOKEN) {
  console.error('❌ لم يتم العثور على DISCORD_TOKEN في ملف .env');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.User]
});

loadCommands(client);
loadEvents(client);

client.login(process.env.DISCORD_TOKEN);

// تشغيل لوحة التحكم البسيطة إن كانت مفعّلة
try {
  const { startDashboard } = require('./dashboard/server');
  startDashboard(client);
} catch (err) {
  console.warn('⚠️ لوحة التحكم لم تُشغَّل:', err.message);
}

process.on('unhandledRejection', err => {
  console.error('Unhandled promise rejection:', err);
});
