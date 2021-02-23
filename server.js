process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Import native dependencies
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Import custom dependencies
const db = require("./models/index");
const languageFromCodeToName = require("./utils/utils").languageFromCodeToName;

// Start DB and server
startDB();
startServer();

async function startDB() {
    await db.sequelize.authenticate();
    console.log("Authentication with DB successful");
    await db.sequelize.sync({
        force: true
    });
    console.log("DB dropped and re-synced");
    await createPgroongaIndexes();
    await feedSampleData();
}

function startServer() {
    const app = express();

    app.use(cors());

    // Parse requests of content-type "pplication/json"
    app.use(bodyParser.json());

    // Parse requests of content-type "application/x-www-form-urlencoded"
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    // Set API endpoints, configure port and listen for requests
    require("./routes/event.routes")(app);
    require("./routes/search.routes")(app);
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

/**
 * Generate in PostgreSQL the trigger to insert/update/delete
 * the "search" table upon data table modifications
 */
async function createPgroongaIndexes() {
    await createIndex('events',['title','description']);
}

async function feedSampleData() {
    const Event = db.events;
    Event.sync().then(() => {
        const sampleData = require("./sample-data/events");
        sampleData.forEach(element => {
            element.lang = languageFromCodeToName(element.lang);
            Event.create(element);
        });
    });
}

const CREATE_INDEX = `
CREATE INDEX %tablename%_pgroonga_index ON %tablename% USING PGroonga ((ARRAY[%column%]));
`.replace(/\n|\r/g, ' '); // Replace new line chars with a single white space

async function createIndex(table, columns) {
    let columnsParam = '';
    columns.forEach((column, i, array) => {
        columnsParam += column;
        if (i < array.length - 1) {
            columnsParam += ', ';
        }
    });
    console.log(`Creating pgroonga index ${table}_pgroonga_index for table ${table}`);
    const query = CREATE_INDEX.split("%tablename%").join(table).split('%column%').join(columnsParam);
    await db.sequelize.query(query);
}