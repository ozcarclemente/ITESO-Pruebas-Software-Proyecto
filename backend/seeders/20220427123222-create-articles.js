"use strict";

const { User, Tag } = require("../models");

module.exports = {
    async up(queryInterface, Sequelize) {
        const users = await User.findAll();
        const tags = await Tag.findAll();

        const articles = Array(55)
            .fill(null)
            .map((_, index) => ({
                slug: `lorem-ipsum-${index + 1}`,
                title: `Lorem Ipsum ${index + 1}`,
                description: `${
                    index + 1
                } - Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
                body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. In nec ante lacinia magna ultricies cursus nec non lacus. Praesent blandit sodales semper. Mauris eget leo non erat molestie faucibus luctus sed ex. Duis sollicitudin tellus vitae aliquam cursus. Integer ultricies ultricies erat. Vivamus egestas ac augue nec mattis. Duis posuere bibendum ex vitae placerat. Duis in odio vestibulum, pellentesque odio vitae, egestas nibh.`,
                userId: users[Math.floor(Math.random() * users.length)].id,
                createdAt: new Date(),
                updatedAt: new Date(),
            }));

        const insertedArticles = await queryInterface.bulkInsert("Articles", articles, {
            returning: true,
        });

        // Assign random tags to each article
        const tagList = insertedArticles.map((article) => {
            const numTags = Math.floor(Math.random() * 4) + 1; // 1-4 tags per article
            const shuffledTags = tags.sort(() => 0.5 - Math.random()).slice(0, numTags);
            return shuffledTags.map((tag) => ({
                articleId: article.id,
                tagName: tag.name,
            }));
        }).flat();

        await queryInterface.bulkInsert("TagList", tagList, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("TagList", null, {});
        await queryInterface.bulkDelete("Articles", null, {});
    },
};
