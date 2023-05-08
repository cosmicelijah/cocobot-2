const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { getConnection, getData } = require('../../database/connect.js');
const axios = require('axios');
const fs = require('fs');
const sharp = require('sharp');

async function validateCategories(category) {
  let query = `SELECT name FROM Category`;

  console.log(category);

  try {
    const rawResults = await getData(query);

    let results = [];

    for (let i = 0; i < rawResults.length; i++) {
      results.push(rawResults[i][0]);
    }

    let invalid = []

    for (let i = 0; i < category.length; i++) {
      if (!results.includes(category[i])) invalid.push(category[i]);
    }

    return invalid;
  } catch (err) {
    throw err;
  }
}

async function downloadImage(url, category, name, isNsfw) {
  await axios({
    method: 'GET',
    url: url,
    responseType: 'arraybuffer'
  }).then(async (response) => {
    const imageBuffer = response.data;

    const pngBuffer = await sharp(imageBuffer)
      .toFormat('png')
      .toBuffer();

    const fileName = name.split('.');

    for (let i = 0; i < category.length; i++) {
      let path = `../../Pictures/dbImages/${fileName[0]}.png`;
      // if (isNsfw) {
      //   path = `../../Pictures/dbImagesReal/${category[i]}/nsfw/${fileName[0]}.png`
      // } else {
      //   path = `../../Pictures/dbImagesReal/${category[i]}/${fileName[0]}.png`
      // }

      fs.writeFile(path, pngBuffer, "binary", (err) => {
        if (err) throw err;
        console.log("Saved file")
      });
    }
  });

}

async function addToDB(name, category, isNsfw) {
  /**
   * Add image to Image table
   */
  const conn = await getConnection();

  name = name.split('.')[0] + ".png";

  conn.query(`INSERT INTO image (path, isNsfw) VALUES ? ON DUPLICATE KEY UPDATE path=path`, [[[name, isNsfw]]], (err, rows) => {
    if (err) throw err;

    console.log(`Affected ${rows.affectedRows} rows in Image`);
  });

  /**
   * Add image and categories to HasCategory table
   */
  for (let i = 0; i < category.length; i++) {
    conn.query(`INSERT INTO HasCategory (catName, imageName) VALUES ? ON DUPLICATE KEY UPDATE catname = catName, imageName = imageName`, [[[category[i], name]]], (err, results) => {
      if (err) throw err;

      console.log(`Added ${results.affectedRows} image and categories to HasCategory`);
    });
  }

  conn.release();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('upload')
    .setDescription('Upload images to the database')
    .addAttachmentOption((option) =>
      option
        .setName('image')
        .setDescription('The image to upload to the db')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('category')
        .setDescription('categories to place image into')
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName('nsfw')
        .setDescription('Whether or not its porn or not')
        .setRequired(true)
    ),
  async execute(interaction) {
    if (interaction.user.id != '451196379726086156') {
      const madImage = new AttachmentBuilder('./pictures/mad.png');

      const incorrectUserEmbed = new EmbedBuilder()
        .setTitle(`User ${interaction.user.username} is not in the sudoers file. This incident has been reported.`)
        .setImage('attachment://mad.png')
        .setFooter({ text: "Just kidding, I still love you <3" });

      await interaction.reply({ embeds: [incorrectUserEmbed], files: [madImage] });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const image = interaction.options.getAttachment('image');
    const categoryString = interaction.options.getString('category');
    const isNsfw = interaction.options.getBoolean('nsfw');

    console.log(image.url);
    console.log(categoryString);

    let category = categoryString.split(',');

    for (i = 0; i < category.length; i++) {
      category[i] = category[i].trim();
    }

    let validString = await validateCategories(category);

    if (validString.length != 0) {
      throw new Error(`Invalid categories: { ${validString} }`)
    }

    await downloadImage(image.url, category, image.name, isNsfw);

    await addToDB(image.name, category, isNsfw);

    let embeds = [];
    let images = [];

    const embed = new EmbedBuilder()
      .setTitle(`${categoryString}, ${image.name}`)
      .setImage(image.attachment);

    embeds.push(embed);
    images.push(image);

    await interaction.editReply({
      embeds: embeds,
    });
    // await interaction.reply(`image: ${image.attachment}\n\ncategory: ${category}`);
  },
}