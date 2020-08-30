const { client, Discord } = require("./discord");
const hltb = require('howlongtobeat');
const hltbService = new hltb.HowLongToBeatService();

client.on('message', (message) => {
    if (message.author.bot) return;
    if (message.content == '!long') {
        const how_long_to_beat_help = new Discord.MessageEmbed()
            .setColor("#92BA2F")
            .setTitle('How long to beat')
            .setURL('http://localhost:3000')
            .setDescription('¿Quieres saber cuánto dura un juego?')
            .addField('\u200B', '\u200B')
            .addField('!long (juego)', 'Muestra la duración del juego que quieras.')
            .addField('\u200B', '\u200B')
            .setTimestamp(Date.now())
            .setFooter('Solo tengo problemas con la bebida... ¡cuando se me acaba!', 'https://zilliongamer.com/uploads/league-of-legends-wild-rift/skins/gragas/vandal-gragas-wild-rift-skins.jpg');
        return message.channel.send(how_long_to_beat_help);
    } else if (message.content.startsWith('!long')) {
        const argument = message.content.split(" ").slice(1).join(" ");

        hltbService.search(argument).then(result => {
            if (result.length > 0) {
                let count = 0;
                result.forEach(game => {
                    if (count < 3) {
                        const how_long_to_beat = new Discord.MessageEmbed()
                            .setColor("#92BA2F")
                            .setTitle(game.name)
                            .setURL(`https://howlongtobeat.com/game?id=${game.id}`)
                            .setImage(game.imageUrl, 100)
                            .addField('Main Story', `${game.gameplayMain} h`, true)
                            .addField('Main Story + extra', `${game.gameplayMainExtra} h`, true)
                            .addField('Completionist', `${game.gameplayCompletionist} h`)
                            .setTimestamp(Date.now());
                        count++;

                        return message.channel.send(how_long_to_beat);
                    }
                });
            } else {
                const how_long_to_beat = new Discord.MessageEmbed()
                    .setColor("#92BA2F")
                    .setTitle('How long to beat')
                    .setURL(`http://localhost:3000`)
                    .addField('\u200B', '\u200B')
                    .addField(argument, 'No se ha encontrado ningún juego con ese título.')
                    .addField('\u200B', '\u200B')
                    .setTimestamp(Date.now());

                return message.channel.send(how_long_to_beat);
            }
        });
    }
});