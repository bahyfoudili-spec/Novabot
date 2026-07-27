const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { baseEmbed, COLORS } = require('../utils/embeds');
const { logAction } = require('../utils/logger');
const { getGuildData, saveGuildData } = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('توجيه إنذار لعضو')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt => opt.setName('العضو').setDescription('العضو المراد إنذاره').setRequired(true))
    .addStringOption(opt => opt.setName('السبب').setDescription('سبب الإنذار').setRequired(true)),

  async execute(interaction) {
    const target = interaction.options.getUser('العضو');
    const reason = interaction.options.getString('السبب');

    const data = getGuildData(interaction.guild.id);
    if (!data.warnings[target.id]) data.warnings[target.id] = [];
    data.warnings[target.id].push({
      reason,
      moderator: interaction.user.id,
      timestamp: Date.now()
    });
    saveGuildData(interaction.guild.id, data);

    const count = data.warnings[target.id].length;

    const embed = baseEmbed({
      title: '⚠️ تم توجيه إنذار',
      description: `**العضو:** ${target.tag}\n**بواسطة:** ${interaction.user.tag}\n**السبب:** ${reason}\n**مجموع الإنذارات:** ${count}`,
      color: COLORS.warning
    });

    await interaction.reply({ embeds: [embed] });
    await logAction(interaction.guild, embed);

    target.send({ embeds: [baseEmbed({
      title: `⚠️ تم إنذارك في سيرفر ${interaction.guild.name}`,
      description: `**السبب:** ${reason}\n**مجموع إنذاراتك:** ${count}`,
      color: COLORS.warning
    })] }).catch(() => null);
  }
};
