require('dotenv').config();
require("./discord/discord");
require('./discord/admin-commands.js');
require('./discord/commands.js');
require('./discord/music.js');
require('./discord/videogames.js');

const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");

app.listen(process.env.PORT);

app.use(session({
    secret: '48738924783748273742398747238',
    resave: false,
    saveUninitialized: false,
    expires: 604800000,
}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

//routes
app.get("/", (req, res) => {
    res.render("index", { user: req.session.user || null });
});

require("./routes/auth")(app);

require("./routes/dashboard")(app);

// DEV ROUTES

require("./routes/database")(app);