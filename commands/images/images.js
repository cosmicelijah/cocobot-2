const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const getData = require('../../database/connect.js');

let imageData = [];

async function validateCategories(category) {
  let query = `SELECT name FROM Category`;

  try {
    const rawResults = await getData(query);

    let results = [];

    for (let i = 0; i < rawResults.length; i++) {
      results.push(rawResults[i][0]);
    }

    let valid = [];

    for (let i = 0; i < category.length; i++) {
      if (results.includes(category[i])) valid.push(category[i]);
    }

    return valid;
  } catch (err) {
    throw err;
  }
}

/**
 * Get random images up to specified value in a specified category
 * 
 * @param `num`: number of images, default 1
 * @param `category`: the image category, default 'coconut'
 * 
 * @returns array of images or empty array
 */
async function getRandomImages(num=1, category='[coconut]') {

  if (num == 0 || category.length == 0) {
    return [];
  }

  const valid = await validateCategories(category);

  if (valid.length == 0) {
    return [];
  }

  let query = `SELECT HasCategory.catName AS cat, Image.path AS path FROM HasCategory JOIN Image ON HasCategory.imageName = Image.path WHERE catName = '${category[0]}'`;

  for (let i = 1; i < category.length; i++) {
    query += ` OR catName = '${category[i]}'`;
  }

  try {
    const results = await getData(query);
    const images = [];
    const numImages = results.length;
  
    for (let i = 0; i < num; i++) {
      let r = Math.ceil(Math.random() * numImages);
  
      images.push(`${results[r][0]}/${results[r][1]}`);
    }
  
    return images;
  } catch (error) {
    throw error;
  }
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
    const errorImage = new AttachmentBuilder('./pictures/error.jpg');

    /**
     * Handle arguments
     */
    const categoryString = interaction.options.getString('category') ?? 'coconut';
    const numString = interaction.options.getString('number') ?? '1';

    let category = categoryString.split(',');

    for (i = 0; i < category.length; i++) {
      category[i] = category[i].trim();
    }

    // console.log(category);

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

    
    /**
     * More fields for image processing
    */
   let embeds = [];
   let images = [];
   let imageNames = await getRandomImages(num, category);
   
   console.log(imageNames);
   
   /**
    * Default embed for if the requested category does not exist
   */
    if (num == 0) {
      const embed = new EmbedBuilder()
        .setTitle(`Error: please input an integer value from 1 to 10`)
        .setImage(`attachment://error.jpg`);
      embeds.push(embed);
      images.push(errorImage);

    } else if (imageNames.length == 0) {
      const embed = new EmbedBuilder()
        .setTitle(`Sorry, it looks like that category doesn't exist`)
        .setImage(`attachment://error.jpg`);

      embeds.push(embed);
      images.push(errorImage);

    } else {
      for (i = 0; i < num; i++) {
        const image = new AttachmentBuilder(`../../Pictures/dbImages/${imageNames[i]}`);
  
        const embed = new EmbedBuilder()
          .setURL('https://cosmicelijah.com')
          // .setTitle(`${category}`)
          .setImage(`attachment://${imageNames[i].split('/').pop()}`);
  
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