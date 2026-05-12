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

jest.mock("../../middleware/authentication", () => (req, res, next) => {
    req.loggedUser = { id: 1, username: "testuser" };
    next();
});

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

jest.mock("../../controllers/articles", () => ({
    allArticles: jest.fn((req, res) => {
        res.json({ articles: [], articlesCount: 0 });
    }),
    createArticle: jest.fn((req, res) => {
        res.status(201).json({ article: { slug: "test-article", title: "Test" } });
    }),
    singleArticle: jest.fn((req, res) => {
        res.json({ article: { slug: "test-article", title: "Test" } });
    }),
    updateArticle: jest.fn((req, res) => {
        res.json({ article: { slug: "test-article", title: "Updated" } });
    }),
    deleteArticle: jest.fn((req, res) => {
        res.json({ message: "Deleted" });
    }),
    articlesFeed: jest.fn((req, res) => {
        res.json({ articles: [], articlesCount: 0 });
    }),
}));

jest.mock("../../controllers/comments", () => ({
    allComments: jest.fn((req, res) => {
        res.json({ comments: [] });
    }),
    createComment: jest.fn((req, res) => {
        res.status(201).json({ comment: { id: 1, body: "Test" } });
    }),
    deleteComment: jest.fn((req, res) => {
        res.json({ message: { body: ["Deleted"] } });
    }),
}));

jest.mock("../../controllers/favorites", () => ({
    favoriteToggler: jest.fn((req, res) => {
        res.json({
            article: {
                slug: "test-article",
                title: "Test Article",
                favorited: true,
                favoritesCount: 1,
            },
        });
    }),
}));


describe("Articles Routes", () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        const articlesRouter = require("../../routes/articles");
        app.use("/articles", articlesRouter);
    });

    describe("GET /articles", () => {
        it("should get all articles", async () => {
            const res = await request(app).get("/articles");

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("articles");
            expect(res.body).toHaveProperty("articlesCount");
        });
    });

    describe("POST /articles", () => {
        it("should create article", async () => {
            const res = await request(app)
                .post("/articles")
                .send({
                    article: {
                        title: "Test Article",
                        description: "Test description",
                        body: "Test body",
                        tagList: ["test"],
                    },
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("article");
        });
    });

    describe("GET /articles/feed", () => {
        it("should get feed articles", async () => {
            const res = await request(app).get("/articles/feed");

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("articles");
            expect(res.body).toHaveProperty("articlesCount");
        });
    });

    describe("GET /articles/:slug", () => {
        it("should get single article", async () => {
            const res = await request(app).get("/articles/test-article");

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("article");
        });
    });

    describe("PUT /articles/:slug", () => {
        it("should update article", async () => {
            const res = await request(app)
                .put("/articles/test-article")
                .send({
                    article: {
                        title: "Updated Title",
                    },
                });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("article");
        });
    });

    describe("DELETE /articles/:slug", () => {
        it("should delete article", async () => {
            const res = await request(app).delete("/articles/test-article");

            expect(res.status).toBe(200);
        });
    });

    describe("POST /articles/:slug/favorite (via sub-route)", () => {
        it("should favorite article", async () => {
            const res = await request(app).post("/articles/test-article/favorite");

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("article");
        });
    });

    describe("DELETE /articles/:slug/favorite (via sub-route)", () => {
        it("should unfavorite article", async () => {
            const res = await request(app).delete("/articles/test-article/favorite");

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("article");
        });
    });

    describe("GET /articles/:slug/comments (via sub-route)", () => {
        it("should get comments for article", async () => {
            const res = await request(app).get("/articles/test-article/comments");

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("comments");
        });
    });

    describe("POST /articles/:slug/comments (via sub-route)", () => {
        it("should create comment", async () => {
            const res = await request(app)
                .post("/articles/test-article/comments")
                .send({
                    comment: {
                        body: "Great article!",
                    },
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("comment");
        });
    });

    describe("DELETE /articles/:slug/comments/:commentId (via sub-route)", () => {
        it("should delete comment", async () => {
            const res = await request(app).delete(
                "/articles/test-article/comments/1",
            );

            expect(res.status).toBe(200);
        });
    });
});
