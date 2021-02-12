const ISO6391 = require('iso-639-1');

function validateLanguage(code) {
    if (!code) {
        throw {
            status: 400,
            message: "'lang' can not be empty"
        };
    } else {
        if (!ISO6391.validate(code)) {
            throw {
                status: 400,
                message: "'lang' is not a valid language (ISO 639-1 code)"
            };
        }
    }
}

function languageFromCodeToName(code) {
    return ISO6391.getName(code).toLowerCase();
}

module.exports.validateLanguage = validateLanguage;
module.exports.languageFromCodeToName = languageFromCodeToName;