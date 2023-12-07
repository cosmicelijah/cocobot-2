const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { createAudioResource, createAudioPlayer, getVoiceConnection, joinVoiceChannel } = require('@discordjs/voice');
const kazagumo = require('kazagumo');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('plays voice channel')
    .addStringOption(option => 
      option
        .setName('url')
        .setDescription('Youtube URL')
        .setRequired(true)
      ),
  async execute(interaction) {
    if (interaction.member.voice.channel == null) {
      interaction.reply({ content: 'You are not in a voice channel', ephemeral: true });
      return;
    }

    const url = interaction.options.getString('url');
    const guildId = interaction.guild.id;
    let player = this.player.players.get(guildId).shokaku;
    
    let conn = getVoiceConnection(guildId);
    
    if (conn == undefined) {
      interaction.reply({ content: 'I am not connected to a voice channel', ephemeral: true });
    }



    const stream = await ytdl(url, { filter: 'audio' });
    const name = await ytdl.getBasicInfo(url);
    const resource = createAudioResource(stream);
    
    player.play(resource, { type: 'opus' });
    
    conn.subscribe(player);

    await interaction.reply(`Now playing \`${name.videoDetails.title}\``);
  },
}