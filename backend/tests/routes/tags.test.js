const request = require("supertest");
const express = require("express");
const { Tag } = require("../../models");
const tagsRoutes = require("../../routes/tags");
const errorHandler = require("../../middleware/errorHandler");

jest.mock("../../models", () => ({
    Tag: {
        findAll: jest.fn(),
    },
}));

const app = express();
app.use(express.json());
app.use("/api/tags", tagsRoutes);
app.use(errorHandler);

describe("Tags Routes - Integration Tests", () => {
    it("should return a list of tags", async () => {
        const mockTags = [{ name: "react" }, { name: "jest" }];
        Tag.findAll.mockResolvedValue(mockTags);

        const response = await request(app).get("/api/tags");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            tags: ["react", "jest"],
        });
        expect(Tag.findAll).toHaveBeenCalled();
    });

    it("should handle errors in tags route", async () => {
        Tag.findAll.mockRejectedValue(new Error("Database error"));

        const response = await request(app).get("/api/tags");

        expect(response.status).toBe(500);
    });
});
