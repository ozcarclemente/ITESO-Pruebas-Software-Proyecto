process.env.NODE_ENV = "development";

const request = require("supertest");
const { createTestSequelize } = require("./sequelize-helper");
const express = require("express");
const tagsRouter = require("../../routes/tags");

let app;
let db;

describe("Tags Integration - GET /tags", () => {
    beforeAll(async () => {
        jest.spyOn(console, "log").mockImplementation(() => {});
        jest.spyOn(console, "error").mockImplementation(() => {});

        try {
            db = await createTestSequelize();

            app = express();
            app.use(express.json());
            app.use("/tags", tagsRouter);

            await db.Tag.create({ name: "reactjs" });
            await db.Tag.create({ name: "javascript" });
            await db.Tag.create({ name: "nodejs" });
        } catch (error) {
            console.error("Setup error:", error);
            throw error;
        }
    });

    describe("GET /tags", () => {
        it("should return all tags", async () => {
            const res = await request(app).get("/tags");

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("tags");
            expect(Array.isArray(res.body.tags)).toBe(true);
            expect(res.body.tags.length).toBe(3);
            expect(res.body.tags).toContain("reactjs");
            expect(res.body.tags).toContain("javascript");
            expect(res.body.tags).toContain("nodejs");
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
