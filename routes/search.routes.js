module.exports = app => {

    const events = require("../controllers/search.controller.js");
    const router = require("express").Router();

    // Retrieve all Searches
    router.get("/", events.findAll);

    app.use('/api/searches', router);
};