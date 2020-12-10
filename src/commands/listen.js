const { Silence } = require('../audioClasses.js')
module.exports = {
    name: "listen",
    aliases: ["join", "connect", "summon"],
    description: "Joins your channel",
    execute: async (message, args) => {
        const channel = message.member.voice.channel;
        if (!message) return;
        if(!channel)
        return await message.channel.send("Please join a voice channel");
        if (channel === message.member.guild.me.voice.channel)
        return await message.channel.send("Already in the channel");
        
        console.log(`Joined ${channel.name}`)
        const connection = await message.member.voice.channel.join();
        connection.play(new Silence());
        return;
    }
}