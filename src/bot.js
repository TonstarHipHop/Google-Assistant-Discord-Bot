require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();
const PREFIX = "?";

const fs = require('fs');
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
const commandFiles = fs.readdirSync('./src/commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
    for (i in command.aliases) {
        client.aliases.set(command.aliases[i], command);
    }
}

console.log(client.aliases);

client.login(process.env.BOT_TOKEN);

client.on("ready", () => {
    console.log(`${client.user.username} logged in successfully`);
    client.user.setPresence({
        status: "online",
        activity: {
          name: "your conversations ;)",
          type: "LISTENING"
        }
    })
})

client.on('message', async (message) => {
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;
    var [command, ...args] = message.content
        .trim()
        .substring(PREFIX.length)
        .split(/\s+/);
    
    if (Command = client.commands.get(command)) {
        Command.execute(message, args);
    } else if (Command = client.aliases.get(command)) {
        Command.execute(message, args);
    }
    
})