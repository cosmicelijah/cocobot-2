const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('leaves voice channel'),
  async execute(interaction) {
    const conn = getVoiceConnection(interaction.guild.id);

    if (conn == undefined) {
      interaction.reply('Not in a voice channel')
      return;
    } 

    conn.destroy();
    interaction.reply('Left voice channel');
  },
}