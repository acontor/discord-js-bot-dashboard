const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const database_name = path.join(__dirname, "database.db");

const database = new sqlite3.Database(database_name, error => {
    if (error) {
        return console.error(error.message);
    }
});

// GUILDS

function selectGuild(id, callback) {
    database.all('SELECT * FROM guilds WHERE id = ? LIMIT 1',
        id, function (error, rows) {
            if (error) {
                callback(error, null);
            } else
                callback(null, rows);
        });
}

function selectGuildCommandsEnable(id, callback) {
    database.all('SELECT commands_enable FROM guilds WHERE id = ? LIMIT 1',
        id, function (error, rows) {
            if (error) {
                callback(error, null);
            } else
                callback(null, rows);
        });
}

function selectGuildMusicEnable(id, callback) {
    database.all('SELECT music_enable FROM guilds WHERE id = ? LIMIT 1',
        id, function (error, rows) {
            if (error) {
                callback(error, null);
            } else
                callback(null, rows);
        });
}

function insertGuild(id, name, icon, bot, enable, commands_enable, admin_enable, music_enable) {
    database.run(`INSERT INTO guilds (id, name, icon, bot, enable, commands_enable, admin_enable, music_enable) VALUES (${id}, ${name}, ${icon}, ${bot}, ${enable}, ${commands_enable}, ${admin_enable}, ${music_enable});`, error => {
        if (error) { return console.error(error.message); }
    });
    selectAdminCommands(function (error, content) {
        if (error) return console.log(error);
        database.run(`INSERT INTO adminCommandsGuilds (guild_id, admin_command_id, enable) VALUES (${id}, ${content[0].id}, true);`, error => {
            if (error) { return console.error(error.message); }
        });
    });
}

function updateGuildBot(id, bot) {
    database.run(`UPDATE guilds SET bot = ${bot} WHERE id = ${id};`, error => {
        if (error) { return console.error(error.message); }
    });
}

function updateGuildCommands(id, enable) {
    database.run(`UPDATE guilds SET commands_enable = ${enable} WHERE id = ${id};`, error => {
        if (error) { return console.error(error.message); }
    });
}

function updateGuildAdminCommands(id, enable) {
    database.run(`UPDATE guilds SET admin_enable = ${enable} WHERE id = ${id};`, error => {
        if (error) { return console.error(error.message); }
    });
}

function updateGuildMusic(id, enable) {
    database.run(`UPDATE guilds SET music_enable = ${enable} WHERE id = ${id};`, error => {
        if (error) { return console.error(error.message); }
    });
}

// ADMIN COMMANDS

function selectAdminCommands(callback) {
    database.all('SELECT id, name, description FROM adminCommands;',
        function (error, rows) {
            if (error) {
                callback(error, null);
            } else
                callback(null, rows);
        });
}

function selectGuildAdminCommands(id, callback) {
    database.all('SELECT g.admin_enable, acg.id, acg.enable, ac.name, ac.description FROM adminCommandsGuilds acg JOIN adminCommands ac ON acg.admin_command_id = ac.id JOIN guilds g ON acg.guild_id = g.id WHERE acg.guild_id = ?;',
        id, function (error, rows) {
            if (error) {
                callback(error, null);
            } else
                callback(null, rows);
        });
}

function updateAdminCommand(id, enable) {
    database.run(`UPDATE adminCommandsGuilds SET enable = ${enable} WHERE id = ${id};`, error => {
        if (error) { return console.error(error.message); }
    });
}

// COMMANDS

function selectGuildCommands(id, callback) {
    database.all('SELECT * FROM commands WHERE guild_id = ?;',
        id, function (error, rows) {
            if (error) {
                callback(error, null);
            } else
                callback(null, rows);
        });
}

function insertCommand(name, description, action, enable, guild_id) {
    database.run(`INSERT INTO commands (name, description, action, enable, guild_id) VALUES ("${name}", "${description}", "${action}", ${enable}, ${guild_id});`, error => {
        if (error) { return console.error(error.message); }
    });
}

function updateCommand(id, name, description, action, enable) {
    database.run(`UPDATE commands SET name = ${name}, description = ${description}, action = ${action}, enable = ${enable} WHERE id = ${id};`, error => {
        if (error) { return console.error(error.message); }
    });
}

function deleteCommand(id) {
    database.run(`DELETE FROM commands WHERE id = ${id};`, error => {
        if (error) { return console.error(error.message); }
    });
}

module.exports = {
    selectGuild, selectGuildCommandsEnable, selectGuildMusicEnable, insertGuild, updateGuildBot, updateGuildAdminCommands, updateGuildCommands, updateGuildMusic, selectAdminCommands, updateAdminCommand, selectGuildAdminCommands, selectGuildCommands, insertCommand, updateCommand, deleteCommand
}