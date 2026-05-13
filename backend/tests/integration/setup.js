require("dotenv").config();

const bcrypt = require("bcrypt");

process.env.NODE_ENV = "development";

global.console.log = jest.fn();
global.console.error = jest.fn();

const { sequelize, User, Article, Tag, Comment } = require("../../models");

const seedUser = async (data = {}) => {
    const defaults = {
        username: "testuser",
        email: "test@example.com",
        password: await bcrypt.hash("testpassword", 10),
        bio: "Test bio",
        image: "https://example.com/image.jpg",
    };

    return User.create({ ...defaults, ...data });
};

const seedArticle = async (userId, data = {}) => {
    const defaults = {
        title: "Test Article",
        description: "Test description",
        body: "Test body content",
        slug: `test-article-${Date.now()}`,
        userId,
    };

    return Article.create({ ...defaults, ...data });
};

const seedTag = async (data = {}) => {
    const defaults = {
        name: `test-tag-${Date.now()}`,
    };

    return Tag.create({ ...defaults, ...data });
};

const seedComment = async (userId, articleId, data = {}) => {
    const defaults = {
        body: "Test comment",
        userId,
        articleId,
    };

    return Comment.create({ ...defaults, ...data });
};

beforeAll(async () => {
    try {
        await sequelize.sync({ force: true });
    } catch (error) {
        console.warn("Sync warning (may be expected):", error.message);
    }
});

beforeEach(async () => {
    try {
        await Tag.destroy({ where: {} });
        await Comment.destroy({ where: {} });
        await Article.destroy({ where: {} });
        await User.destroy({ where: {} });
    } catch (error) {
        console.error("Failed to clean database:", error.message);
        throw error;
    }
}, 10000);

afterAll(async () => {
    await sequelize.close();
});

module.exports = {
    sequelize,
    User,
    Article,
    Tag,
    Comment,
    seedUser,
    seedArticle,
    seedTag,
    seedComment,
};
