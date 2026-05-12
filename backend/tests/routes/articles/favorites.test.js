const express = require("express");
const favoritesRouter = require("../../../routes/articles/favorites");

jest.mock("../../../middleware/authentication", () => (req, res, next) => {
    req.loggedUser = { id: 1, username: "testuser" };
    next();
});

jest.mock("../../../controllers/favorites", () => ({
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

const request = require("supertest");

describe("Favorites Routes", () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use("/articles", favoritesRouter);
    });

    describe("POST /articles/:slug/favorite", () => {
        it("should favorite article", async () => {
            const res = await request(app).post("/articles/test-article/favorite");

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("article");
            expect(res.body.article.favorited).toBe(true);
            expect(res.body.article.favoritesCount).toBe(1);
        });
    });

    describe("DELETE /articles/:slug/favorite", () => {
        it("should unfavorite article", async () => {
            const res = await request(app).delete("/articles/test-article/favorite");

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("article");
            expect(res.body.article).toHaveProperty("slug");
        });
    });
});
