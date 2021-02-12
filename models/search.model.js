const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
    const Search = sequelize.define("search", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false
        },
        text: {
            type: Sequelize.TEXT
        },
        title: {
            type: Sequelize.TEXT
        },
        lang: {
            type: Sequelize.STRING
        },
        vector: {
            type: 'TSVECTOR'
        },
        objectType: {
            type: Sequelize.STRING
        }
    });
    return Search;
};