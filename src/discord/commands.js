const { client, Discord } = require("../discord/discord");
const { selectGuildCommands, selectGuildCommandsEnable } = require("../database/database");

client.on('message', (message) => {
    if (message.author.bot) return;
    selectGuildCommandsEnable(message.guild.id, function (error, content) {
        if (error) return console.log(error);
        if (content[0].commands_enable == 1) {
            selectGuildCommands(message.guild.id, function (error, content) {
                if (error) return console.log(error);
                if (message.content == '!comandos') {
                    const custom_commands_help = new Discord.MessageEmbed()
                        .setColor("#92BA2F")
                        .setTitle('Comandos personalizados')
                        .setURL('http://localhost:3000')
                        .setAuthor('Gragas', 'https://zilliongamer.com/uploads/league-of-legends-wild-rift/skins/gragas/vandal-gragas-wild-rift-skins.jpg', 'http://localhost:3000')
                        .setDescription('Comandos personalizados del servidor. Intenta no ofender a nadie.')
                        .addField('\u200B', '\u200B');
                    if (content.length > 0) {
                        content.forEach(command => {
                            custom_commands_help.addField(command.name, command.action);
                        });
                    } else {
                        custom_commands_help.addField('No hay ningún comando personalizado', 'Entra al Dashboard para crear comandos personalizados');
                    }
                    custom_commands_help.addField('\u200B', '\u200B');
                    custom_commands_help.setTimestamp(Date.now());
                    custom_commands_help.setFooter('Solo tengo problemas con la bebida... ¡cuando se me acaba!', 'https://zilliongamer.com/uploads/league-of-legends-wild-rift/skins/gragas/vandal-gragas-wild-rift-skins.jpg');
                    return message.channel.send(custom_commands_help);
                } else {
                    content.forEach(command => {
                        if (message.content == command.name && command.enable) return message.channel.send(command.action);
                    });
                }
            });
        }
    });
});