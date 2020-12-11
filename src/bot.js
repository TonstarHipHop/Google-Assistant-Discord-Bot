require('dotenv').config();
const AudioClasses = require('./audioClasses');


// Initiation for bot client
const Discord = require('discord.js');
const client = new Discord.Client();
const PREFIX = "?";

// Initiating commands
const fs = require('fs');
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
const commandFiles = fs
    .readdirSync('./src/commands/')
    .filter(file => file.endsWith('.js'));

for(const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
    for (i in command.aliases) {
        client.aliases.set(command.aliases[i], command);
    }
}

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

// Entry point for message commands
client.on('message', async (message) => {

    // Make sure message author is not a bot and starts with correct prefix
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;
    if (!message.member) message.member = 
        await message.guild.fetchMember(message);

    // Separate out the command from the arguments
    var [command, ...args] = message.content
        .trim()
        .substring(PREFIX.length)
        .split(/\s+/);
    
    // Check if the command or alias exist and execute the command
    if ((Command = client.commands.get(command)) ||
        (Command = client.aliases.get(command))) {
        await Command.execute(message, args);
    }
    
})

// Entry point for voice commands
client.on('guildMemberSpeaking', async (member, speaking) => {
    if (member.user.bot) return;
    if (!speaking.bitfield) return;
    console.log(`${member.displayName} is talking`);

    let audioStream = member.guild.me.voice.connection.receiver
        .createStream(member.user, { mode: 'pcm', end: 'silence'});
    let streamConverter = new AudioClasses.StreamConverter();
    streamConverter.detectHotwords(audioStream);

})