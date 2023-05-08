const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reboot')
    .setDescription('Reboots the bot completely'),
  async execute(interaction) {
    await interaction.reply("Rebooting bot in 3 seconds!");
    
    const timer = ms => new Promise( res => setTimeout(res, ms));

    await timer(3000);

    process.exit(0);
  },
}