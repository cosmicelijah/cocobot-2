const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

/**
 * Command Handler
 */

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`Warning: file ${filePath} does not contain a 'data' or 'execute' property`);
    }
  }
}

/**
 * Log In Success
 */

client.once(Events.ClientReady, (c) => {
  console.log(`Ready\nLogged in as ${c.user.tag}`);
});

/**
 * Interaction Handler
 */

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // console.log(interaction);

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`Error: no command matching ${interaction.commandName} was found`);
    return;
  }

  try {
    await command.execute(interaction);

  } catch (error) {
    console.error(error);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'There was an error executing this command',
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: 'There was an error executing this command',
        ephemeral: true,
      });
    }
  }
})

/**
 * Log In
 */

client.login(token);