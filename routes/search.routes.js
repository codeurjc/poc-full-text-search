module.exports = app => {

    const events = require("../controllers/search.controller.js");
    const router = require("express").Router();

    // Retrieve all Searches
    router.get("/", events.findAll);

    // Perform a search based on language and a collection of searched words
    router.get("/search", events.search);

    app.use('/api/searches', router);
};