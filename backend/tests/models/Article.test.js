jest.mock("sequelize", () => {
    class MockModel {
        static init(attributes, options) {
            this.rawAttributes = attributes;
            this.options = options;
            return this;
        }
        static belongsTo = jest.fn();
        static hasMany = jest.fn();
        static belongsToMany = jest.fn();
    }

    return {
        Model: MockModel,
    };
});

const defineArticle = require("../../models/Article");

describe("Article Model", () => {
    let Article;
    let DataTypes;

    beforeEach(() => {
        DataTypes = {
            STRING: "STRING",
            TEXT: "TEXT",
        };

        const sequelize = {};

        // initialize the model
        Article = defineArticle(sequelize, DataTypes);

        // mock relationship methods specifically for Article
        Article.belongsTo = jest.fn();
        Article.hasMany = jest.fn();
        Article.belongsToMany = jest.fn();
    });

    it("should have been created with the correct attributes", () => {
        // test that checks that the article was created correctly
        expect(Article.rawAttributes.slug).toBe(DataTypes.STRING);
        expect(Article.rawAttributes.title).toBe(DataTypes.STRING);
        expect(Article.rawAttributes.description).toBe(DataTypes.TEXT);
        expect(Article.rawAttributes.body).toBe(DataTypes.TEXT);
    });

    it("should have created relationships correctly", () => {
        // test that checks that the article's relationships were created correctly
        const User = { name: "User" };
        const Tag = { name: "Tag" };
        const Comment = { name: "Comment" };

        Article.associate({ User, Tag, Comment });

        expect(Article.belongsTo).toHaveBeenCalledWith(User, {
            foreignKey: "userId",
            as: "author",
        });

        expect(Article.hasMany).toHaveBeenCalledWith(Comment, {
            foreignKey: "articleId",
            onDelete: "cascade",
        });

        expect(Article.belongsToMany).toHaveBeenCalledWith(Tag, {
            through: "TagList",
            as: "tagList",
            foreignKey: "articleId",
            timestamps: false,
            onDelete: "cascade",
        });

        expect(Article.belongsToMany).toHaveBeenCalledWith(User, {
            through: "Favorites",
            foreignKey: "articleId",
            timestamps: false,
        });
    });

    it("should exclude id and userId from toJSON", () => {
        // test that checks that id and userId are hidden in toJSON

        const instance = {
            get: () => ({
                id: 1,
                slug: "test-article",
                title: "Test Article",
                description: "Description",
                body: "Body",
                userId: 2,
            }),
        };

        const json = Article.prototype.toJSON.call(instance);

        expect(json).toEqual({
            id: undefined,
            slug: "test-article",
            title: "Test Article",
            description: "Description",
            body: "Body",
            userId: undefined,
        });
    });
});
