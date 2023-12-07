const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reboot')
    .setDescription('Reboots the bot completely'),
  async execute(interaction) {
    if (interaction.user.id != '451196379726086156') {
      const madImage = new AttachmentBuilder('./pictures/mad.png');

      const incorrectUserEmbed = new EmbedBuilder()
      .setTitle(`User ${interaction.user.username} is not in the sudoers file. This incident has been reported.`)
      .setImage('attachment://mad.png')
      .setFooter({ text: "Just kidding, I still love you <3" });

      await interaction.reply({embeds: [incorrectUserEmbed], files: [madImage]});
      return;
    }

    await interaction.reply("Rebooting bot in 3 seconds!");
    
    const timer = ms => new Promise( res => setTimeout(res, ms));

    await timer(1000);

    process.exit(0);
  },
}