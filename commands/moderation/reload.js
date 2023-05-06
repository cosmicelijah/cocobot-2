const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reloads commands (Moderator use only)')
    .addStringOption((option) =>
      option
        .setName('command')
        .setDescription('Command to reload')
        .setRequired(true)
    ),
  async execute(interaction) {
    // if (interaction.user.id != '451196379726086156') {
    //   return;
    // }

    const commandName = interaction.options.getString('command', true).toLowerCase();
    const command = interaction.client.commands.get(commandName);
    const commandPath = interaction.client.commandPaths.get(commandName);

    if (!command) {
      return interaction.reply(`There is no command with name \`${commandName}\`!`);
    }

    delete require.cache[require.resolve(`${commandPath}`)];

    try {
      interaction.client.commands.delete(command.data.name);
      const newCommand = require(`${commandPath}`);
      interaction.client.commands.set(newCommand.data.name, newCommand);
      await interaction.reply(`Command \`${newCommand.data.name}\` was reloaded!`);
    } catch (error) {
      console.error(error);
      await interaction.reply(`\`\`\`js\n${error.message}\`\`\``);
    }

  },
}