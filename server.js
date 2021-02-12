process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const db = require("./models/index");
const languageFromCodeToName = require("./utils/utils").languageFromCodeToName;

startDB();
startServer();

async function startDB() {
    await db.sequelize.authenticate();
    console.log("Authentication with DB successful");
    await db.sequelize.sync({
        force: true
    });
    console.log("DB dropped and re-synced");
    await initializeTrigger();
    await feedSampleData();
}

function startServer() {
    const app = express();

    app.use(cors());

    // parse requests of content-type - application/json
    app.use(bodyParser.json());

    // parse requests of content-type - application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    // set port, listen for requests
    require("./routes/event.routes")(app);
    require("./routes/search.routes")(app);
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

async function initializeTrigger() {
    await createTriggerFunction();
    await createTrigger('events');
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

const CREATE_TRIGGER_FUNCTION = `
CREATE OR REPLACE FUNCTION function_update_searches_table() RETURNS trigger AS
$BODY$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO searches("id","text","title","vector","objectType","createdAt","updatedAt") VALUES (NEW."id",CONCAT(NEW."title",' ',NEW."description"),NEW."title",to_tsvector(NEW."lang"::regconfig,CONCAT(NEW."title",' ',NEW."description")),'event',NEW."createdAt",NEW."updatedAt");
        RETURN NEW;
    ELSEIF TG_OP = 'UPDATE' THEN
        UPDATE searches SET "text" = CONCAT(NEW."title",' ',NEW."description"), "title" = NEW."title", "vector" = to_tsvector(NEW."lang"::regconfig,CONCAT(NEW."title",' ',NEW."description")), "updatedAt" = NEW."updatedAt";
        RETURN NEW;
    ELSEIF TG_OP = 'DELETE' THEN
        DELETE FROM searches WHERE searches."id" = OLD."id";
        RETURN OLD;
    END IF;
END;
$BODY$
language PLPGSQL
`.replace(/\n|\r/g, ' ');

const CREATE_TRIGGER = `
CREATE TRIGGER trigger_%tablename%
    AFTER INSERT OR UPDATE OR DELETE ON %tablename%
    FOR EACH ROW
    EXECUTE PROCEDURE function_update_searches_table();
`.replace(/\n|\r/g, ' ');

async function createTriggerFunction() {
    console.log('Creating trigger function');
    await db.sequelize.query(CREATE_TRIGGER_FUNCTION);
}

async function createTrigger(table) {
    console.log(`Creating trigger for table ${table}`);
    const query = CREATE_TRIGGER.split("%tablename%").join(table);
    await db.sequelize.query(query);
}