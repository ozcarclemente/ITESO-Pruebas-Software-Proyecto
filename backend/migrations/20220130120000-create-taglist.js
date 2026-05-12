"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("TagList", {
            articleId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "Articles",
                    key: "id",
                },
                onDelete: "cascade",
                primaryKey: true,
            },
            tagName: {
                type: Sequelize.STRING,
                allowNull: false,
                references: {
                    model: "Tags",
                    key: "name",
                },
                onDelete: "cascade",
                primaryKey: true,
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("TagList");
    },
};
