module.exports = {
    name: "ping",
    category: "info",
    description: "Returns latency and API ping",
    execute: async (message, args) => {
        if (!message) {
            return null;
        }
        const msg = await message.channel.send("Pinging...");
        msg.edit(`Pong\nLatency: ` + 
            `${Math.floor(msg.createdAt - message.createdAt)}\n` +
            `API Latency ${Math.round(message.client.ws.ping)}ms`);
    }
}