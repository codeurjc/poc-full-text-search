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
    const query = SEARCH_QUERY.split("%search%").join(search).split("%lang%").join(ISO6391.getName(lang).toLowerCase());
    console.log(query);
    const result = await db.sequelize.query(query);
    res.send(result[0]);
};

const SEARCH_QUERY = `
SELECT title, ts_rank_cd(vector,'%search%') AS rank
FROM searches
WHERE vector @@ to_tsquery('%lang%','%search%')
ORDER BY rank DESC
`.replace(/\n|\r/g, ' '); // Replace new line chars with a single white space