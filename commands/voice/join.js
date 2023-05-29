const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer } = require('@discordjs/voice');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('join')
    .setDescription('Joins voice channel'),
  async execute(interaction) {
    const userChannel = interaction.member.voice.channel;

    if (userChannel == null) {
      interaction.reply({ content: 'You are not in a voice channel', ephemeral: true });
      return;
    }

    interaction.guild.queue = [];
    interaction.guild.player = createAudioPlayer();

    let conn;

    try {
      conn = joinVoiceChannel({
        channelId: userChannel.id,
        guildId: userChannel.guild.id,
        adapterCreator: userChannel.guild.voiceAdapterCreator,
      });

      interaction.reply('Joined voice');
    } catch (error) {
      console.error(error);
    }
  },
}