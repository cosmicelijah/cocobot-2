const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

for (const f of commandFiles) {
  const fPath = path.join(commandsPath, f);
  const command = require(fPath);

  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`Warning: file ${fPath} does not contain a 'data' or 'execute' property`);
  }
}

client.once(Events.ClientReady, c => {
  console.log(`Ready\nLogged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, interaction => {
  if (!interaction.isChatInputCommand()) return;

  console.log(interation);
})

client.login(token);