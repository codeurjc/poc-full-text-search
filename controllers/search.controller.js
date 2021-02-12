const db = require("../models/index");
const validateLanguage = require("../utils/utils").validateLanguage;
const ISO6391 = require('iso-639-1');
const Search = db.searches;

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

// Retrieve searches based on query words
exports.search = async (req, res) => {
    const lang = req.query.lang;
    const wordsToSearch = req.query.words.split(',');
    let search = "";
    wordsToSearch.forEach((word, index, array) => {
        search += word;
        if (index !== (array.length - 1)) {
            search += " | ";
        }
    });
    try {
        validateLanguage(lang);
    } catch (error) {
        res.status(error.status).send({
            message: error.message
        });
        return;
    }
    const result = await db.sequelize.query("SELECT * FROM searches WHERE vector @@ to_tsquery('" + ISO6391.getName(lang).toLowerCase() + "', '" + search + "')");
    res.send(result[0]);
};