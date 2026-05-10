process.env.NODE_ENV = "development";

const { seedUser, seedArticle, seedComment } = require("./setup");
const request = require("supertest");
const app = require("../../index");
const jwt = require("jsonwebtoken");

let authToken;
let testUser;
let testArticle;

beforeEach(async () => {
    testUser = await seedUser();
    testArticle = await seedArticle(testUser.id);
    authToken = jwt.sign(
        { username: testUser.username, email: testUser.email },
        process.env.JWT_KEY,
    );
});

describe("Comments Routes Integration Tests", () => {
    describe("GET /api/articles/:slug/comments", () => {
        it("returns empty comments list", async () => {
            const response = await request(app)
                .get(`/api/articles/${testArticle.slug}/comments`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.comments)).toBe(true);
            expect(response.body.comments.length).toBe(0);
        });

        it("returns article comments", async () => {
            await seedComment(testUser.id, testArticle.id);
            await seedComment(testUser.id, testArticle.id);

            const response = await request(app)
                .get(`/api/articles/${testArticle.slug}/comments`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.comments.length).toBeGreaterThanOrEqual(2);
        });

        it("returns 404 for nonexistent article", async () => {
            const response = await request(app)
                .get("/api/articles/nonexistent/comments")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(404);
        });

        it("works without auth", async () => {
            await seedComment(testUser.id, testArticle.id);

            const response = await request(app)
                .get(`/api/articles/${testArticle.slug}/comments`);

            expect(response.status).toBe(200);
        });
    });

    describe("POST /api/articles/:slug/comments", () => {
        it("creates comment with valid data", async () => {
            const response = await request(app)
                .post(`/api/articles/${testArticle.slug}/comments`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    comment: {
                        body: "Great article!",
                    },
                });

            expect(response.status).toBe(201);
            expect(response.body.comment.body).toBe("Great article!");
            expect(response.body.comment.author.username).toBe(testUser.username);
        });

        it("rejects missing body", async () => {
            const response = await request(app)
                .post(`/api/articles/${testArticle.slug}/comments`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    comment: {},
                });

            expect(response.status).toBe(422);
        });

        it("returns 404 for nonexistent article", async () => {
            const response = await request(app)
                .post("/api/articles/nonexistent/comments")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    comment: {
                        body: "Comment",
                    },
                });

            expect(response.status).toBe(404);
        });

        it("requires auth", async () => {
            const response = await request(app)
                .post(`/api/articles/${testArticle.slug}/comments`)
                .send({
                    comment: {
                        body: "Comment",
                    },
                });

            expect(response.status).toBe(401);
        });

        it("allows multiple comments on same article", async () => {
            const res1 = await request(app)
                .post(`/api/articles/${testArticle.slug}/comments`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    comment: {
                        body: "First comment",
                    },
                });

            const res2 = await request(app)
                .post(`/api/articles/${testArticle.slug}/comments`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    comment: {
                        body: "Second comment",
                    },
                });

            expect(res1.status).toBe(201);
            expect(res2.status).toBe(201);
        });
    });

    describe("DELETE /api/articles/:slug/comments/:commentId", () => {
        it("deletes comment by owner", async () => {
            const comment = await seedComment(testUser.id, testArticle.id);

            const response = await request(app)
                .delete(`/api/articles/${testArticle.slug}/comments/${comment.id}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
        });

        it("returns 404 for nonexistent comment", async () => {
            const response = await request(app)
                .delete(`/api/articles/${testArticle.slug}/comments/99999`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(404);
        });

        it("requires auth", async () => {
            const comment = await seedComment(testUser.id, testArticle.id);

            const response = await request(app)
                .delete(`/api/articles/${testArticle.slug}/comments/${comment.id}`);

            expect(response.status).toBe(401);
        });
    });
});
