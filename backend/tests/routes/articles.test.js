const request = require("supertest");
const { describe, it, expect, beforeEach, afterEach } = require("@jest/globals");
const express = require("express");
const jwt = require("jsonwebtoken");

// Mock models
jest.mock("../../models", () => ({
    sequelize: { authenticate: jest.fn().mockResolvedValue(true) },
    User: {
        findByPk: jest.fn(),
        findOne: jest.fn(),
    },
    Article: {
        findAndCountAll: jest.fn(),
        findOne: jest.fn(),
    },
    Tag: {
        findByPk: jest.fn(),
    },
}));

jest.mock("../../helper/helpers", () => {
    const realHelpers = jest.requireActual("../../helper/helpers");
    return {
        ...realHelpers,
        appendFollowers: jest.fn().mockImplementation((toAppend) => {
            if (toAppend?.author) {
                toAppend.author.dataValues = toAppend.author.dataValues || {};
                toAppend.author.dataValues.following = false;
                toAppend.author.dataValues.followersCount = 0;
            } else {
                toAppend.dataValues = toAppend.dataValues || {};
                toAppend.dataValues.following = false;
                toAppend.dataValues.followersCount = 0;
            }
        }),
        appendFavorites: jest.fn().mockImplementation((article) => {
            article.dataValues = article.dataValues || {};
            article.dataValues.favorited = false;
            article.dataValues.favoritesCount = 0;
        }),
    };
});


