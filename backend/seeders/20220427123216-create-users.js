const bcrypt = require("bcrypt");

("use strict");

module.exports = {
    async up(queryInterface, Sequelize) {
        const users = await Promise.all(
            Array(5)
                .fill(null)
                .map(async (_, index) => ({
                    username: `exampleUser${index + 1}`,
                    email: `example${index + 1}@mail.com`,
                    password: await bcrypt.hash(`examplePwd${index + 1}`, 10),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })),
        );

        await queryInterface.bulkInsert("Users", users, {});

        // Get User model
        const { User } = require("../models");

        // Fetch created users
        const user1 = await User.findByPk(1);
        const user2 = await User.findByPk(2);
        const user3 = await User.findByPk(3);
        const user4 = await User.findByPk(4);
        const user5 = await User.findByPk(5);

        // user5 follows all others to see all articles in "Your Feed"
        await user5.addFollowing(user1);
        await user5.addFollowing(user2);
        await user5.addFollowing(user3);
        await user5.addFollowing(user4);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("Followers", null, {});
        await queryInterface.bulkDelete("Users", null, {});
    },
};
