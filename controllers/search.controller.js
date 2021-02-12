const db = require("../models");
const Search = db.searches;
const Op = db.Sequelize.Op;

// Retrieve all Searches from the database
exports.findAll = (req, res) => {
    Search.findAll()
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving searches"
            });
        });
};