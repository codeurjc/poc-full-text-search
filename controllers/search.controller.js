const db = require("../models/index");
const validateLanguage = require("../utils/utils").validateLanguage;
const ISO6391 = require('iso-639-1');

// Retrieve searches based on query words
exports.search = async (req, res) => {
    let lang = req.query.lang;
    const table = req.query.table;
    const wordsToSearch = req.query.words.split(',');
    let search = "";

    // Append the terms to search with OR operator
    wordsToSearch.forEach((word, index, array) => {
        search += word;
        if (index !== (array.length - 1)) {
            search += " OR ";
        }
    });

    // If lang parameter defined, filter also by the language of the event
    if (!!lang) {
        try {
            validateLanguage(lang);
            lang = "lang = '" + ISO6391.getName(lang) + "' and";
            lang = lang.toLowerCase();
        } catch (error) {
            res.status(error.status).send({
                message: error.message
            });
            return;
        }
    } else {
        lang = '';
    }

    const query = SEARCH_QUERY
        .split("%table%").join(table)
        .split("%search%").join(search)
        .split("%lang_condition%").join(lang);

    console.log(query);
    const result = await db.sequelize.query(query);
    res.send(result[0]);
};

const SEARCH_QUERY = `
SELECT id, title, lang, pgroonga_score(tableoid, ctid) AS score
FROM %table%
WHERE %lang_condition% ARRAY[title, description] &@~ ('%search%', ARRAY[2, 1], '%table%_pgroonga_index')::pgroonga_full_text_search_condition
ORDER BY score DESC;
`.replace(/\n|\r/g, ' '); // Replace new line chars with a single white space