process.env.NODE_ENV = "development";

const { seedUser, seedArticle, seedTag } = require("./setup");
const request = require("supertest");
const app = require("../../index");

let testUser;

beforeEach(async () => {
    testUser = await seedUser();
});

describe("Tags Routes Integration Tests", () => {
    describe("GET /api/tags", () => {
        it("returns empty list when no tags", async () => {
            const response = await request(app)
                .get("/api/tags");

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.tags)).toBe(true);
            expect(response.body.tags.length).toBe(0);
        });

        it("returns all tags", async () => {
            await seedTag({ name: "javascript" });
            await seedTag({ name: "react" });
            await seedTag({ name: "nodejs" });

            const response = await request(app)
                .get("/api/tags");

            expect(response.status).toBe(200);
            expect(response.body.tags.length).toBeGreaterThanOrEqual(3);
            expect(response.body.tags).toContain("javascript");
            expect(response.body.tags).toContain("react");
            expect(response.body.tags).toContain("nodejs");
        });

        it("returns tags used in articles", async () => {
            await seedArticle(testUser.id, {
                title: "Tagged Article",
            });

            const response = await request(app)
                .get("/api/tags");

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.tags)).toBe(true);
        });

        it("works without auth", async () => {
            await seedTag({ name: "public" });

            const response = await request(app)
                .get("/api/tags");

            expect(response.status).toBe(200);
            expect(response.body.tags.length).toBeGreaterThan(0);
        });
    });
});
