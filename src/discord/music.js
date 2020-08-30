const { client, Discord } = require("./discord");
const { selectGuildMusicEnable } = require("../database/database");

const ytdl = require("ytdl-core");

const queue = new Map();

let prefix = '!';

client.on("reconnecting", () => { });

client.on("disconnect", () => { });

client.on("message", async message => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;
    selectGuildMusicEnable(message.guild.id, function (error, content) {
        if (error) return console.log(error);
        if (content[0].music_enable == 1) {
            const server_queue = queue.get(message.guild.id);

            if (message.content.startsWith(`${prefix}reproducir`)) {
                return execute(message, server_queue);
            } else if (message.content == `${prefix}cancion`) {
                return message.channel.send(`Reproduciendo: **${server_queue.songs[0].title}**`);
            } else if (message.content == `${prefix}siguiente`) {
                return skip(message, server_queue);
            } else if (message.content == `${prefix}parar`) {
                return stop(message, server_queue);
            } else if (message.content == `${prefix}musica`) {
                const music_commands_help = new Discord.MessageEmbed()
                    .setColor("#92BA2F")
                    .setTitle('Comandos de música')
                    .setURL('http://localhost:3000')
                    .setAuthor('Dj Gragas', 'https://zilliongamer.com/uploads/league-of-legends-wild-rift/skins/gragas/vandal-gragas-wild-rift-skins.jpg', 'http://localhost:3000')
                    .setDescription('Comandos para invocar y controlar a Dj Gragas.')
                    .addFields(
                        { name: '\u200B', value: '\u200B' },
                        { name: '!reproducir (url/nombre)', value: 'Reproducir o añadir canción.' },
                        { name: '!reproducir lista (nombre)', value: '(PRÓXIMAMENTE) Reproducir una lista con el nombre indicado.' },
                        { name: '!siguiente', value: 'Pasa a la siguiente canción de la lista.' },
                        { name: '!parar', value: 'Parar a dj Gragas, si te atreves.' },
                        { name: '!cancion', value: 'Canción que se está reproduciendo.' },
                        { name: '!listas', value: '(PRÓXIMAMENTE) Muestra las listas de reproducción y como administrarlas.' },
                        { name: '!lista', value: 'Muestra la lista que se está reproduciendo.' },
                        { name: '!lista (nombre)', value: '(PRÓXIMAMENTE) Muestra la lista con el nombre indicado.' },
                        { name: '\u200B', value: '\u200B' },
                    )
                    .setTimestamp(Date.now())
                    .setFooter('Solo tengo problemas con la bebida... ¡cuando se me acaba!', 'https://zilliongamer.com/uploads/league-of-legends-wild-rift/skins/gragas/vandal-gragas-wild-rift-skins.jpg');
                return message.channel.send(music_commands_help);
            } else if (message.content == `${prefix}lista`) {
                let queueEmbed = new Discord.MessageEmbed()
                    .setColor("#92BA2F")
                    .setTitle('Lista de reproducción')
                    .setURL('http://localhost:3000')
                    .setAuthor('Dj Gragas', 'https://zilliongamer.com/uploads/league-of-legends-wild-rift/skins/gragas/vandal-gragas-wild-rift-skins.jpg', 'http://localhost:3000')
                if (server_queue != undefined) {
                    queueEmbed.setDescription('Dj Gragas está pinchando la siguiente lista de reproducción. Pídele canciones con !play (url).');
                    queueEmbed.addField('\u200B', '\u200B');
                    server_queue.songs.forEach((ele, ind) => {
                        queueEmbed.addField(`Orden: ${ind + 1}`, ele.title);
                    });
                    queueEmbed.addField('\u200B', '\u200B');
                } else {
                    queueEmbed.setDescription('Gragas está enfadado. Será mejor que le pidas canciones cuanto antes.');
                    queueEmbed.addField('\u200B', '\u200B');
                    queueEmbed.addField('No hay ninguna lista de reproducción', 'Añade canciones con el comando !play (url).');
                    queueEmbed.addField('\u200B', '\u200B');
                }
                queueEmbed.setTimestamp(Date.now())
                queueEmbed.setFooter('Solo tengo problemas con la bebida... ¡cuando se me acaba!', 'https://zilliongamer.com/uploads/league-of-legends-wild-rift/skins/gragas/vandal-gragas-wild-rift-skins.jpg');
                return message.channel.send(queueEmbed);
            } else if (message.content.startsWith(`${prefix}reproducir lista`)) {
                // reproduce una lista almacenada de la guild con el nombre indicado
                // añadir en execute un condicional si se está intentando reproducir lista para hacer un select de la lista quizás?
                // crear nuevo execute pasándole argumento[2]?
            } else if (message.content.startsWith(`${prefix}lista`)) {
                // busca en la base de datos el nombre de la lista existe en nuestra guild y devuelve un embed
            } else if (message.content == `${prefix}listas`) {
                // comando para mostrar listas almacenadas de la guild y enlace para administrar las listas
                // en esa vista hay que iniciar sesión y comprobar que la guild_id que se le pasa a la ruta esté entre las guilds del usuario que ha iniciado sesión
            }
        }
    });
});

