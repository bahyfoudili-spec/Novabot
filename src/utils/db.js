const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'db.json');

function ensureDB() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ guilds: {} }, null, 2));
  }
}

function readDB() {
  ensureDB();
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDB(data) {
  ensureDB();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function defaultGuildData() {
  return {
    settings: {
      welcomeChannel: null,
      welcomeMessage: null,
      leaveChannel: null,
      logsChannel: null,
      autoRole: null,
      verifiedRole: null,
      verifyChannel: null,
      ticketCategory: null,
      ticketLogsChannel: null,
      ticketSupportRole: null,
      ticketCounter: 0
    },
    warnings: {},
    tickets: {}
  };
}

function getGuildData(guildId) {
  const db = readDB();
  if (!db.guilds[guildId]) {
    db.guilds[guildId] = defaultGuildData();
    writeDB(db);
  }
  // دمج أي إعدادات ناقصة (عند تحديث البوت وإضافة خصائص جديدة)
  const defaults = defaultGuildData();
  db.guilds[guildId].settings = { ...defaults.settings, ...db.guilds[guildId].settings };
  return db.guilds[guildId];
}

function saveGuildData(guildId, data) {
  const db = readDB();
  db.guilds[guildId] = data;
  writeDB(db);
}

function updateSettings(guildId, patch) {
  const data = getGuildData(guildId);
  data.settings = { ...data.settings, ...patch };
  saveGuildData(guildId, data);
  return data.settings;
}

module.exports = {
  readDB,
  writeDB,
  getGuildData,
  saveGuildData,
  updateSettings
};
