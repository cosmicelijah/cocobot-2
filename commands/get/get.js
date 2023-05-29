const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const xml2js = require('xml2js');
const { apiKey, userId } = require('../../config.json');

const funcMap = {
  _konachancomData(result) {
    const count = parseInt(result.posts['$'].count);
    const posts = result.posts;

    let numResults = count;

    if (count == 0) {
      return [0, '', ''];
    }

    if (numResults > posts.post.length) {
      numResults = posts.post.length;
    }
    
    const numToGet = Math.floor(Math.random() * numResults);
    const image = posts.post[numToGet]['$'];

    // [(query), (image)]
    return [count, image.id, image.tags, image.file_url];
  },

  _konachannetData(result) {
    const count = parseInt(result.posts['$'].count);
    const posts = result.posts;

    let numResults = count;

    if (count == 0) {
      return [0, '', ''];
    }

    if (numResults > posts.post.length) {
      numResults = posts.post.length;
    }
    
    const numToGet = Math.floor(Math.random() * numResults);
    const image = posts.post[numToGet]['$'];

    // [(query), (image)]
    return [count, image.id, image.tags, image.file_url];
  },

  _gelbooruData(result) {
    const count = parseInt(result.posts['$'].count);
    const posts = result.posts;

    let numResults = count;

    if (count == 0) {
      return [0, '', ''];
    }

    if (numResults > posts.post.length) {
      numResults = posts.post.length;
    }
    
    const numToGet = Math.floor(Math.random() * numResults);
    const image = posts.post[numToGet];

    // [count, imageId, imageTags, imageUrl]
    return [count, image.id[0], image.tags[0], image.file_url[0]];
  },

  _rule34Data(result) {
    const count = parseInt(result.posts['$'].count);
    const posts = result.posts;

    let numResults = count;

    if (count == 0) {
      return [0, '', ''];
    }

    if (numResults > posts.post.length) {
      numResults = posts.post.length;
    }
    
    const numToGet = Math.floor(Math.random() * numResults);
    const image = posts.post[numToGet]['$'];

    // [(query), (image)]
    return [count, image.id, image.tags, image.file_url];
  },
}

/**
 * Get image(s) from tag(s)
 * 
 * @param {any} interaction Command interaction passthrough
 * @param {EmbedBuilder} embed EmbedBuilder passthrough
 */
async function getImage(url, tags, source, username, embed) {
  url += `tags=${tags}`

  console.log(url);
  
  console.log(`User: ${username} requested\n\ttags: ${tags}\n\tfrom: ${source}`);

  const response = await axios({
    method: "GET",
    url: url,
    responseType: "xml"
  })

  
  xml2js.parseString(response.data, (err, result) => {
    if (err) {
      throw err;
    } else {
      const data = funcMap[`_${source}Data`](result);

      // [count, imageId, imageTags, imageUrl]
      const count = data[0];
      const imageId = data[1];
      const imageUrl = data[3];

      if (count == 0) {
        embed.setTitle("Nobody here but us chickens!").setDescription(`No images for these tags on \`${source}\`:\n\`\`\`${tags}\`\`\``);
      } else {
        embed
          .setTitle(`${username} has requested \`${tags}\` from \`${source}\``)
          .setImage(imageUrl)
          .setFooter({ text: `ID: ${imageId}` });
      }
    }
  })
}



/**
 * Get image tags from id number
 * 
 * @param {any} interaction Command interaction passthrough
 * @param {EmbedBuilder} embed EmbedBuilder passthrough
 */
async function getTags(url, id, source, username, embed) {
  if (source === 'konachancom' || source === 'konachancom') {
    url += `tags=id:${id}`;
  } else {
    url += `id=${id}`;
  }

  
  console.log(`User: ${username} requested\n\tid: ${id}\n\tsource: ${source}`);
  
  const response = await axios({
    method: "GET",
    url: url,
    responseType: "xml"
  })

  xml2js.parseString(response.data, (err, result) => {
    if (err) {
      throw err;
    } else {
      const data = funcMap[`_${source}Data`](result);

      // [count, imageId, imageTags, imageUrl]
      const count = data[0];
      const imageTags = data[2];
      const imageUrl = data[3];

      if (count == 0) {
        embed.setTitle("No such id").setDescription(id);

      } else {  
        embed
          .setTitle(`${username} has requested tags for \`${id}\` from \`${source}\``)
          .setDescription(`Post tags:\n\`\`\`${imageTags}\`\`\``)
          .setImage(imageUrl)
      }
    }
  })
}

