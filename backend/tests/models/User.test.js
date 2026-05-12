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

const defineUser = require("../../models/User");

describe("User Model", () => {
    let User;
    let DataTypes;

    beforeEach(() => {
        DataTypes = {
            STRING: "STRING",
            TEXT: "TEXT",
        };

        const sequelize = {};

        User = defineUser(sequelize, DataTypes);

        User.belongsTo = jest.fn();
        User.hasMany = jest.fn();
        User.belongsToMany = jest.fn();
    });

    it("should have been created with the correct attributes", () => {
        expect(User.rawAttributes.email).toBe(DataTypes.STRING);
        expect(User.rawAttributes.username).toBe(DataTypes.STRING);
        expect(User.rawAttributes.bio).toBe(DataTypes.TEXT);
        expect(User.rawAttributes.image).toBe(DataTypes.TEXT);
        expect(User.rawAttributes.password).toBe(DataTypes.STRING);
    });

    it("should have created relationships correctly", () => {
        const Article = { name: "Article" };
        const Comment = { name: "Comment" };

        User.associate({ Article, Comment, User });

        expect(User.hasMany).toHaveBeenCalledWith(Article, {
            foreignKey: "userId",
            onDelete: "CASCADE",
        });

        expect(User.hasMany).toHaveBeenCalledWith(Comment, {
            foreignKey: "articleId",
        });

        expect(User.belongsToMany).toHaveBeenCalledWith(Article, {
            through: "Favorites",
            as: "favorites",
            foreignKey: "userId",
            timestamps: false,
        });

        expect(User.belongsToMany).toHaveBeenCalledWith(User, {
            through: "Followers",
            as: "followers",
            foreignKey: "userId",
            timestamps: false,
        });

        expect(User.belongsToMany).toHaveBeenCalledWith(User, {
            through: "Followers",
            as: "following",
            foreignKey: "followerId",
            timestamps: false,
        });
    });

    it("should exclude sensitive fields from toJSON", () => {
        const instance = {
            get: () => ({
                id: 1,
                email: "test@example.com",
                username: "testuser",
                bio: "Test bio",
                image: "https://example.com/image.jpg",
                password: "hashed_password",
                createdAt: new Date(),
                updatedAt: new Date(),
            }),
        };

        const json = User.prototype.toJSON.call(instance);

        expect(json.id).toBeUndefined();
        expect(json.password).toBeUndefined();
        expect(json.updatedAt).toBeUndefined();
        expect(json.createdAt).toBeUndefined();
        expect(json.email).toBe("test@example.com");
        expect(json.username).toBe("testuser");
    });
});
