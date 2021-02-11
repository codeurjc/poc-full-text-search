process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const db = require("./models");
db.sequelize.sync({
    force: true
}).then(() => {
    console.log("Drop and re-sync db.");
});

const app = express();

app.use(cors());

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: true
}));

// simple route
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to bezkoder application."
    });
});

// set port, listen for requests
require("./routes/event.routes")(app);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});