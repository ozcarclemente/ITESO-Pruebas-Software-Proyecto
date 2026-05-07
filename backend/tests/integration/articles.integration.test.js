process.env.NODE_ENV = "development";

const request = require("supertest");
const { createTestSequelize } = require("./sequelize-helper");
const { jwtSign } = require("../../helper/jwt");
const { bcryptHash } = require("../../helper/bcrypt");
const express = require("express");
const errorHandler = require("../../middleware/errorHandler");
const articlesRouter = require("../../routes/articles");
const verifyToken = require("../../middleware/authentication");

let app;
let author;
let otherUser;
let authorToken;
let otherToken;
let db;

describe("Articles Integration - CRUD", () => {
    beforeAll(async () => {
        jest.spyOn(console, "log").mockImplementation(() => {});
        jest.spyOn(console, "error").mockImplementation(() => {});

        try {
            db = await createTestSequelize();

            app = express();
            app.use(express.json());
            app.use("/articles", verifyToken, articlesRouter);
            app.use(errorHandler);

            author = await db.User.create({
                username: "author",
                email: "author@example.com",
                password: await bcryptHash("password123"),
            });

            otherUser = await db.User.create({
                username: "otheruser",
                email: "other@example.com",
                password: await bcryptHash("password123"),
            });

            authorToken = await jwtSign(author);
            otherToken = await jwtSign(otherUser);

            await db.Article.create({
                slug: "how-to-train-your-dragon",
                title: "How to Train Your Dragon",
                description: "Ever wonder how?",
                body: "It takes a Jacobian",
                userId: author.id,
            });
        } catch (error) {
            console.error("Setup error:", error);
            throw error;
        }
    });

    describe("POST /articles", () => {
        it("should create article", async () => {
            const res = await request(app)
                .post("/articles")
                .set("Authorization", `Token ${authorToken}`)
                .set("email", author.email)
                .send({
                    article: {
                        title: "Test Article",
                        description: "Test description",
                        body: "Test body",
                        tagList: [],
                    },
                });

            expect(res.status).toBe(201);
            expect(res.body.article.title).toBe("Test Article");
        });

        it("should fail without auth", async () => {
            const res = await request(app)
                .post("/articles")
                .send({
                    article: {
                        title: "Test",
                        description: "Test",
                        body: "Test",
                        tagList: [],
                    },
                });

            expect(res.status).toBe(401);
        });
    });

    describe("GET /articles/:slug", () => {
        it("should return single article", async () => {
            const res = await request(app)
                .get("/articles/how-to-train-your-dragon")
                .set("Authorization", `Token ${authorToken}`)
                .set("email", author.email);

            expect(res.status).toBe(200);
            expect(res.body.article.title).toBe("How to Train Your Dragon");
        });

        it("should return 404 for non-existent article", async () => {
            const res = await request(app)
                .get("/articles/nonexistent")
                .set("Authorization", `Token ${authorToken}`)
                .set("email", author.email);

            expect(res.status).toBe(404);
        });
    });

    describe("DELETE /articles/:slug", () => {
        it("should delete article as author", async () => {
            const res = await request(app)
                .delete("/articles/how-to-train-your-dragon")
                .set("Authorization", `Token ${authorToken}`)
                .set("email", author.email);

            expect(res.status).toBe(200);

            const dbArticle = await db.Article.findOne({
                where: { slug: "how-to-train-your-dragon" },
            });
            expect(dbArticle).toBeNull();
        });

        it("should fail without auth", async () => {
            const res = await request(app)
                .delete("/articles/how-to-train-your-dragon");

            expect(res.status).toBe(401);
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
