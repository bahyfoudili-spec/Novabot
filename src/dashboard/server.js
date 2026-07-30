const path = require('path');
const express = require('express');
const { readDB } = require('../utils/db');

function basicAuth(req, res, next) {
  const user = process.env.DASHBOARD_USER || 'admin';
  const pass = process.env.DASHBOARD_PASS || 'admin';

  const header = req.headers.authorization || '';
  const token = header.split(' ')[1] || '';
  const [reqUser, reqPass] = Buffer.from(token, 'base64').toString().split(':');

  if (reqUser === user && reqPass === pass) return next();

  // ملاحظة: قيمة الهيدر يجب أن تكون بحروف ASCII فقط (متطلب من بروتوكول HTTP)
  res.set('WWW-Authenticate', 'Basic realm="Bot Dashboard"');
  return res.status(401).send('🔒 يتطلب تسجيل الدخول للوصول إلى لوحة التحكم.');
}

function getStats(client) {
  const db = readDB();
  const guilds = client.guilds.cache.map(g => {
    const guildData = db.guilds[g.id];
    const openTickets = guildData ? Object.values(guildData.tickets).filter(t => t.status === 'open').length : 0;
    const totalWarnings = guildData ? Object.values(guildData.warnings).reduce((a, w) => a + w.length, 0) : 0;

    return {
      id: g.id,
      name: g.name,
      memberCount: g.memberCount,
      icon: g.iconURL() || null,
      openTickets,
      totalWarnings
    };
  });

  return {
    botTag: client.user ? client.user.tag : '...',
    botAvatar: client.user ? client.user.displayAvatarURL() : null,
    guildCount: client.guilds.cache.size,
    userCount: client.guilds.cache.reduce((a, g) => a + g.memberCount, 0),
    uptimeSeconds: Math.floor(client.uptime / 1000),
    ping: client.ws.ping,
    guilds
  };
}

function startDashboard(client) {
  const app = express();
  const PORT = process.env.PORT || process.env.DASHBOARD_PORT || 3000;

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.use('/public', express.static(path.join(__dirname, 'public')));

// app.use(basicAuth);

  app.get('/', (req, res) => {
    res.render('index', { stats: getStats(client) });
  });

  app.get('/api/stats', (req, res) => {
    res.json(getStats(client));
  });

  app.listen(PORT, () => {
    console.log(`🌐 لوحة التحكم تعمل على المنفذ ${PORT} (http://localhost:${PORT})`);
  });
}

module.exports = { startDashboard };
