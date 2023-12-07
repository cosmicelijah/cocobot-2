const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('echo')
    .setDescription('Echos back what the calling user said')
    .addStringOption((option) => 
      option.setName('message')
        .setDescription('Message to have the bot echo back')
        .setRequired(true)
    ),
  async execute(interaction) {
    let embed = new EmbedBuilder()
      .setTitle(`${interaction.user.username} has said`)
      .setDescription(interaction.options.getString('message'));
      // .setTitle(`user has said`)
      // .setDescription(interaction.options.getString('message'));

    await interaction.reply({
      embeds: [embed],
    })
  },
}