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

const defineTag = require("../../models/Tag");

describe("Tag Model", () => {
    let Tag;
    let DataTypes;

    beforeEach(() => {
        DataTypes = {
            STRING: "STRING",
        };

        const sequelize = {};

        Tag = defineTag(sequelize, DataTypes);

        Tag.belongsTo = jest.fn();
        Tag.hasMany = jest.fn();
        Tag.belongsToMany = jest.fn();
    });

    it("should have been created with the correct attributes", () => {
        expect(Tag.rawAttributes.name).toBeDefined();
        expect(Tag.rawAttributes.name.type).toBe(DataTypes.STRING);
        expect(Tag.rawAttributes.name.primaryKey).toBe(true);
        expect(Tag.rawAttributes.name.allowNull).toBe(false);
    });

    it("should have created relationships correctly", () => {
        const Article = { name: "Article" };

        Tag.associate({ Article });

        expect(Tag.belongsToMany).toHaveBeenCalledWith(Article, {
            through: "TagList",
            foreignKey: "tagName",
            timestamps: false,
        });
    });

    it("should exclude internal fields from toJSON", () => {
        const instance = {
            get: () => ({
                name: "javascript",
                id: 1,
                userId: 2,
                TagList: { some: "data" },
            }),
        };

        const json = Tag.prototype.toJSON.call(instance);

        expect(json.name).toBe("javascript");
        expect(json.id).toBeUndefined();
        expect(json.userId).toBeUndefined();
        expect(json.TagList).toBeUndefined();
    });

    it("should have timestamps disabled", () => {
        expect(Tag.options.timestamps).toBe(false);
    });
});
