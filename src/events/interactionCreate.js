const { getGuildData } = require('../utils/db');
const { openTicket, claimTicket, closeTicket } = require('../utils/tickets');
const { baseEmbed, COLORS } = require('../utils/embeds');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    try {
      // ==== الأوامر Slash Commands ====
      if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;

        try {
          await command.execute(interaction);
        } catch (err) {
          console.error(err);
          const payload = { content: '❌ حدث خطأ أثناء تنفيذ هذا الأمر.', ephemeral: true };
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp(payload).catch(() => null);
          } else {
            await interaction.reply(payload).catch(() => null);
          }
        }
        return;
      }

      // ==== الأزرار Buttons ====
      if (interaction.isButton()) {
        switch (interaction.customId) {
          case 'ticket_open':
            return openTicket(interaction);
          case 'ticket_claim':
            return claimTicket(interaction);
          case 'ticket_close':
            return closeTicket(interaction);
          case 'verify_button': {
            const data = getGuildData(interaction.guild.id);
            const roleId = data.settings.verifiedRole;
            if (!roleId) {
              return interaction.reply({ content: '⚠️ لم يتم إعداد نظام التوثيق.', ephemeral: true });
            }
            const member = interaction.member;
            if (member.roles.cache.has(roleId)) {
              return interaction.reply({ content: '✅ أنت موثّق بالفعل.', ephemeral: true });
            }
            await member.roles.add(roleId).catch(() => null);
            return interaction.reply({
              embeds: [baseEmbed({ title: '✅ تم التوثيق بنجاح', description: 'مرحباً بك، تم منحك صلاحية الوصول لباقي قنوات السيرفر.', color: COLORS.success })],
              ephemeral: true
            });
          }
        }
      }
    } catch (err) {
      console.error('interactionCreate error:', err);
    }
  }
};
