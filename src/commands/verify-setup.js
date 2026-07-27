const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { baseEmbed, COLORS } = require('../utils/embeds');
const { updateSettings } = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify-setup')
    .setDescription('إعداد نظام التوثيق (Verification)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(opt =>
      opt.setName('القناة').setDescription('قناة إرسال لوحة التوثيق').addChannelTypes(ChannelType.GuildText).setRequired(true)
    )
    .addRoleOption(opt => opt.setName('الرتبة').setDescription('الرتبة التي ستُعطى بعد التوثيق').setRequired(true)),

  async execute(interaction) {
    const channel = interaction.options.getChannel('القناة');
    const role = interaction.options.getRole('الرتبة');

    const botMember = interaction.guild.members.me;
    if (role.position >= botMember.roles.highest.position) {
      return interaction.reply({ content: '⚠️ يجب أن تكون رتبة البوت أعلى من رتبة التوثيق حتى يستطيع إعطاءها.', ephemeral: true });
    }

    updateSettings(interaction.guild.id, { verifyChannel: channel.id, verifiedRole: role.id });

    const embed = baseEmbed({
      title: '✅ التحقق من الهوية',
      description:
        'مرحباً بك! للوصول إلى باقي قنوات السيرفر، يرجى الضغط على الزر أدناه لتأكيد أنك لست بوت وإتمام عملية التوثيق.',
      color: COLORS.primary
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('verify_button').setLabel('توثيق ✅').setStyle(ButtonStyle.Success)
    );

    await channel.send({ embeds: [embed], components: [row] });

    await interaction.reply({
      embeds: [baseEmbed({ title: '✅ تم إعداد التوثيق', description: `تم إرسال لوحة التوثيق في ${channel}.`, color: COLORS.success })],
      ephemeral: true
    });
  }
};
