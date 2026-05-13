process.env.NODE_ENV = "development";

const { seedUser, seedArticle } = require("./setup");
const request = require("supertest");
const app = require("../../index");
const jwt = require("jsonwebtoken");

let authToken;
let testUser;

beforeEach(async () => {
    testUser = await seedUser();
    authToken = jwt.sign(
        { username: testUser.username, email: testUser.email },
        process.env.JWT_KEY,
    );
});

describe("Articles Routes Integration Tests", () => {
    describe("POST /api/articles", () => {
        it("creates article with valid data", async () => {
            const response = await request(app)
                .post("/api/articles")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    article: {
                        title: "Test Article",
                        description: "Test description",
                        body: "Test body",
                        tagList: [],
                    },
                });

            expect(response.status).toBe(201);
            expect(response.body.article.title).toBe("Test Article");
            expect(response.body.article.author.username).toBe(
                testUser.username,
            );
            expect(response.body.article.token).toBeUndefined();
        });

        it("rejects without auth", async () => {
            const response = await request(app)
                .post("/api/articles")
                .send({
                    article: {
                        title: "Test Article",
                        description: "Test description",
                        body: "Test body",
                        tagList: [],
                    },
                });

            expect(response.status).toBe(401);
        });

        it("rejects missing title", async () => {
            const response = await request(app)
                .post("/api/articles")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    article: {
                        description: "Test description",
                        body: "Test body",
                        tagList: [],
                    },
                });

            expect(response.status).toBe(422);
        });

        it("rejects missing description", async () => {
            const response = await request(app)
                .post("/api/articles")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    article: {
                        title: "Test Article",
                        body: "Test body",
                        tagList: [],
                    },
                });

            expect(response.status).toBe(422);
        });

        it("rejects missing body", async () => {
            const response = await request(app)
                .post("/api/articles")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    article: {
                        title: "Test Article",
                        description: "Test description",
                        tagList: [],
                    },
                });

            expect(response.status).toBe(422);
        });

        it("rejects duplicate slug", async () => {
            const articleData = {
                article: {
                    title: "Unique Title",
                    description: "Test description",
                    body: "Test body",
                    tagList: [],
                },
            };

            await request(app)
                .post("/api/articles")
                .set("Authorization", `Bearer ${authToken}`)
                .send(articleData);

            const response = await request(app)
                .post("/api/articles")
                .set("Authorization", `Bearer ${authToken}`)
                .send(articleData);

            expect(response.status).toBe(422);
        });
    });

    describe("GET /api/articles", () => {
        it("returns articles list", async () => {
            await seedArticle(testUser.id);
            await seedArticle(testUser.id);

            const response = await request(app)
                .get("/api/articles")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.articles)).toBe(true);
            expect(response.body.articlesCount).toBeGreaterThanOrEqual(2);
        });

        it("filters by author", async () => {
            const otherUser = await seedUser({ username: "otherauto" });
            await seedArticle(testUser.id);
            await seedArticle(otherUser.id);

            const response = await request(app)
                .get("/api/articles")
                .query({ author: testUser.username })
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(
                response.body.articles.every(
                    (a) => a.author.username === testUser.username,
                ),
            ).toBe(true);
        });

        it("respects limit and offset", async () => {
            await seedArticle(testUser.id);
            await seedArticle(testUser.id);
            await seedArticle(testUser.id);

            const response = await request(app)
                .get("/api/articles")
                .query({ limit: 2, offset: 0 })
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.articles.length).toBeLessThanOrEqual(2);
        });

        it("works without auth", async () => {
            await seedArticle(testUser.id);

            const response = await request(app).get("/api/articles");

            expect(response.status).toBe(200);
        });
    });

    describe("GET /api/articles/feed", () => {
        it("returns articles from followed users", async () => {
            const author = await seedUser({ username: "followauth" });
            await testUser.addFollowing(author);
            const article = await seedArticle(author.id);

            const response = await request(app)
                .get("/api/articles/feed")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(
                response.body.articles.some((a) => a.slug === article.slug),
            ).toBe(true);
        });

        it("excludes articles from non-followed users", async () => {
            const otherUser = await seedUser({ username: "notfollowed" });
            await seedArticle(otherUser.id);

            const response = await request(app)
                .get("/api/articles/feed")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.articles.length).toBe(0);
        });

        it("requires auth", async () => {
            const response = await request(app).get("/api/articles/feed");

            expect(response.status).toBe(401);
        });
    });

    describe("GET /api/articles/:slug", () => {
        it("returns article by slug", async () => {
            const article = await seedArticle(testUser.id, {
                slug: "test-slug",
            });

            const response = await request(app)
                .get("/api/articles/test-slug")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.article.slug).toBe("test-slug");
            expect(response.body.article.title).toBe(article.title);
        });

        it("returns 404 for nonexistent article", async () => {
            const response = await request(app)
                .get("/api/articles/nonexistent")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(404);
        });

        it("works without auth", async () => {
            await seedArticle(testUser.id, { slug: "public-slug" });

            const response = await request(app).get(
                "/api/articles/public-slug",
            );

            expect(response.status).toBe(200);
        });
    });

    describe("PUT /api/articles/:slug", () => {
        it("updates article by owner", async () => {
            const article = await seedArticle(testUser.id);

            const response = await request(app)
                .put(`/api/articles/${article.slug}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    article: {
                        title: "Updated Title",
                        body: "Updated body",
                    },
                });

            expect(response.status).toBe(200);
            expect(response.body.article.title).toBe("Updated Title");
        });

        it("returns 404 for nonexistent article", async () => {
            const response = await request(app)
                .put("/api/articles/nonexistent")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    article: { title: "Updated" },
                });

            expect(response.status).toBe(404);
        });

        it("requires auth", async () => {
            const article = await seedArticle(testUser.id);

            const response = await request(app)
                .put(`/api/articles/${article.slug}`)
                .send({
                    article: { title: "Updated" },
                });

            expect(response.status).toBe(401);
        });
    });

    describe("DELETE /api/articles/:slug", () => {
        it("deletes article by owner", async () => {
            const article = await seedArticle(testUser.id);

            const response = await request(app)
                .delete(`/api/articles/${article.slug}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);

            const checkResponse = await request(app)
                .get(`/api/articles/${article.slug}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(checkResponse.status).toBe(404);
        });

        it("returns 404 for nonexistent article", async () => {
            const response = await request(app)
                .delete("/api/articles/nonexistent")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(404);
        });

        it("requires auth", async () => {
            const article = await seedArticle(testUser.id);

            const response = await request(app).delete(
                `/api/articles/${article.slug}`,
            );

            expect(response.status).toBe(401);
        });
    });
});
