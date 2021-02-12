const db = require("../models/index");
const validateLanguage = require("../utils/utils").validateLanguage;
const languageFromCodeToName = require("../utils/utils").languageFromCodeToName;
const Event = db.events;
const Op = db.Sequelize.Op;

// Create new Event
exports.create = (req, res) => {
    try {
        validateEvent(req.body);
    } catch (error) {
        res.status(error.status).send({
            message: error.message
        });
        return;
    }
    req.body.lang = languageFromCodeToName(req.body.lang);
    const newEvent = {
        title: req.body.title,
        description: req.body.description,
        lang: req.body.lang
    };
    Event.create(newEvent)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Event"
            });
        });
};

// Retrieve all Events from the database
exports.findAll = (req, res) => {
    const title = req.query.title;
    const lang = req.query.lang;

    var condition = {};
    if (title != null) {
        condition.title = {
            [Op.iLike]: `%${title}%`
        };
    }
    if (lang != null) {
        condition.lang = {
            [Op.like]: `${lang}`
        };
    }

    Event.findAll({
            where: condition
        })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving events"
            });
        });
};

// Find a single Event with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Event.findByPk(id)
        .then(data => {
            if (data != null) {
                res.send(data);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Event with id=" + id
            });
        });
};

// Update an Event by the id in the request
exports.update = (req, res) => {
    try {
        validateEvent(req.body);
    } catch (error) {
        res.status(error.status).send({
            message: error.message
        });
        return;
    }
    const id = req.params.id;

    updateAux(res, id, req.body);
};

// Patch an Event by the id in the request
exports.patch = (req, res) => {
    const id = req.params.id;
    updateAux(res, id, req.body);
};

function updateAux(res, id, body) {
    body = formatLanguage(body);
    Event.update(body, {
            where: {
                id: id
            }
        })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Event was updated successfully"
                });
            } else {
                res.send({
                    message: `Cannot update Event with id=${id}. Maybe Event was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Event with id=" + id
            });
        });
}

// Delete an Event with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    Event.destroy({
            where: {
                id: id
            }
        })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Event was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete Event with id=${id}. Maybe Event was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Event with id=" + id
            });
        });
};

// Delete all Events from the database
exports.deleteAll = (req, res) => {
    Event.destroy({
            where: {},
            truncate: false
        })
        .then(nums => {
            res.send({
                message: `${nums} Events were deleted successfully!`
            });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while deleting all Events"
            });
        });
};

function validateEvent(event) {
    if (!event.title) {
        throw {
            status: 400,
            message: "'title' can not be empty"
        };
    }
    if (!event.description) {
        throw {
            status: 400,
            message: "'description' can not be empty"
        };
    }
    validateLanguage(event.lang);
}