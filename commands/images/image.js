const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { getData } = require('../../database/connect.js');

/**
 * Validates the input categories against the available categories in the database
 * 
 * @param {string[]} category 
 * @returns 
 */
async function _validateCategories(category) {
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
 * 
 * @param {num} num number of images to get
 * @param {string[]} category array of strings containing all of the categories requested
 * @param {boolean} isNsfw whether the requested images should include nsfw images or not
 * @returns an array of strings of the image path names to get
 */
async function getRandomImages(num = 1, category = '[coconut]', isNsfw = false) {

  if (num == 0 || category.length == 0) {
    return [];
  }

  const valid = await _validateCategories(category);

  if (valid.length == 0) {
    return [];
  }

  let query = `SELECT HasCategory.catName AS cat, Image.path AS path, Image.isNSFW AS nsfw FROM HasCategory JOIN Image ON HasCategory.imageName = path WHERE catName = '${category[0]}'`;

  for (let i = 1; i < category.length; i++) {
    query += ` OR catName = '${category[i]}'`;
  }

  if (!isNsfw) {
    query += ' AND isNSFW = false';
  }

  try {
    const results = await getData(query);
    const images = [];
    const numImages = results.length;

    for (let i = 0; i < num; i++) {
      let r = Math.floor(Math.random() * numImages);

      images.push(`${results[r][1]}`);
    }

    return images;
  } catch (error) {
    throw error;
  }
}

/**
 * Command to display up to 4 images of a given category
 * 
 * @param {string} category 
 * @param {num} number
 * @param {nsfw} boolean
 * @param {hidden} boolean
 */
module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('image')
    .setDescription('Coconut images <3')
    .addStringOption((option) =>
      option
        .setName('category')
        .setDescription('The category of images to display')
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName('number')
        .setDescription('The number of images to display')
        .setRequired(false)
    ).addBooleanOption((option) =>
      option
        .setName('nsfw')
        .setDescription('Wether or not to include NSFW images')
        .setRequired(false)
    ).addBooleanOption((option) =>
      option
        .setName('hidden')
        .setDescription('Wether or not to send secretly')
        .setRequired(false)
    ),
  async execute(interaction) {

    /**
     * Declare constants
    */
    const min = 0;
    const max = 4;
    const defaultImage = new AttachmentBuilder('./pictures/0.png');
    const errorImage = new AttachmentBuilder('./pictures/error.jpg');

    /**
     * Handle arguments
    */
    const categoryString = interaction.options.getString('category') ?? 'coconut';
    const num = interaction.options.getInteger('number') ?? 1;
    const isNsfw = interaction.options.getBoolean('nsfw') ?? false;
    const isHidden = interaction.options.getBoolean('hidden') ?? false;

    console.log(`User: ${interaction.user.username} requested\n\tcategories: ${categoryString}\n\tnumberImages: ${num}\n\tincludedNsfw: ${isNsfw}\n\tephemeral: ${isHidden}`);

    /**
     * Defer message so that the window is increased from 3 seconds to 15 minutes
    */
    await interaction.deferReply({ephemeral: isHidden});

    /**
     * Process category 
     */
    let category = categoryString.split(',');

    for (i = 0; i < category.length; i++) {
      category[i] = category[i].trim();
    }

    if (num === NaN) {
      num = 1;
    } else if (num < min) {
      num = 1;
    } else if (num > max) {
      num = 10;
    }

    /**
     * More fields for image processing
    */
    let embeds = [];
    let images = [];
    let imageNames = await getRandomImages(num, category, isNsfw);

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