const { catchAsync } = require('../utils/utils');
const fetch = require('node-fetch');
const form_data = require('form-data');
const client = require("../discord/discord");
const { selectGuild, insertGuild, updateGuildBot } = require("../database/database");

const scopes = ["identify", "guilds"];

module.exports = app => {

    app.get('/login', (request, response) => {
        if (request.session.user) return response.redirect('/dashboard/guilds');

        let auth_url = `https://discordapp.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.AUTH_REDIRECT)}&response_type=code&scope=${scopes.join('%20')}`;

        response.redirect(auth_url);
    });

    app.get('/login/callback', catchAsync(async (request, response) => {
        if (request.session.user) return response.redirect('/dashboard/guilds');

        let access_code = request.query.code;

        if (!access_code) throw new Error('No access code returned frm Discord');

        let data = new form_data();
        data.append('client_id', process.env.CLIENT_ID);
        data.append('client_secret', process.env.CLIENT_SECRET);
        data.append('grant_type', 'authorization_code');
        data.append('redirect_uri', process.env.AUTH_REDIRECT);
        data.append('scope', scopes.join(' '));
        data.append('code', access_code);

        const api_response = await fetch('https://discordapp.com/api/oauth2/token', {
            method: 'POST',
            body: data
        });

        const json = await api_response.json();

        fetchDiscordUserInfo = await fetch('http://discordapp.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${json.access_token}`,
            }
        });

        const userInfo = await fetchDiscordUserInfo.json();

        userInfo.avatar = `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png`;
        userInfo.guilds = [];
        userInfo.guild = null;

        request.session.user = userInfo;

        fetchDiscordGuildInfo = await fetch('http://discordapp.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${json.access_token}`,
            }
        });

        const guildsInfo = await fetchDiscordGuildInfo.json();

        guildsInfo.forEach(guild => {
            if (guild.permissions == process.env.PERMISSIONS_ID) {
                selectGuild(guild.id, function (error, content) {
                    if (error) return console.log(error);
                    let guild_data;
                    let bot;
                    if (content.length == 1) {
                        if (client.client.guilds.cache.get(content[0].id)) {
                            bot = true;
                        } else {
                            bot = false;
                        }
                        updateGuildBot(content[0].id, bot);
                        guild_data = {
                            id: content[0].id,
                            name: content[0].name,
                            icon: content[0].icon,
                            bot: bot,
                            enable: content[0].enable,
                            commands_enable: content[0].commands_enable,
                            admin_enable: content[0].admin_enable,
                            music_enable: content[0].music_enable
                        };
                    } else {
                        guild.icon = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`;
                        if (client.client.guilds.cache.get(guild.id)) {
                            bot = true;
                            guild.enable = true;
                        } else {
                            bot = false;
                            guild.enable = false;
                        }
                        guild.commands_enable = false;
                        guild.admin_enable = false;
                        guild.music_enable = false;
                        insertGuild(guild.id, guild.name, guild.icon, bot, guild.enable, guild.commands_enable, guild.admin_enable, guild.music_enable);
                        guild_data = {
                            id: guild.id,
                            name: guild.name,
                            icon: guild.icon,
                            bot: bot,
                            enable: guild.enable,
                            commands_enable: guild.commands_enable,
                            admin_enable: guild.admin_enable,
                            music_enable: guild.music_enable
                        };
                    }
                    request.session.user.guilds.push(guild_data);
                });
            }
        });

        setTimeout(function () {
            response.redirect('/dashboard/guilds');
        }, 1500);
    }));

    app.get('/logout', (request, response) => {
        request.session.destroy();
        response.redirect('/');
    });
}