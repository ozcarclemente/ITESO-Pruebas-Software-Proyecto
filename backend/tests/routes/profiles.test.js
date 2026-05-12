const express = require("express");
const profilesRouter = require("../../routes/profiles");

jest.mock("../../middleware/authentication", () => (req, res, next) => {
    req.loggedUser = { id: 1, username: "testuser" };
    next();
});

jest.mock("../../controllers/profiles", () => ({
    getProfile: jest.fn((req, res) => {
        res.json({
            profile: {
                username: "testuser",
                bio: "Test bio",
                image: "https://example.com/image.jpg",
                following: false,
            },
        });
    }),
    followToggler: jest.fn((req, res) => {
        res.json({
            profile: {
                username: "testuser",
                bio: "Test bio",
                image: "https://example.com/image.jpg",
                following: true,
            },
        });
    }),
}));

const request = require("supertest");

describe("Profiles Routes", () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use("/profiles", profilesRouter);
    });

    describe("GET /profiles/:username", () => {
        it("should get user profile", async () => {
            const res = await request(app).get("/profiles/testuser");

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("profile");
            expect(res.body.profile.username).toBe("testuser");
            expect(res.body.profile).toHaveProperty("bio");
            expect(res.body.profile).toHaveProperty("image");
            expect(res.body.profile).toHaveProperty("following");
        });
    });

    describe("POST /profiles/:username/follow", () => {
        it("should follow user", async () => {
            const res = await request(app).post("/profiles/testuser/follow");

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("profile");
            expect(res.body.profile.following).toBe(true);
        });
    });

    describe("DELETE /profiles/:username/follow", () => {
        it("should unfollow user", async () => {
            const res = await request(app).delete("/profiles/testuser/follow");

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("profile");
        });
    });
});