/**
 * Get number of images within requested tags
 * 
 * @param {any} interaction Command interaction passthrough
 * @param {EmbedBuilder} embed EmbedBuilder passthrough
 */
async function queryTags(url, tags, source, username, embed) {
  url += `tags=${tags}`;
  
  console.log(`User: ${username} queried\n\ttags: ${tags}`);
  
  const response = await axios({
    method: "GET",
    url: url,
    responseType: "xml"
  })

  xml2js.parseString(response.data, (err, result) => {
    if (err) {
      throw err;
    } else {
      const data = funcMap[`_${source}Data`](result);

      // [count, imageId, imageTags, imageUrl]
      const count = data[0];

      embed
        .setTitle(`${username} has queried for tags for \`${tags}\` from \`${source}\``)
        .setDescription(`There are ${count} image(s) for these tags.\n\nHowever, only the first 100 can be shown, so try being more specific if you're looking for a particular image.`)

    }
  })
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
            ).addStringOption((option) =>
            option
              .setName('source')
              .setDescription('Site to get the images from. Default is Gelbooru')
              .setRequired(false)
              .setChoices(
                { name: 'Gelbooru', value: 'gelbooru' },
                { name: 'Rule34', value: 'rule34' },
                { name: 'Konachan.com', value: 'konachancom' },
                { name: 'Konachan.net', value: 'konachannet' },
              )
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
            ).addStringOption((option) =>
            option
              .setName('source')
              .setDescription('Site to get the images from. Default is Gelbooru')
              .setRequired(false)
              .setChoices(
                { name: 'Gelbooru', value: 'gelbooru' },
                { name: 'Rule34', value: 'rule34' },
                { name: 'Konachan.com', value: 'konachancom' },
                { name: 'Konachan.net', value: 'konachannet' },
              )
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
        ).addStringOption((option) =>
        option
          .setName('source')
          .setDescription('Site to get the images from. Default is Gelbooru')
          .setRequired(false)
          .setChoices(
            { name: 'Gelbooru', value: 'gelbooru' },
            { name: 'Rule34', value: 'rule34' },
            { name: 'Konachan.com', value: 'konachancom' },
            { name: 'Konachan.net', value: 'konachannet' },
          )
        )
    ),
  async execute(interaction) {
    await interaction.deferReply();

    const embed = new EmbedBuilder();

    const command = interaction.options.getSubcommand();

    let source = interaction.options.getString('source');
    const tags = interaction.options.getString('tags');
    const id = interaction.options.getInteger('id');
    const username = interaction.user.username;
    const sources = ['gelbooru', 'rule34', 'konachannet', 'konachancom'];

    if (source == null) {
      source = sources[Math.floor(Math.random() * sources.length)];
    }

    let url;

    switch (source) {
      case 'gelbooru':
        url = `https://gelbooru.com/index.php?api_key=${apiKey}&user_id=${userId}&page=dapi&s=post&q=index&`;
        break;
      case 'rule34':
        url = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&`;
        break;
      case 'konachancom':
        url = `https://konachan.com/post.xml?`;
        break;
      case 'konachannet':
        url = `https://konachan.net/post.xml?`;
        break;
    }

    console.log(command);

    switch (command) {
      case 'tags':
        await getImage(url, tags, source, username, embed);
        break;
      case 'id':
        await getTags(url, id, source, username, embed);
        break;
      case 'query':
        await queryTags(url, tags, source, username, embed);
        break;
      default:
        embed.setTitle("Something is terribly fucked");
        break;
    }

    await interaction.editReply({ embeds: [embed] });
  },
}