const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

/**
 * Get random images up to specified value in a specified category
 * 
 * @param `num`: number of images, default 1
 * @param `category`: the image category, default 'coconut'
 * 
 * @returns array of images or empty array
 */
function getRandomImages(num=1, category='coconut') {
  const max = 103;

  if (num == 0) {
    return [];
  }

  const fileMap = new Map();

  let files = [];

  try {
    files = fs.readdirSync(`./pictures/${category}`);
  } catch {
    return [];
  }

  files.filter(f => {
    fileMap.set(parseInt(f.split('.').shift()), f);
  });

  const images = [];

  for (let i = 0; i < num; i++) {
    let r = Math.ceil(Math.random() * (max - 1));

    images.push(fileMap.get(r));
  }

  return images;
}

/**
 * Command to display up to 10 images of a given category
 */
module.exports = {
  data: new SlashCommandBuilder()
    .setName('image')
    .setDescription('Coconut images <3')
    .addStringOption((option) => 
      option
        .setName('category')
        .setDescription('The category of images to display (coconut, other)')
        .setRequired(false)
    )
    .addStringOption((option) => 
      option
        .setName('number')
        .setDescription('The number of images to display')
        .setRequired(false)
    ),
  async execute(interaction) {

    /**
     * Defer message so that the window is increased from 3 seconds to 15 minutes
     */
    await interaction.deferReply();

    /**
     * Declare constants
     */
    const min = 0;
    const max = 10;
    const defaultImage = new AttachmentBuilder('./pictures/0.png');

    /**
     * Handle arguments
     */
    const category = interaction.options.getString('category') ?? 'coconut';
    const numString = interaction.options.getString('number') ?? '1';

    let numVal = parseInt(numString);

    if (numVal === NaN) {
      numVal = 1;
    } else if (numVal < min) {
      numVal = 1;
    } else if (numVal > max) {
      numVal = 10;
    }

    const num = numVal;

    /**
     * Create and send empty embed if num=0
     */

    if (num == 0) {
      await interaction.editReply({
        embeds: [embed],
      });

      return;
    }

    /**
     * More fields for image processing
     */
    let embeds = [];
    let images = [];
    let imageNames = getRandomImages(num, category);

    /**
     * Default embed for if the requested category does not exist
     */
    if (imageNames.length == 0) {
      const embed = new EmbedBuilder()
        .setTitle('Category does not exist')
        .setImage(`attachment://0.png`);

      embeds.push(embed);
      images.push(defaultImage);

    } else {
      for (i = 0; i < num; i++) {
        const image = new AttachmentBuilder(`./pictures/${category}/${imageNames[i]}`);
  
        const embed = new EmbedBuilder()
          .setURL('https://cosmicelijah.com')
          .setImage(`attachment://${imageNames[i]}`);
  
        embeds.push(embed);
        images.push(image);
      }
  
    }

    /**
     * Send embed
     */
    await interaction.editReply({
      embeds: embeds,
      files: images,
    });
  },
}