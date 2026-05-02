jest.mock("sequelize", () => {
    class MockModel {
        static init(attributes, options) {
            this.rawAttributes = attributes;
            this.options = options;
            return this;
        }

        static belongsTo = jest.fn();
    }

    return {
        Model: MockModel,
    };
});

const defineComment = require("../../models/Comment");

describe("Comment Model", () => {
    let Comment;
    let DataTypes;

    beforeEach(() => {
        DataTypes = {
            INTEGER: { key: "INTEGER" },
            TEXT: { key: "TEXT" },
        };

        const sequelize = {};

        Comment = defineComment(sequelize, DataTypes);
        Comment.belongsTo = jest.fn();
    });

    it("should define id as primary key", () => {
        const idAttr = Comment.rawAttributes.id;

        expect(idAttr.allowNull).toBe(false);
        expect(idAttr.autoIncrement).toBe(true);
        expect(idAttr.primaryKey).toBe(true);
        expect(idAttr.type).toBe(DataTypes.INTEGER);
    });

    it("should define body as TEXT", () => {
        expect(Comment.rawAttributes.body).toBe(DataTypes.TEXT);
    });

    it("should define associations", () => {
        const User = {};
        const Article = {};

        Comment.associate({ User, Article });

        expect(Comment.belongsTo).toHaveBeenCalledWith(Article, {
            foreignKey: "articleId",
        });

        expect(Comment.belongsTo).toHaveBeenCalledWith(User, {
            as: "author",
            foreignKey: "userId",
        });
    });

    it("should exclude articleId and userId from toJSON", () => {
        const instance = {
            get: () => ({
                id: 1,
                body: "Test comment",
                articleId: 10,
                userId: 20,
            }),
        };

        const json = Comment.prototype.toJSON.call(instance);

        expect(json).toEqual({
            id: 1,
            body: "Test comment",
            articleId: undefined,
            userId: undefined,
        });
    });
});
