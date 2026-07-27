const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { baseEmbed, COLORS } = require('../utils/embeds');
const { logAction } = require('../utils/logger');

const UNITS = {
  'دقيقة': 60_000,
  'ساعة': 3_600_000,
  'يوم': 86_400_000
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('إسكات عضو مؤقتاً (Timeout)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt => opt.setName('العضو').setDescription('العضو المراد إسكاته').setRequired(true))
    .addIntegerOption(opt => opt.setName('المدة').setDescription('قيمة المدة (رقم)').setRequired(true))
    .addStringOption(opt =>
      opt.setName('الوحدة')
        .setDescription('وحدة الزمن')
        .setRequired(true)
        .addChoices(
          { name: 'دقيقة', value: 'دقيقة' },
          { name: 'ساعة', value: 'ساعة' },
          { name: 'يوم', value: 'يوم' }
        )
    )
    .addStringOption(opt => opt.setName('السبب').setDescription('سبب الإسكات').setRequired(false)),

  async execute(interaction) {
    const target = interaction.options.getUser('العضو');
    const amount = interaction.options.getInteger('المدة');
    const unit = interaction.options.getString('الوحدة');
    const reason = interaction.options.getString('السبب') || 'لم يذكر سبب';
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member) {
      return interaction.reply({ content: '⚠️ لم يتم العثور على هذا العضو.', ephemeral: true });
    }

    const durationMs = amount * UNITS[unit];
    const maxTimeout = 28 * 86_400_000; // حد ديسكورد الأقصى 28 يوم
    if (durationMs > maxTimeout) {
      return interaction.reply({ content: '⚠️ أقصى مدة إسكات مسموحة هي 28 يوم.', ephemeral: true });
    }

    await member.timeout(durationMs, reason).catch(() => null);

    const embed = baseEmbed({
      title: '🔇 تم إسكات عضو',
      description: `**العضو:** ${target.tag}\n**المدة:** ${amount} ${unit}\n**بواسطة:** ${interaction.user.tag}\n**السبب:** ${reason}`,
      color: COLORS.warning
    });

    await interaction.reply({ embeds: [embed] });
    await logAction(interaction.guild, embed);
  }
};
