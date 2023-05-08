const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const convert = require('xml-js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('get')
    .setDescription('Get images from an external source')
    .addStringOption((option) =>
      option
        .setName('tags')
        .setDescription('tags to get as a space seperated string (ex: coconut_(nekopara) azuki_(nekopara))')
    ),
  async execute(interaction) {
    const embed = new EmbedBuilder();

    const tags = interaction.options.getString('tags');

    console.log(`User: ${interaction.user.username} requested\n\ttags: ${tags}\n\t`);
    
    const url = `https://gelbooru.com/index.php?page=dapi&s=post&q=index&tags=${tags}&api_key=60b64064624947f3223bb6540d7da544d18dcf4d7ccd01b31b688b1d4e6fdaec&user_id=1069409`;
    
    const response = await axios({
      method: "GET",
      url: url,
      responseType: "xml"
    })

    const result = JSON.parse(convert.xml2json(response.data, {compact: true, spaces: 0}));
    
    console.log(result);

    const attributes = result.posts._attributes;

    const posts = result.posts.post;
    
    if (attributes.count === '0') {
      embed.setTitle("Nobody here but us chickens!").setDescription("Those tags didn't work");

    } else if (attributes.count === '1') {
      let imageUrl = posts.file_url._text;

      embed.setTitle(`${interaction.user.username} has requested ${tags}`).setImage(imageUrl);
    } else {
      const numResults = posts.length;
      const numToGet = Math.floor(Math.random() * numResults);
      
      let imageUrl = posts[numToGet].file_url._text;
      
      embed.setTitle(`${interaction.user.username} has requested ${tags}`).setImage(imageUrl);
    }
    
    await interaction.reply({ embeds: [embed] });
  },
}