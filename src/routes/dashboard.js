const client = require("../discord/discord");
const { updateGuildBot, updateGuildAdminCommands, updateGuildCommands, updateGuildMusic, selectGuildAdminCommands, updateAdminCommand, selectGuildCommands, insertCommand, updateCommand, deleteCommand } = require("../database/database");
const { queue, addSong, deleteSong } = require("../discord/music");

module.exports = app => {

    // GUILDS

    app.get('/dashboard/guilds', (request, response) => {
        if (!request.session.user) return response.redirect('/login');

        return response.render('guilds', { user: request.session.user });
    });

    app.post('/dashboard/guild/set', (request, response) => {
        if (!request.session.user) return response.redirect('/login');

        request.session.user.guilds.forEach(guild => {
            let bot;
            if (guild.id == request.body.id && client.client.guilds.cache.get(guild.id)) {
                bot = true;
            } else if (guild.id == request.body.id && !client.client.guilds.cache.get(guild.id)) {
                bot = false;
            } else {
                return;
            }
            updateGuildBot(guild.id, bot);
            let guild_data = {
                id: guild.id,
                name: guild.name,
                icon: guild.icon,
                bot: bot,
                enable: guild.enable,
                commands_enable: guild.commands_enable,
                admin_enable: guild.admin_enable,
                music_enable: guild.music_enable
            };
            request.session.user.guild = guild_data;
        });

        return response.redirect('/dashboard/guilds');
    });

    app.post('/dashboard/guild/unset', (request, response) => {
        if (!request.session.user) return response.redirect('/login');
        if (!request.session.user.guild) return response.redirect('/dashboard/guilds');

        request.session.user.guild = null;

        return response.redirect('/dashboard/guilds');
    });

    // ADMIN COMMANDS

    app.get('/dashboard/admin-commands', (request, response) => {
        if (!request.session.user) return response.redirect('/login');
        if (!request.session.user.guild) return response.redirect('/dashboard/guilds');

        selectGuildAdminCommands(request.session.user.guild.id, function (error, content) {
            if (error) return console.log(error);

            return response.render('admin-commands', { user: request.session.user || null, commands: content });
        });
    });

    app.post("/dashboard/admin-commands/enable", (request, response) => {
        if (!request.session.user) return response.redirect('/login');
        if (!request.session.user.guild) return response.redirect('/dashboard/guilds');

        let admin_commands_enable = false;
        if (request.body.admin_commands_enable == 1) {
            admin_commands_enable = true;
        }
        request.session.user.guild.admin_enable = admin_commands_enable;
        updateGuildAdminCommands(request.session.user.guild.id, admin_commands_enable);

        return response.redirect("/dashboard/admin-commands");
    });

    app.post("/dashboard/admin-commands/edit/:id", (request, response) => {
        if (!request.session.user) return response.redirect('/login');
        if (!request.session.user.guild) return response.redirect('/dashboard/guilds');

        let enable = true;
        if (request.body.enable == undefined) {
            enable = false;
        }

        updateAdminCommand(request.params.id, enable);

        return response.redirect("/dashboard/admin-commands");
    });

    // COMMANDS

    app.get("/dashboard/commands", (request, response) => {
        if (!request.session.user) return response.redirect('/login');
        if (!request.session.user.guild) return response.redirect('/dashboard/guilds');

        selectGuildCommands(request.session.user.guild.id, function (error, content) {
            if (error) return console.log(error);

            return response.render("commands", { commands: content, user: request.session.user });
        });
    });

    app.post("/dashboard/commands/enable", (request, response) => {
        if (!request.session.user) return response.redirect('/login');
        if (!request.session.user.guild) return response.redirect('/dashboard/guilds');

        let commands_enable = false;
        if (request.body.commands_enable == 1) {
            commands_enable = true;
        }
        request.session.user.guild.commands_enable = commands_enable;
        updateGuildCommands(request.session.user.guild.id, commands_enable);

        return response.redirect("/dashboard/commands");
    });

    app.post("/dashboard/commands/create", (request, response) => {
        if (!request.session.user) return response.redirect('/login');
        if (!request.session.user.guild) return response.redirect('/dashboard/guilds');

        insertCommand(request.body.name, request.body.description, request.body.action, true, request.session.user.guild.id);

        return response.redirect("/dashboard/commands");
    });

    app.post("/dashboard/commands/edit/:id", (request, response) => {
        if (!request.session.user) return response.redirect('/login');
        if (!request.session.user.guild) return response.redirect('/dashboard/guilds');

        let enable = true;
        if (request.body.enable == undefined) {
            enable = false;
        }

        updateCommand(request.params.id, request.body.name, request.body.description, request.body.action, enable)

        return response.redirect("/dashboard/commands");
    });

    app.post("/dashboard/commands/delete/:id", (request, response) => {
        if (!request.session.user) return response.redirect('/login');
        if (!request.session.user.guild) return response.redirect('/dashboard/guilds');

        deleteCommand(request.params.id);

        return response.redirect("/dashboard/commands");
    });

    // MUSIC

    app.get('/dashboard/music', (request, response) => {
        if (!request.session.user) return response.redirect('/login');
        if (!request.session.user.guild) return response.redirect('/dashboard/guilds');

        if (queue.get(request.session.user.guild.id) != undefined) {
            return response.render('music', { model: queue.get(request.session.user.guild.id).songs, user: request.session.user });
        } else {
            // vista para crear queue quizás??
            return response.render('music', { model: null, user: request.session.user });
        }
    });

    app.post("/dashboard/music/enable", (request, response) => {
        if (!request.session.user) return response.redirect('/login');
        if (!request.session.user.guild) return response.redirect('/dashboard/guilds');

        let music_enable = false;
        if (request.body.music_enable == 1) {
            music_enable = true;
        }
        request.session.user.guild.music_enable = music_enable;
        updateGuildMusic(request.session.user.guild.id, music_enable);

        return response.redirect("/dashboard/music");
    });

    app.post('/dashboard/music/delete/:title', (request, response) => {
        if (!request.session.user) return response.redirect('/login');
        if (!request.session.user.guild) return response.redirect('/dashboard/guilds');

        const title = request.params.title;
        deleteSong(title, request.session.guild);

        return response.redirect('/dashboard/music');
    });

    app.post('/dashboard/music/add', (request, response) => {
        if (!request.session.user) return response.redirect('/login');
        if (!request.session.user.guild) return response.redirect('/dashboard/guilds');

        const url = request.body.url;
        addSong(url, request.session.guild);

        setTimeout(function () {
            return response.redirect('/dashboard/music');
        }, 1500);
    });

    // ABOUT

    app.get('/dashboard/about', (request, response) => {
        if (!request.session.user) return response.redirect('/login');
        if (!request.session.user.guild) return response.redirect('/dashboard/guilds');

        if (!request.session.user) return response.redirect('/login');

        return response.render('about', { user: request.session.user });
    });

}