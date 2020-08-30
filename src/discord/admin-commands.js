const { client, Discord } = require("./discord");
const { selectAdminCommands, selectGuildAdminCommands } = require("../database/database");

client.on('message', (message) => {
    if (message.author.bot) return;
    selectGuildAdminCommands(message.guild.id, function (error, content) {
        if (error) return console.log(error);
        if (content[0].admin_enable == 1) {
            if (message.content == '!admin' && message.member.hasPermission("MANAGE_MESSAGES")) {
                selectAdminCommands(function (error, content) {
                    if (error) return console.log(error);
                    const admin_commands_help = new Discord.MessageEmbed()
                        .setColor("#92BA2F")
                        .setTitle('Comandos de administración')
                        .setURL('http://localhost:3000')
                        .setAuthor('Dios Gragas', 'https://zilliongamer.com/uploads/league-of-legends-wild-rift/skins/gragas/vandal-gragas-wild-rift-skins.jpg', 'http://localhost:3000')
                        .setDescription('Comandos de administración. Cuidado con lo que haces.')
                        .addField('\u200B', '\u200B');
                    content.forEach(command => {
                        admin_commands_help.addField(`${command.name} (número)`, command.description);
                    });
                    admin_commands_help.addField('\u200B', '\u200B');
                    admin_commands_help.setTimestamp(Date.now())
                    admin_commands_help.setFooter('Solo tengo problemas con la bebida... ¡cuando se me acaba!', 'https://zilliongamer.com/uploads/league-of-legends-wild-rift/skins/gragas/vandal-gragas-wild-rift-skins.jpg');
                    return message.channel.send(admin_commands_help);
                });
            } else {
                content.forEach(command => {
                    if (error) return console.log(error);
                    // !clear
                    if (message.content.startsWith(command.name) && message.member.hasPermission("MANAGE_MESSAGES") && command.enable) {
                        const argument = message.content.split(" ");
                        message.channel.bulkDelete(parseInt(parseInt(argument[1]) + 1))
                            .then(messages => {
                                if (parseInt(argument[1]) == 2) {
                                    message.channel.send(`Se ha eliminado 1 mensaje`)
                                } else {
                                    message.channel.send(`Se han eliminado ${messages.size - 1} mensajes`)
                                }
                            })
                            .then(
                                setTimeout(function () {
                                    return message.channel.bulkDelete(1);
                                }, 1500)
                            )
                            .catch(console.error);
                    }
                });
            }
        }
    });
});