describe("Articles Routes Integration Tests", () => {
    let app;
    let mockToken;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        // Mock verifyToken middleware
        app.use((req, res, next) => {
            const token = req.headers.authorization?.split(" ")[1];
            if (token) {
                req.loggedUser = {
                    id: 1,
                    username: "testuser",
                    email: "test@test.com",
                    dataValues: {},
                    getFollowing: jest.fn().mockResolvedValue([
                        { id: 2, username: "author1" },
                        { id: 3, username: "author2" },
                    ]),
                    getFavorites: jest.fn().mockResolvedValue([]),
                    countFavorites: jest.fn().mockResolvedValue(0),
                };
            } else {
                req.loggedUser = null;
            }
            next();
        });

        // Mount articles routes
        const articleRouter = express.Router();
        const { allArticles, articlesFeed } = require("../../controllers/articles");
        articleRouter.get("/", allArticles);
        articleRouter.get("/feed", articlesFeed);
        app.use("/api/articles", articleRouter);

        // Error handler
        app.use((err, req, res, _next) => {
            res.status(err.status || 400).json({
                errors: { body: [err.message] },
            });
        });

        mockToken = jwt.sign({ id: 1, username: "testuser" }, "test-secret");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /api/articles (Pagination)", () => {
        it("should return articles with pagination", async () => {
            const { Article } = require("../../models");
            Article.findAndCountAll.mockResolvedValue({
                rows: [
                    {
                        id: 1,
                        slug: "article-1",
                        title: "Article 1",
                        description: "Description 1",
                        body: "Body 1",
                        userId: 1,
                        dataValues: { Favorites: [], tagList: [] },
                        author: { id: 1, username: "author1", dataValues: {} },
                        tagList: [],
                        getTagList: jest.fn().mockResolvedValue([]),
                    },
                ],
                count: 100,
            });

            const res = await request(app)
                .get("/api/articles?limit=10&offset=0")
                .set("Authorization", `Bearer ${mockToken}`);

            expect(res.status).toBe(200);
            expect(res.body.articlesCount).toBe(100);
            expect(res.body.articles).toHaveLength(1);
            expect(res.body.articles[0].title).toBe("Article 1");
        });

        it("should use default limit when not provided", async () => {
            const { Article } = require("../../models");
            Article.findAndCountAll.mockResolvedValue({
                rows: [],
                count: 0,
            });

            await request(app)
                .get("/api/articles")
                .set("Authorization", `Bearer ${mockToken}`);

            expect(Article.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    limit: 3,
                    offset: 0,
                }),
            );
        });

        it("should calculate offset based on page", async () => {
            const { Article } = require("../../models");
            Article.findAndCountAll.mockResolvedValue({
                rows: [],
                count: 0,
            });

            await request(app)
                .get("/api/articles?limit=5&offset=2")
                .set("Authorization", `Bearer ${mockToken}`);

            expect(Article.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    limit: 5,
                    offset: 10,
                }),
            );
        });
    });

    describe("GET /api/articles?tag=X (Tag Filter)", () => {
        it("should filter articles by tag", async () => {
            const { Article } = require("../../models");
            Article.findAndCountAll.mockResolvedValue({
                rows: [
                    {
                        id: 1,
                        slug: "js-article",
                        title: "JavaScript Tips",
                        userId: 1,
                        dataValues: { Favorites: [] },
                        author: { id: 1, username: "author1", dataValues: {} },
                        tagList: [{ name: "javascript" }],
                        getTagList: jest.fn().mockResolvedValue([{ name: "javascript" }]),
                    },
                ],
                count: 5,
            });

            const res = await request(app)
                .get("/api/articles?tag=javascript")
                .set("Authorization", `Bearer ${mockToken}`);

            expect(res.status).toBe(200);
            expect(res.body.articlesCount).toBe(5);
            expect(Article.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    include: expect.arrayContaining([
                        expect.objectContaining({
                            where: { name: "javascript" },
                        }),
                    ]),
                }),
            );
        });
    });

    describe("GET /api/articles?author=X (Author Filter)", () => {
        it("should filter articles by author", async () => {
            const { Article } = require("../../models");
            Article.findAndCountAll.mockResolvedValue({
                rows: [
                    {
                        id: 1,
                        slug: "author-article",
                        title: "Author Article",
                        userId: 2,
                        dataValues: { Favorites: [] },
                        author: { id: 2, username: "specificauthor", dataValues: {} },
                        tagList: [],
                        getTagList: jest.fn().mockResolvedValue([]),
                    },
                ],
                count: 3,
            });

            const res = await request(app)
                .get("/api/articles?author=specificauthor")
                .set("Authorization", `Bearer ${mockToken}`);

            expect(res.status).toBe(200);
            expect(res.body.articlesCount).toBe(3);
            expect(Article.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    include: expect.arrayContaining([
                        expect.objectContaining({
                            where: { username: "specificauthor" },
                        }),
                    ]),
                }),
            );
        });
    });

    describe("GET /api/articles/feed (User Feed)", () => {
        it("should return feed articles from followed users", async () => {
            const { Article } = require("../../models");

            Article.findAndCountAll.mockResolvedValue({
                rows: [
                    {
                        id: 1,
                        slug: "followed-article",
                        title: "Article from followed user",
                        userId: 2,
                        dataValues: { Favorites: [] },
                        author: { id: 2, username: "author1", dataValues: {} },
                        tagList: [],
                        getTagList: jest.fn().mockResolvedValue([]),
                    },
                ],
                count: 10,
            });

            const res = await request(app)
                .get("/api/articles/feed")
                .set("Authorization", `Bearer ${mockToken}`);

            expect(res.status).toBe(200);
            expect(res.body.articlesCount).toBe(10);
            expect(res.body.articles).toHaveLength(1);
        });

        it("should use limit and offset in feed", async () => {
            const { Article } = require("../../models");

            Article.findAndCountAll.mockResolvedValue({
                rows: [],
                count: 0,
            });

            await request(app)
                .get("/api/articles/feed?limit=5&offset=1")
                .set("Authorization", `Bearer ${mockToken}`);

            expect(Article.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    limit: 5,
                    offset: 5,
                }),
            );
        });

        it("should fail without authentication", async () => {
            const res = await request(app).get("/api/articles/feed");

            expect(res.status).toBe(400);
        });
    });

    describe("Pagination Edge Cases", () => {
        it("should handle large offset values", async () => {
            const { Article } = require("../../models");
            Article.findAndCountAll.mockResolvedValue({
                rows: [],
                count: 0,
            });

            await request(app)
                .get("/api/articles?limit=10&offset=999")
                .set("Authorization", `Bearer ${mockToken}`);

            expect(Article.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    limit: 10,
                    offset: 9990,
                }),
            );
        });

        it("should handle string limit values", async () => {
            const { Article } = require("../../models");
            Article.findAndCountAll.mockResolvedValue({
                rows: [],
                count: 0,
            });

            await request(app)
                .get("/api/articles?limit=5&offset=0")
                .set("Authorization", `Bearer ${mockToken}`);

            expect(Article.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    limit: 5,
                }),
            );
        });
    });
});
