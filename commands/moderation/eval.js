const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { inspect } = require('util');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('Evaluate shit idfk')
    .addStringOption(option => (
      option
        .setName('code')
        .setDescription('code to eval')
        .setRequired(true)
    )).addIntegerOption(option => (
      option
        .setName('depth')
        .setDescription('depth')
        .setRequired(false)
    )).addBooleanOption(option => (
      option
        .setName('async')
        .setDescription('async')
        .setRequired(false)
    )),
  async execute(interaction) {
    if (interaction.user.id != '451196379726086156') {
      const madImage = new AttachmentBuilder('./pictures/mad.png');

      const incorrectUserEmbed = new EmbedBuilder()
      .setTitle(`User ${interaction.user.username} is not in the sudoers file. This incident has been reported.`)
      .setImage('attachment://mad.png')
      .setFooter({ text: "Just kidding, I still love you <3" });

      await interaction.reply({embeds: [incorrectUserEmbed], files: [madImage], ephemeral: true});
      return;
    }

    let code = interaction.options.getString('code');
    const depth = interaction.options.getInteger('depth') ?? 2;
    const async = interaction.options.getBoolean('async') ?? false;

    if (async) code = `(async () => {${code}})().catch(err => console.error(err)).then(result => console.log(result));`;
    
    let rawResult;
    let success = true;

    try {
      rawResult = inspect(eval(code), false, depth);
    } catch (error) {
      success = false;
      rawResult = error.message;
    }

    console.log(rawResult);

    let result;

    if (success) {
      // Type:\`\`\`js\n${eval(`typeof ${rawResult}`)}\`\`\`
      result = `Result:\n\`\`\`js\n${rawResult}\`\`\``;
    } else {
      result = `Result:\n\`\`\`js\n${rawResult}\`\`\``;
    }

    if (result.length >= 2000) {
      const message = 'Result was too long, sending as a file...';

      await interaction.reply({ content: message, files: [{ attachment: Buffer.from(rawResult), name: 'output.js'}], ephemeral: true });
      return;
    }

    await interaction.reply({ content: result, ephemeral: true });
  },
}