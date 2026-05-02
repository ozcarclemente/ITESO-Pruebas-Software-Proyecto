const express = require("express");
const commentsRouter = require("../../routes/articles/comments");

jest.mock("../../middleware/authentication", () => (req, res, next) => {
    req.loggedUser = { id: 1, username: "testuser" };
    next();
});

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

const request = require("supertest");

describe("Comments Routes", () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use("/articles", commentsRouter);
    });

    describe("GET /articles/:slug/comments", () => {
        it("should get all comments for article", async () => {
            const res = await request(app).get(
                "/articles/test-article/comments",
            );

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("comments");
            expect(Array.isArray(res.body.comments)).toBe(true);
        });
    });

    describe("POST /articles/:slug/comments", () => {
        it("should create comment for article", async () => {
            const res = await request(app)
                .post("/articles/test-article/comments")
                .send({
                    comment: {
                        body: "Great article!",
                    },
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("comment");
            expect(res.body.comment.body).toBe("Test");
        });
    });

    describe("DELETE /articles/:slug/comments/:commentId", () => {
        it("should delete comment", async () => {
            const res = await request(app).delete(
                "/articles/test-article/comments/1",
            );

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("message");
        });
    });
});
