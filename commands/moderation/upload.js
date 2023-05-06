const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');

async function downloadImage(url, path) {
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream'
  });

  response.data.pipe(fs.createWriteStream(path));

  return new Promise((resolve, reject) => {
    response.data.on('end', () => {
      resolve();
    });

    response.data.on('error', err => {
      reject(err);
    });
  });
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
    ),
  async execute(interaction) {
    // if (interaction.user.id != '451196379726086156') {
    //   return;
    // }

    // interaction.deferReply();



    const image = interaction.options.getAttachment('image');
    const category = interaction.options.getString('category');

    console.log(image.name)
    console.log(category)

    downloadImage(image.url, `./downloads/${image.name}`)
      .then(() => {
        console.log('Image downloaded successfully.');
      })
      .catch(err => {
        console.error('Error downloading image:', err);
      });

    // let embeds = [];
    // let images = [];

    // const embed = new EmbedBuilder()
    //   .setTitle(category)
    //   .setImage(`attachment://${image}`);

    // embeds.push(embed);
    // images.push(image);

    // await interaction.editReply({
    //   embeds: embeds,
    //   files: images,
    // });
    await interaction.reply(`image: ${image.attachment}\n\ncategory: ${category}`);
  },
}