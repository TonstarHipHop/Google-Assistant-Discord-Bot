
module.exports = {
    name: 'ping',
    aliases: [],
    description: "This is a ping command",
    execute(message, args) {
        message.reply("pong");
    }

}