process.env.NODE_ENV = "development";

const { seedUser, seedArticle } = require("./setup");
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

describe("Favorites Routes Integration Tests", () => {
    describe("POST /api/articles/:slug/favorite", () => {
        it("favorites article", async () => {
            const response = await request(app)
                .post(`/api/articles/${testArticle.slug}/favorite`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.article.favorited).toBe(true);
        });

        it("returns 404 for nonexistent article", async () => {
            const response = await request(app)
                .post("/api/articles/nonexistent/favorite")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(404);
        });

        it("requires auth", async () => {
            const response = await request(app).post(
                `/api/articles/${testArticle.slug}/favorite`,
            );

            expect(response.status).toBe(401);
        });

        it("allows multiple favorites", async () => {
            const res1 = await request(app)
                .post(`/api/articles/${testArticle.slug}/favorite`)
                .set("Authorization", `Bearer ${authToken}`);

            const res2 = await request(app)
                .post(`/api/articles/${testArticle.slug}/favorite`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(res1.status).toBe(200);
            expect(res2.status).toBe(200);
            expect(res2.body.article.favorited).toBe(true);
        });
    });

    describe("DELETE /api/articles/:slug/favorite", () => {
        it("unfavorites article", async () => {
            await request(app)
                .post(`/api/articles/${testArticle.slug}/favorite`)
                .set("Authorization", `Bearer ${authToken}`);

            const response = await request(app)
                .delete(`/api/articles/${testArticle.slug}/favorite`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.article.favorited).toBe(false);
        });

        it("returns 404 for nonexistent article", async () => {
            const response = await request(app)
                .delete("/api/articles/nonexistent/favorite")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(404);
        });

        it("requires auth", async () => {
            const response = await request(app).delete(
                `/api/articles/${testArticle.slug}/favorite`,
            );

            expect(response.status).toBe(401);
        });

        it("allows unfavorite when not favorited", async () => {
            const response = await request(app)
                .delete(`/api/articles/${testArticle.slug}/favorite`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
        });
    });
});
