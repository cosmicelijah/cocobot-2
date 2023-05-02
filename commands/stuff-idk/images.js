const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('image')
    .setDescription('Coconut images <3')
    .addStringOption((option) => {
      option
        .setName('number')
        .setDescription('The number of images to display')
        .setRequired(false)
    }),
  async execute(interaction) {
    const image = new AttachmentBuilder('./pictures/0.png');

    const numString = interaction.options.getString('number') ?? '1';

    const num = parseInt(numString);

    if (num === NaN) {
      const errorEmbed = new EmbedBuilder()
        .setTitle("Error")
        .setDescription(`TypeError: Argument ${numString} is not a number`)
        .setColor(0xFF0000);

      interaction.reply({
        embeds: [errorEmbed]
      });

      return;
    } else if (num < 0) {
      const errorEmbed = new EmbedBuilder()
        .setTitle("Error")
        .setDescription(`NegativeValueError: Argument ${numString} is less than 0`)
        .setColor(0xFF0000);

      interaction.reply({
        embeds: [errorEmbed]
      });

      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('Image');

    for (i = 0; i < num; i++) {
      embed.setImage('Attachment')
    }

    await interaction.reply({
      embeds: [embed],
      files: [image],
    });
  },
}