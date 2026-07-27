const {
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder
} = require('discord.js');
const { getGuildData, saveGuildData } = require('./db');
const { baseEmbed, COLORS } = require('./embeds');

async function openTicket(interaction) {
  const data = getGuildData(interaction.guild.id);
  const { ticketCategory, ticketSupportRole } = data.settings;

  if (!ticketCategory || !ticketSupportRole) {
    return interaction.reply({ content: '⚠️ لم يتم إعداد نظام التذاكر بعد. تواصل مع الإدارة.', ephemeral: true });
  }

  // تحقق من عدم وجود تذكرة مفتوحة مسبقاً لنفس العضو
  const existing = Object.values(data.tickets).find(
    t => t.userId === interaction.user.id && t.status === 'open'
  );
  if (existing) {
    return interaction.reply({ content: `⚠️ لديك تذكرة مفتوحة بالفعل: <#${existing.channelId}>`, ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });

  data.settings.ticketCounter += 1;
  const ticketNumber = data.settings.ticketCounter;

  const channel = await interaction.guild.channels.create({
    name: `تذكرة-${ticketNumber.toString().padStart(3, '0')}`,
    type: ChannelType.GuildText,
    parent: ticketCategory,
    permissionOverwrites: [
      { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      { id: ticketSupportRole, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
    ]
  });

  data.tickets[channel.id] = {
    channelId: channel.id,
    userId: interaction.user.id,
    number: ticketNumber,
    status: 'open',
    claimedBy: null,
    createdAt: Date.now()
  };
  saveGuildData(interaction.guild.id, data);

  const embed = baseEmbed({
    title: `🎫 تذكرة #${ticketNumber}`,
    description: `مرحباً ${interaction.user}! فريق الدعم سيصل إليك قريباً.\nيرجى وصف مشكلتك أو استفسارك بالتفصيل.`,
    color: COLORS.primary
  });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket_claim').setLabel('استلام 🙋').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('ticket_close').setLabel('إغلاق 🔒').setStyle(ButtonStyle.Danger)
  );

  await channel.send({ content: `<@&${ticketSupportRole}>`, embeds: [embed], components: [row] });
  await interaction.editReply({ content: `✅ تم فتح تذكرتك: ${channel}` });
}

async function claimTicket(interaction) {
  const data = getGuildData(interaction.guild.id);
  const ticket = data.tickets[interaction.channel.id];
  if (!ticket) {
    return interaction.reply({ content: '⚠️ هذه ليست قناة تذكرة.', ephemeral: true });
  }
  if (ticket.claimedBy) {
    return interaction.reply({ content: `⚠️ هذه التذكرة تم استلامها بالفعل بواسطة <@${ticket.claimedBy}>.`, ephemeral: true });
  }

  ticket.claimedBy = interaction.user.id;
  saveGuildData(interaction.guild.id, data);

  await interaction.reply({
    embeds: [baseEmbed({ title: '🙋 تم استلام التذكرة', description: `${interaction.user} سيتولى هذه التذكرة الآن.`, color: COLORS.info })]
  });
}

async function closeTicket(interaction) {
  const data = getGuildData(interaction.guild.id);
  const ticket = data.tickets[interaction.channel.id];
  if (!ticket) {
    return interaction.reply({ content: '⚠️ هذه ليست قناة تذكرة.', ephemeral: true });
  }

  await interaction.reply({
    embeds: [baseEmbed({ title: '🔒 سيتم إغلاق التذكرة', description: 'سيتم حفظ نسخة من المحادثة وحذف القناة خلال 5 ثوانٍ.', color: COLORS.danger })]
  });

  // حفظ نسخة (transcript) بسيطة من الرسائل
  let transcriptText = `نسخة من التذكرة #${ticket.number}\nالسيرفر: ${interaction.guild.name}\n\n`;
  try {
    const messages = await interaction.channel.messages.fetch({ limit: 100 });
    const sorted = [...messages.values()].reverse();
    for (const m of sorted) {
      transcriptText += `[${new Date(m.createdTimestamp).toLocaleString('ar-EG')}] ${m.author.tag}: ${m.content}\n`;
    }
  } catch (err) {
    transcriptText += '(تعذر جلب كامل الرسائل)\n';
  }

  ticket.status = 'closed';
  ticket.closedBy = interaction.user.id;
  ticket.closedAt = Date.now();
  saveGuildData(interaction.guild.id, data);

  const logsChannelId = data.settings.ticketLogsChannel;
  if (logsChannelId) {
    const logsChannel = await interaction.guild.channels.fetch(logsChannelId).catch(() => null);
    if (logsChannel) {
      const buffer = Buffer.from(transcriptText, 'utf-8');
      const attachment = new AttachmentBuilder(buffer, { name: `تذكرة-${ticket.number}.txt` });
      await logsChannel.send({
        embeds: [baseEmbed({
          title: `🔒 تم إغلاق تذكرة #${ticket.number}`,
          description: `**العضو:** <@${ticket.userId}>\n**أُغلقت بواسطة:** ${interaction.user}\n**الحالة:** مغلقة`,
          color: COLORS.danger
        })],
        files: [attachment]
      }).catch(() => null);
    }
  }

  setTimeout(() => {
    interaction.channel.delete().catch(() => null);
  }, 5000);
}

module.exports = { openTicket, claimTicket, closeTicket };