async function execute(message, server_queue) {
    const voice_channel = message.member.voice.channel;

    if (!voice_channel) return message.channel.send("Debes estar conectado a un canal de voz.");

    const permissions = voice_channel.permissionsFor(message.client.user);

    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send("Tienes que tener permisos para entrar y hablar en el canal de voz.");
    }

    const argument = message.content.split(" ");

    const songInfo = await ytdl.getInfo(argument[1]);
    // añadir para agregar a la lista canciones por su nombre

    const song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url
    };

    if (!server_queue) {
        const queue_contruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
        };

        queue.set(message.guild.id, queue_contruct);

        queue_contruct.songs.push(song);

        try {
            var connection = await voice_channel.join();
            queue_contruct.connection = connection;
            play(message.guild, queue_contruct.songs[0]);
        } catch (error) {
            console.log(error);
            queue.delete(message.guild.id);
            return message.channel.send(error);
        }

    } else {
        server_queue.songs.push(song);
        return message.channel.send(`${song.title} añadido a la lista de reproducción!`);
    }
}

function skip(message, server_queue) {
    if (!message.member.voice.channel)
        return message.channel.send(
            "Debes estar conectado al canal de voz para pasar a la siguiente canción."
        );
    if (!server_queue)
        return message.channel.send("No hay más canciones.");
    server_queue.connection.dispatcher.end();
}

function stop(message, server_queue) {
    if (!message.member.voice.channel)
        return message.channel.send(
            "Debes estar conectado al canal de voz para parar la música."
        );
    server_queue.songs = [];
    server_queue.connection.dispatcher.end();
}

function play(guild, song) {
    const server_queue = queue.get(guild.id);

    if (!song) {
        server_queue.voiceChannel.leave();
        return queue.delete(guild.id);
    }

    const dispatcher = server_queue.connection
        .play(ytdl(song.url))
        .on("finish", () => {
            server_queue.songs.shift();
            play(guild, server_queue.songs[0]);
        })
        .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(server_queue.volume / 5);
    server_queue.textChannel.send(`Reproduciendo **${song.title}**`);
}

client.login(process.env.TOKEN);

async function addSong(url, guild) {
    const song_info = await ytdl.getInfo(url);

    const server_queue = queue.get(guild);

    const song = {
        title: song_info.videoDetails.title,
        url: song_info.videoDetails.video_url
    };

    server_queue.songs.push(song);
}

function deleteSong(title, guild) {
    const server_queue = queue.get(guild);

    server_queue.songs.forEach((element, ind) => {
        if (element.title == title) {
            server_queue.songs.splice(ind)
        }
    });
}

module.exports = {
    queue, addSong, deleteSong
};