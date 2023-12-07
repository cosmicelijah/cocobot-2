const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, EmbedBuilder, Partials } = require('discord.js');
const { token } = require('./config.json');


const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
const client = new Client({
  intents: [
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction, Partials.User],
});

client.commands = new Collection();
client.commandPaths = new Map();
client.cooldowns = new Collection();
// client.queues = new Map();

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
      client.commandPaths.set(command.data.name, filePath);
    } else {
      console.log(`Warning: file ${filePath} does not contain a 'data' or 'execute' property`);
    }
  }
}

/**
 * Log In Success
 */
client.once(Events.ClientReady, () => {
  console.log(`Ready\nLogged in as ${client.user.tag}`);
  client.user.setPresence({
    status: 'online',
    activities: [{
      name: 'use `/help` to get started!',
      type: 0
    }],
  });
});

/**
 * Interaction Handler
 */

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);
  const { cooldowns } = client;

  if (!command) {
    console.error(`Error: no command matching ${interaction.commandName} was found`);
    return;
  }

  if (!cooldowns.has(command.data.name)) {
    cooldowns.set(command.data.name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.data.name);
  const defaultCooldownDuration = 3;
  const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

  if (timestamps.has(interaction.user.id)) {
    const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

    if (now < expirationTime) {
      const secondsRemaining = Math.round((expirationTime - now) / 1000);
      const embed = new EmbedBuilder()
        .setTitle("You're still on cooldown!")
        .setDescription(`You need to wait ${secondsRemaining} more seconds until you can use \`${command.data.name}\``);

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }

  if (interaction.user.id != '451196379726086156') {
    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
  }
  
  try {
    await command.execute(interaction);

  } catch (error) {
    let commandUsed = `Command used: ${interaction.commandName}\n\nCommand info: ${JSON.stringify(interaction.options)}\n\nStacktrace: ${error.stack}`;

    console.log(commandUsed);

    const embed = new EmbedBuilder()
      .setTitle("Uh oh! An error occured :(")
      .setURL("https://github.com/cosmicelijah/cocobot-2/issues")
      .setColor(0xFF0000)
      .setDescription(`Please report this in the GitHub repo at with the command and options used.\n\n\`\`\`js\n${commandUsed}\`\`\``);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        embeds: [embed],
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }
  }
})

client.on(Events.MessageCreate, (message) => {
  if (message.author.bot) return;

  const contents = message.toString();
  if (contents.includes("https://twitter.com")) {
    message.reply(`It looks like you posted a Twitter link\n${contents.replace("twitter.com", "fxtwitter.com")}`);
  } else if (contents.includes("https://x.com")) {
    message.reply(`It looks like you posted a Twitter link\n${contents.replace("x.com", "fxtwitter.com")}`);
  }
});

/**
 * Log In
 */

client.login(token);