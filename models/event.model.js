module.exports = (sequelize, Sequelize) => {
    const Event = sequelize.define("event", {
        title: {
            type: Sequelize.TEXT
        },
        description: {
            type: Sequelize.TEXT
        },
        lang: {
            type: Sequelize.STRING
        }
    });
    return Event;
};