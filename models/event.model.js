module.exports = (sequelize, Sequelize) => {
    const Event = sequelize.define("event", {
        title: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.STRING
        },
        lang: {
            type: Sequelize.STRING
        }
    });
    return Event;
};