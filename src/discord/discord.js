const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log('El bot está listo.');
});

client.login(process.env.TOKEN);

module.exports = {
    client, Discord
};