"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        const tags = [
            { name: "javascript" },
            { name: "typescript" },
            { name: "react" },
            { name: "vue" },
            { name: "angular" },
            { name: "nodejs" },
            { name: "express" },
            { name: "postgresql" },
            { name: "mongodb" },
            { name: "testing" },
            { name: "css" },
            { name: "html" },
            { name: "api" },
            { name: "graphql" },
            { name: "rest" },
            { name: "docker" },
            { name: "kubernetes" },
            { name: "devops" },
            { name: "security" },
            { name: "performance" },
        ];

        await queryInterface.bulkInsert("Tags", tags, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("Tags", null, {});
    },
};
