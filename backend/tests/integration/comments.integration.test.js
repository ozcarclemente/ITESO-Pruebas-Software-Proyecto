process.env.NODE_ENV = "development";

const request = require("supertest");
const { createTestSequelize } = require("./sequelize-helper");
const { jwtSign } = require("../../helper/jwt");
const express = require("express");
const cors = require("cors");
const errorHandler = require("../../middleware/errorHandler");
const commentsRouter = require("../../routes/articles/comments");
const verifyToken = require("../../middleware/authentication");

let app;
let testUser;
let testArticle;
let token;
let db;

describe("Comments Integration - Supertest + Postgres Test DB", () => {
    beforeAll(async () => {
        jest.spyOn(console, "log").mockImplementation(() => {});
        jest.spyOn(console, "error").mockImplementation(() => {});

        try {
            db = await createTestSequelize();

            app = express();
            app.use(cors());
            app.use(express.json());
            app.use("/articles", verifyToken, commentsRouter);
            app.use(errorHandler);

            testUser = await db.User.create({
                email: "test@example.com",
                username: "testuser",
                password: "hashedpassword123",
                bio: "Test bio",
            });

            token = await jwtSign(testUser);

            testArticle = await db.Article.create({
                slug: "how-to-train-your-dragon",
                title: "How to train your dragon",
                description: "Ever wonder how?",
                body: "It takes a Jacobian",
                userId: testUser.id,
            });
        } catch (error) {
            console.error("Setup error:", error);
            throw error;
        }
    });

    describe("GET /articles/:slug/comments", () => {
        it("should get empty comments for new article", async () => {
            const res = await request(app)
                .get("/articles/how-to-train-your-dragon/comments")
                .set("Authorization", `Token ${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("comments");
            expect(Array.isArray(res.body.comments)).toBe(true);
            expect(res.body.comments.length).toBe(0);
        });

        it("should get all comments for article from DB", async () => {
            await db.Comment.create({
                body: "Great article!",
                articleId: testArticle.id,
                userId: testUser.id,
            });

            const res = await request(app)
                .get("/articles/how-to-train-your-dragon/comments")
                .set("Authorization", `Token ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.comments.length).toBe(1);
            expect(res.body.comments[0].body).toBe("Great article!");
            expect(res.body.comments[0].author.username).toBe("testuser");
        });

        it("should return 404 for non-existent article", async () => {
            const res = await request(app)
                .get("/articles/non-existent-slug/comments")
                .set("Authorization", `Token ${token}`);

            expect(res.status).toBe(404);
        });
    });

    describe("POST /articles/:slug/comments", () => {
        it("should create comment in DB", async () => {
            const res = await request(app)
                .post("/articles/how-to-train-your-dragon/comments")
                .set("Authorization", `Token ${token}`)
                .send({
                    comment: {
                        body: "Well written article!",
                    },
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("comment");
            expect(res.body.comment.body).toBe("Well written article!");
            expect(res.body.comment.author.username).toBe("testuser");

            const dbComment = await db.Comment.findOne({
                where: { body: "Well written article!" },
            });
            expect(dbComment).toBeDefined();
            expect(dbComment.userId).toBe(testUser.id);
            expect(dbComment.articleId).toBe(testArticle.id);
        });

        it("should fail without auth", async () => {
            const res = await request(app)
                .post("/articles/how-to-train-your-dragon/comments")
                .send({
                    comment: {
                        body: "No auth comment",
                    },
                });

            expect(res.status).toBe(401);
        });

        it("should fail without comment body", async () => {
            const res = await request(app)
                .post("/articles/how-to-train-your-dragon/comments")
                .set("Authorization", `Token ${token}`)
                .send({
                    comment: {},
                });

            expect(res.status).toBe(422);
        });

        it("should fail for non-existent article", async () => {
            const res = await request(app)
                .post("/articles/fake-article/comments")
                .set("Authorization", `Token ${token}`)
                .send({
                    comment: { body: "Test" },
                });

            expect(res.status).toBe(404);
        });
    });

    describe("DELETE /articles/:slug/comments/:commentId", () => {
        let commentToDelete;

        beforeEach(async () => {
            commentToDelete = await db.Comment.create({
                body: "Comment to delete",
                articleId: testArticle.id,
                userId: testUser.id,
            });
        });

        it("should delete own comment from DB", async () => {
            const res = await request(app)
                .delete(
                    `/articles/how-to-train-your-dragon/comments/${commentToDelete.id}`,
                )
                .set("Authorization", `Token ${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("message");

            const dbComment = await db.Comment.findByPk(commentToDelete.id);
            expect(dbComment).toBeNull();
        });

        it("should fail without auth", async () => {
            const res = await request(app).delete(
                `/articles/how-to-train-your-dragon/comments/${commentToDelete.id}`,
            );

            expect(res.status).toBe(401);

            const dbComment = await db.Comment.findByPk(commentToDelete.id);
            expect(dbComment).toBeDefined();
        });

        it("should fail for non-existent comment", async () => {
            const res = await request(app)
                .delete("/articles/how-to-train-your-dragon/comments/99999")
                .set("Authorization", `Token ${token}`);

            expect(res.status).toBe(404);
        });

        it("should fail deleting others comment", async () => {
            const otherUser = await db.User.create({
                email: "other@example.com",
                username: "otheruser",
                password: "hashedpassword123",
            });

            const otherToken = await jwtSign(otherUser);

            const res = await request(app)
                .delete(
                    `/articles/how-to-train-your-dragon/comments/${commentToDelete.id}`,
                )
                .set("Authorization", `Token ${otherToken}`);

            expect(res.status).toBe(403);

            const dbComment = await db.Comment.findByPk(commentToDelete.id);
            expect(dbComment).toBeDefined();
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
