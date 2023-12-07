const {SlashCommandBuilder} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
            .setName('ping')
            .setDescription('Replies with pong'),
  async execute(interaction) {
    await interaction.reply(`Latency is ${Date.now() - interaction.createdTimestamp}ms.\nAPI Latency is ${Math.round(interaction.client.ws.ping)}ms.\nAlso, pong, I guess.`);
  },
}