require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID) {
  console.error('❌ تأكد من ضبط DISCORD_TOKEN و CLIENT_ID في ملف .env');
  process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of files) {
  const command = require(path.join(commandsPath, file));
  if (command?.data) commands.push(command.data.toJSON());
}

const rest = new REST().setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log(`🔄 جاري نشر ${commands.length} أمر...`);

    const route = GUILD_ID
      ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
      : Routes.applicationCommands(CLIENT_ID);

    await rest.put(route, { body: commands });

    console.log(
      GUILD_ID
        ? `✅ تم نشر الأوامر بنجاح على السيرفر (${GUILD_ID}) — ستظهر فوراً.`
        : '✅ تم نشر الأوامر بنجاح بشكل عام — قد تستغرق حتى ساعة للظهور في كل السيرفرات.'
    );
  } catch (err) {
    console.error('❌ فشل نشر الأوامر:', err);
  }
})();
