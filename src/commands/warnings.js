const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { baseEmbed, COLORS } = require('../utils/embeds');
const { getGuildData, saveGuildData } = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('عرض إنذارات عضو أو مسحها')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt => opt.setName('العضو').setDescription('العضو').setRequired(true))
    .addBooleanOption(opt => opt.setName('مسح').setDescription('مسح جميع إنذارات هذا العضو').setRequired(false)),

  async execute(interaction) {
    const target = interaction.options.getUser('العضو');
    const clear = interaction.options.getBoolean('مسح') || false;
    const data = getGuildData(interaction.guild.id);
    const warnings = data.warnings[target.id] || [];

    if (clear) {
      data.warnings[target.id] = [];
      saveGuildData(interaction.guild.id, data);
      return interaction.reply({
        embeds: [baseEmbed({ title: '🗑️ تم مسح الإنذارات', description: `تم مسح جميع إنذارات ${target.tag}.`, color: COLORS.success })]
      });
    }

    if (warnings.length === 0) {
      return interaction.reply({ content: `✅ لا يوجد إنذارات مسجلة على ${target.tag}.`, ephemeral: true });
    }

    const list = warnings
      .map((w, i) => `**${i + 1}.** ${w.reason} — <@${w.moderator}> — <t:${Math.floor(w.timestamp / 1000)}:R>`)
      .join('\n');

    const embed = baseEmbed({
      title: `⚠️ إنذارات ${target.username}`,
      description: list,
      color: COLORS.warning,
      footer: `مجموع الإنذارات: ${warnings.length}`
    });

    await interaction.reply({ embeds: [embed] });
  }
};
