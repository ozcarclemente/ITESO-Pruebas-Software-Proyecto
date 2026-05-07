process.env.NODE_ENV = "development";

const request = require("supertest");
const { createTestSequelize } = require("./sequelize-helper");
const { jwtSign } = require("../../helper/jwt");
const { bcryptHash } = require("../../helper/bcrypt");
const express = require("express");
const errorHandler = require("../../middleware/errorHandler");
const favoritesRouter = require("../../routes/articles/favorites");
const verifyToken = require("../../middleware/authentication");

let app;
let user1;
let user2;
let token1;
let token2;
let db;

describe("Favorites Integration - Add & Remove Favorites", () => {
    beforeAll(async () => {
        jest.spyOn(console, "log").mockImplementation(() => {});
        jest.spyOn(console, "error").mockImplementation(() => {});

        try {
            db = await createTestSequelize();

            app = express();
            app.use(express.json());
            app.use("/articles", verifyToken, favoritesRouter);
            app.use(errorHandler);

            user1 = await db.User.create({
                username: "user1",
                email: "user1@example.com",
                password: await bcryptHash("password123"),
            });

            user2 = await db.User.create({
                username: "user2",
                email: "user2@example.com",
                password: await bcryptHash("password123"),
            });

            token1 = await jwtSign(user1);
            token2 = await jwtSign(user2);

            await db.Article.create({
                slug: "favorite-article-1",
                title: "Favorite Article 1",
                description: "First article to favorite",
                body: "Body 1",
                userId: user1.id,
            });

            await db.Article.create({
                slug: "favorite-article-2",
                title: "Favorite Article 2",
                description: "Second article to favorite",
                body: "Body 2",
                userId: user1.id,
            });
        } catch (error) {
            console.error("Setup error:", error);
            throw error;
        }
    });

    describe("POST /articles/:slug/favorite", () => {
        it("should favorite article", async () => {
            const res = await request(app)
                .post("/articles/favorite-article-1/favorite")
                .set("Authorization", `Token ${token2}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("article");
            expect(res.body.article.slug).toBe("favorite-article-1");
            expect(res.body.article.favorited).toBe(true);

            const favorites = await user2.getFavorites();
            expect(favorites.length).toBe(1);
            expect(favorites[0].slug).toBe("favorite-article-1");
        });

        it("should fail without auth", async () => {
            const res = await request(app)
                .post("/articles/favorite-article-1/favorite");

            expect(res.status).toBe(401);
        });

        it("should fail for non-existent article", async () => {
            const res = await request(app)
                .post("/articles/nonexistent/favorite")
                .set("Authorization", `Token ${token2}`);

            expect(res.status).toBe(404);
        });
    });

    describe("DELETE /articles/:slug/favorite", () => {
        it("should unfavorite article", async () => {
            const article2 = await db.Article.findOne({
                where: { slug: "favorite-article-2" },
            });

            await article2.addUser(user2);

            const res = await request(app)
                .delete("/articles/favorite-article-2/favorite")
                .set("Authorization", `Token ${token2}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("article");
            expect(res.body.article.slug).toBe("favorite-article-2");
            expect(res.body.article.favorited).toBe(false);

            const favorites = await user2.getFavorites();
            expect(favorites.length).toBe(0);
        });

        it("should fail without auth", async () => {
            const res = await request(app)
                .delete("/articles/favorite-article-2/favorite");

            expect(res.status).toBe(401);
        });

        it("should fail for non-existent article", async () => {
            const res = await request(app)
                .delete("/articles/nonexistent/favorite")
                .set("Authorization", `Token ${token2}`);

            expect(res.status).toBe(404);
        });
    });

    afterAll(async () => {
        console.log.mockRestore();
        console.error.mockRestore();

        if (db && db.sequelize) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            await db.sequelize.close();
        }
    });
});
