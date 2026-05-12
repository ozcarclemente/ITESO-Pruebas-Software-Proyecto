const {
    slugify,
    appendTagList,
    appendFavorites,
    appendFollowers,
} = require("../../helper/helpers");

describe("Helpers", () => {
    describe("slugify", () => {
        it("should convert text to lowercase", () => {
            const result = slugify("Hello World");

            expect(result).toBe("hello-world");
        });

        it("should replace spaces with hyphens", () => {
            const result = slugify("This Is A Test");

            expect(result).toBe("this-is-a-test");
        });

        it("should remove special characters", () => {
            const result = slugify("Hello@World#123!");

            expect(result).toBe("hello-world-123-");
        });

        it("should replace underscores with hyphens", () => {
            const result = slugify("hello_world_test");

            expect(result).toBe("hello-world-test");
        });

        it("should trim whitespace", () => {
            const result = slugify("  hello world  ");

            expect(result).toBe("hello-world");
        });

        it("should handle mixed cases", () => {
            const result = slugify("MyArticle-Title_2024!");

            expect(result).toBe("myarticle-title-2024-");
        });
    });

    describe("appendTagList", () => {
        it("should return tagList array without article", () => {
            const articleTags = [{ name: "javascript" }, { name: "react" }];

            const result = appendTagList(articleTags);

            expect(result).toEqual(["javascript", "react"]);
        });

        it("should append tagList to article dataValues", () => {
            const articleTags = [{ name: "javascript" }, { name: "react" }];
            const article = { dataValues: {} };

            appendTagList(articleTags, article);

            expect(article.dataValues.tagList).toEqual([
                "javascript",
                "react",
            ]);
        });

        it("should handle empty tagList", () => {
            const articleTags = [];
            const article = { dataValues: {} };

            appendTagList(articleTags, article);

            expect(article.dataValues.tagList).toEqual([]);
        });

        it("should handle single tag", () => {
            const articleTags = [{ name: "testing" }];
            const article = { dataValues: {} };

            appendTagList(articleTags, article);

            expect(article.dataValues.tagList).toEqual(["testing"]);
        });
    });

    describe("appendFavorites", () => {
        it("should set favorited true when user has favorited", async () => {
            const article = {
                dataValues: {},
                hasUser: jest.fn().mockResolvedValue(true),
                countUsers: jest.fn().mockResolvedValue(5),
            };
            const loggedUser = { id: 1, username: "testuser" };

            await appendFavorites(loggedUser, article);

            expect(article.dataValues.favorited).toBe(true);
            expect(article.dataValues.favoritesCount).toBe(5);
        });

        it("should set favorited false when user has not favorited", async () => {
            const article = {
                dataValues: {},
                hasUser: jest.fn().mockResolvedValue(false),
                countUsers: jest.fn().mockResolvedValue(3),
            };
            const loggedUser = { id: 1, username: "testuser" };

            await appendFavorites(loggedUser, article);

            expect(article.dataValues.favorited).toBe(false);
            expect(article.dataValues.favoritesCount).toBe(3);
        });

        it("should set favorited false when no logged user", async () => {
            const article = {
                dataValues: {},
                hasUser: jest.fn().mockResolvedValue(false),
                countUsers: jest.fn().mockResolvedValue(2),
            };

            await appendFavorites(null, article);

            expect(article.dataValues.favorited).toBe(false);
            expect(article.dataValues.favoritesCount).toBe(2);
            expect(article.hasUser).toHaveBeenCalledWith(null);
        });
    });

    describe("appendFollowers", () => {
        it("should set following and followers count for user", async () => {
            const user = {
                dataValues: {},
                hasFollower: jest.fn().mockResolvedValue(true),
                countFollowers: jest.fn().mockResolvedValue(10),
            };
            const loggedUser = { id: 1 };

            await appendFollowers(loggedUser, user);

            expect(user.dataValues.following).toBe(true);
            expect(user.dataValues.followersCount).toBe(10);
        });

        it("should set following false when not following", async () => {
            const user = {
                dataValues: {},
                hasFollower: jest.fn().mockResolvedValue(false),
                countFollowers: jest.fn().mockResolvedValue(5),
            };
            const loggedUser = { id: 1 };

            await appendFollowers(loggedUser, user);

            expect(user.dataValues.following).toBe(false);
            expect(user.dataValues.followersCount).toBe(5);
        });

        it("should set following false when no logged user", async () => {
            const user = {
                dataValues: {},
                hasFollower: jest.fn().mockResolvedValue(false),
                countFollowers: jest.fn().mockResolvedValue(3),
            };

            await appendFollowers(null, user);

            expect(user.dataValues.following).toBe(false);
            expect(user.dataValues.followersCount).toBe(3);
            expect(user.hasFollower).toHaveBeenCalledWith(null);
        });

        it("should handle article with author", async () => {
            const author = {
                dataValues: {},
                hasFollower: jest.fn().mockResolvedValue(true),
                countFollowers: jest.fn().mockResolvedValue(20),
            };
            const article = {
                author,
                dataValues: {},
                getAuthor: jest.fn().mockResolvedValue(author),
            };
            const loggedUser = { id: 1 };

            await appendFollowers(loggedUser, article);

            expect(article.getAuthor).toHaveBeenCalled();
            expect(author.dataValues.following).toBe(true);
            expect(author.dataValues.followersCount).toBe(20);
        });

        it("should set following false for article author when not following", async () => {
            const author = {
                dataValues: {},
                hasFollower: jest.fn().mockResolvedValue(false),
                countFollowers: jest.fn().mockResolvedValue(8),
            };
            const article = {
                author,
                dataValues: {},
                getAuthor: jest.fn().mockResolvedValue(author),
            };
            const loggedUser = { id: 1 };

            await appendFollowers(loggedUser, article);

            expect(author.dataValues.following).toBe(false);
            expect(author.dataValues.followersCount).toBe(8);
        });

        it("should handle article with author and no logged user", async () => {
            const author = {
                dataValues: {},
                hasFollower: jest.fn().mockResolvedValue(false),
                countFollowers: jest.fn().mockResolvedValue(6),
            };
            const article = {
                author,
                dataValues: {},
                getAuthor: jest.fn().mockResolvedValue(author),
            };

            await appendFollowers(null, article);

            expect(author.dataValues.following).toBe(false);
            expect(author.dataValues.followersCount).toBe(6);
            expect(author.hasFollower).toHaveBeenCalledWith(null);
        });
    });
});
