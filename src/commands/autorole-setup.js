const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { baseEmbed, COLORS } = require('../utils/embeds');
const { updateSettings } = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autorole-setup')
    .setDescription('تحديد الرتبة التلقائية للأعضاء الجدد')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption(opt => opt.setName('الرتبة').setDescription('الرتبة التي ستُعطى تلقائياً').setRequired(true)),

  async execute(interaction) {
    const role = interaction.options.getRole('الرتبة');

    if (role.managed || role.id === interaction.guild.id) {
      return interaction.reply({ content: '⚠️ لا يمكن استخدام هذه الرتبة.', ephemeral: true });
    }

    const botMember = interaction.guild.members.me;
    if (role.position >= botMember.roles.highest.position) {
      return interaction.reply({ content: '⚠️ يجب أن تكون رتبة البوت أعلى من هذه الرتبة حتى يستطيع إعطاءها.', ephemeral: true });
    }

    updateSettings(interaction.guild.id, { autoRole: role.id });

    await interaction.reply({
      embeds: [baseEmbed({
        title: '✅ تم إعداد الرتبة التلقائية',
        description: `سيحصل كل عضو جديد على رتبة ${role} تلقائياً عند الانضمام.`,
        color: COLORS.success
      })],
      ephemeral: true
    });
  }
};
