const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

/**
 * Help command
 * 
 * Displays information on a given command
 * 
 * @param `command`: name of the command given as a string
 */
module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Get information about a particular command')
    .addStringOption((option) => 
      option
        .setName('command')
        .setDescription('Name of the command to get help on')
        .setChoices(
          { name: 'Help', value: 'help' },
          { name: 'Get', value: 'get' },
          { name: 'Image', value: 'image' },
        )
        .setRequired(false)
    ),
  async execute(interaction) {
    const commandName = interaction.options.getString('command');

    console.log(commandName);

    const embed = new EmbedBuilder();

    switch (commandName) {
      case 'help':
      case null:
        embed
          .setTitle('Help')
          .setDescription('Synopsis: provides information on a particular command\n\nArguments:')
          .addFields(
            { name: 'command (optional)', value: 'Name of the command to request help on.', inline: true },

            { name: 'Examples', value: '`/help`\n`/help command:image`' },
          )
        break;
      case 'get':
        embed
          .setTitle('Get command')
          .setDescription('Synopsis: gets images from an external API or database like gelbooru and danbooru\n\nArguments:')
          .addFields(
            { name: 'tags\n(required)', value: 'Tags to search for in the source database.', inline: true },

            { name: 'Examples', value: '`/get tags:cat_girl`\n`/get tags:cat_girl dog_girl`\n`/get tags:solo *_girl`\nFor more information on advanced tag searching and available tags, visit https://gelbooru.com/index.php?page=wiki&s=&s=view&id=25921.' },
          )
        break;
      case 'image':
        embed
          .setTitle('Image command')
          .setDescription('Synopsis: retrieves images from a local database of Nekopara images created by me\n\nArguments:')
          .addFields(
            { name: 'category\n(optional; default=coconut)', value: 'Category of images to retrieve from the database. Select multiple as a string of comma seperated values.', inline: true },
            { name: 'number\n(optional; default=1; max=4)', value: 'Number of images to retrieve from the database', inline: true },
            { name: 'nsfw\n(optional; default=false)', value: 'If the images should include not safe for work content (sill includes sfw images if set to true)', inline: true },
            { name: 'hidden\n(optional; default=false)', value: 'If the post should be ephemeral (only visible to you, the sender)', inline: true },

            { name: 'Examples', value: '`/image`\n`/image category:coconut`\n`/image category:coconut,azuki`\n`/image number:4`\n`/image nsfw:True`\n`/image hidden:True`\n`/image category:maple number:4 nsfw:True hidden:True`' },
          )
        break;
      default:
        embed
          .setTitle('Command not found')
          .setDescription('This command doesn\'t exist, but if you think it should, feel free to request it in the GitHub repository!')
        break;
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
}