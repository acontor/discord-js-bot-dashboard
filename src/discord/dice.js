const { client, Discord } = require("./discord");

client.on('message', (message) => {
    if (message.author.bot) return;
    const pattern = /^[0-4]?[0-9]d(4|6|8|10|12|20|100)$/g;
    let content = message.content.substring(1);
    if (message.content == '!dice') {
        const custom_commands_help = new Discord.MessageEmbed()
            .setColor("#92BA2F")
            .setTitle('Comandos disponibles')
            .setAuthor('Pulpitu', 'https://vignette.wikia.nocookie.net/lovecraft/images/7/72/Lovecraft-cthulhu.jpg/revision/latest?cb=20140210145556&path-prefix=es')
            .addField('\u200B', '\u200B')
            .addField('!moneda', 'Lanza una moneda')
            .addField('!(cantidad de dados)d(tipo de dado 4, 6, 8, 10, 12, 20, 100)', 'Lanza la cantidad que quieras del tipo de dado seleccionado.\nEjemplo: !1d6 o !5d10')
            .addField('\u200B', '\u200B')
            .setFooter('La llamada de Pulpitu', 'https://vignette.wikia.nocookie.net/lovecraft/images/7/72/Lovecraft-cthulhu.jpg/revision/latest?cb=20140210145556&path-prefix=es');
        return message.channel.send(custom_commands_help);
    }
    if(message.content.startsWith("!") && pattern.test(content)) {
        const arguments = content.split("d");
        let response = "";
        for (let index = 0; index < arguments[0]; index++) {
            if(index == 0) {
                response += Math.floor(Math.random() * arguments[1]) + 1;
            } else {
                response += `, ${Math.floor(Math.random() * arguments[1]) + 1}`;
            }
        }
        return message.channel.send(`**${message.author.username}** lanza los dados y el resultado es **${response}**.`);
    } else if(message.content == "!moneda") {
        let response = Math.floor(Math.random() * 2) + 1 == 1 ? "Cara" : "Cruz";
        console.log(message.author)
        return message.channel.send(`**${message.author.username}** lanza la moneda al aire y el resultado es **${response}**.`);
    }
});