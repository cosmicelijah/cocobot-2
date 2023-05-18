const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const convert = require('xml-js');
const { apiKey, userId } = require('../../config.json');

/**
 * Get image(s) from tag(s)
 * 
 * @param {any} interaction Command interaction passthrough
 * @param {EmbedBuilder} embed EmbedBuilder passthrough
 */
async function getImage(interaction, embed) {
  const tags = interaction.options.getString('tags');
  let num = interaction.options.getInteger('number') ?? 1;
  const url = `https://gelbooru.com/index.php?page=dapi&s=post&q=index&tags=${tags}&api_key=${apiKey}&user_id=${userId}&json=1`;
  // const url = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&tags=${tags};`
  
  console.log(`User: ${interaction.user.username} requested\n\ttags: ${tags}\n\tnumber: ${num}`);

  const response = await axios({
    method: "GET",
    url: url,
    responseType: "json"
  })

  const result = response.data;
  const attributes = result['@attributes'];
  const post = result.post;

  if (attributes.count == 0) {
    embed.setTitle("Nobody here but us chickens!").setDescription(`No images for tags\n\`\`\`${tags}\`\`\``);
  } else {
    if (num > attributes.count) {
      num = attributes.count;
    }

    let numResults = attributes.count;

    if (numResults > 100) {
      numResults = 100;
    }
    
    const numToGet = Math.floor(Math.random() * numResults);
    const image = post[numToGet];
    const imageUrl = image.file_url;

    embed
      .setTitle(`${interaction.user.username} has requested \`${tags}\``)
      .setImage(imageUrl)
      .setFooter({ text: `ID: ${image.id}` });
  }
}

/**
 * Get image tags from id number
 * 
 * @param {any} interaction Command interaction passthrough
 * @param {EmbedBuilder} embed EmbedBuilder passthrough
 */
async function getTags(interaction, embed) {
  const id = interaction.options.getInteger('id');
  const url = `https://gelbooru.com/index.php?page=dapi&s=post&q=index&id=${id}&api_key=${apiKey}&user_id=${userId}&json=1`;
  // const url = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&tags=${tags};`
  
  console.log(`User: ${interaction.user.username} requested\n\tid: ${id}`);
  
  const response = await axios({
    method: "GET",
    url: url,
    responseType: "json"
  })

  const result = response.data;
  const attributes = result['@attributes'];
  const post = result.post;

  if (attributes.count == 0) {
    embed.setTitle("No such id").setDescription(id);

  } else {
    const imageUrl = post[0].file_url;

    embed
      .setTitle(`${interaction.user.username} has requested tags for \`${id}\``)
      .setDescription(`Post tags:\n\`\`\`${post[0].tags}\`\`\``)
      .setImage(imageUrl)
  }
}

/**
 * Get number of images within requested tags
 * 
 * @param {any} interaction Command interaction passthrough
 * @param {EmbedBuilder} embed EmbedBuilder passthrough
 */
async function queryTags(interaction, embed) {
  const tags = interaction.options.getString('tags');
  const url = `https://gelbooru.com/index.php?page=dapi&s=post&q=index&tags=${tags}&api_key=${apiKey}&user_id=${userId}&json=1`;
  // const url = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&tags=${tags};`
  
  console.log(`User: ${interaction.user.username} queried\n\ttags: ${tags}`);
  
  const response = await axios({
    method: "GET",
    url: url,
    responseType: "json"
  })

  const result = response.data;
  const attributes = result['@attributes'];
  const post = result.post;

  embed
    .setTitle(`${interaction.user.username} has queried for tags for \`${tags}\``)
    .setDescription(`There are ${attributes.count} image(s) for these tags.\nHowever, only the first 100 can be shown, so try being more specific if you're looking for a particular image.`)
}

/**
 * 
 */
module.exports = {
  data: new SlashCommandBuilder()
    .setName('get')
    .setDescription('Get images from an external source')
    .addSubcommandGroup(group =>
      group
        .setName('image')
        .setDescription('Get images using different information')
        .addSubcommand(subcommand =>
          subcommand
            .setName('tags')
            .setDescription('Get image(s) with given tags')
            .addStringOption((option) =>
              option
                .setName('tags')
                .setDescription('Tags to use')
                .setRequired(true)
            ).addIntegerOption((option) =>
              option
                .setName('number')
                .setDescription('Number of posts to get')
                .setRequired(false)
            )
        ).addSubcommand(subcommand =>
          subcommand
            .setName('id')
            .setDescription('Reverse id search')
            .addIntegerOption(option =>
              option
                .setName('id')
                .setDescription('ID to retrieve')
                .setRequired(true)
            )
        )
    ).addSubcommand(subcommand =>
      subcommand
        .setName('query')
        .setDescription('Queries gelbooru for image count of specified tags')
        .addStringOption((option) =>
          option
            .setName('tags')
            .setDescription('tags to get as a space seperated string')
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    await interaction.deferReply();
    const embed = new EmbedBuilder();
    const command = interaction.options.getSubcommand();

    console.log(command);

    switch (command) {
      case 'tags':
        await getImage(interaction, embed);
        break;
      case 'id':
        await getTags(interaction, embed);
        break;
      case 'query':
        await queryTags(interaction, embed);
        break;
      default:
        break;
    }

    await interaction.editReply({ embeds: [embed] });
  },
}