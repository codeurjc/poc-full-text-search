module.exports = app => {

    const events = require("../controllers/event.controller.js");
    const router = require("express").Router();

    // Create a new Event
    router.post("/", events.create);

    // Retrieve all Events
    router.get("/", events.findAll);

    // Retrieve a single Event with id
    router.get("/:id", events.findOne);

    // Update a Event with id
    router.put("/:id", events.update);

    // Patch an Event with id
    router.patch("/:id", events.patch);

    // Delete a Event with id
    router.delete("/:id", events.delete);

    // Create a new Event
    router.delete("/", events.deleteAll);

    app.use('/api/events', router);
};