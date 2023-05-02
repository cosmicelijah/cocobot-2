const {SlashCommandBuilder} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
            .setName('reload')
            .setDescription('Reloads commands (Moderator use only)'),
  async execute(interaction) {
    console.log('Reload');
  },
}