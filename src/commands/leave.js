module.exports = {
    name: "leave",
    aliases: ["dc", "disconnect"],
    category: "action",
    description: "Leaves your channel",
    usage: "",
    execute: async (message, args) => {
        if (!message) {
            member.guild.me.voice.channel.leave().catch(() => 
                console.log(`Couldn't leave channel`)
            );
            return `Left ${message.member.voice.channel.name}`
        }
        else if(!message.guild.me.voice.channel ||
            message.member.voice.channel !== message.guild.me.voice.channel)
            await message.channel.send("Not in a voice channel");
        else {
            await message.member.voice.channel.leave();
            console.log(`Left ${message.member.voice.channel.name}`);
        }
    }
}