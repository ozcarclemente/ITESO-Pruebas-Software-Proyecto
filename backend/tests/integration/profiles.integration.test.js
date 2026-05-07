process.env.NODE_ENV = "development";

const request = require("supertest");
const { createTestSequelize } = require("./sequelize-helper");
const { jwtSign } = require("../../helper/jwt");
const { bcryptHash } = require("../../helper/bcrypt");
const express = require("express");
const errorHandler = require("../../middleware/errorHandler");
const profilesRouter = require("../../routes/profiles");
const verifyToken = require("../../middleware/authentication");

let app;
let testUser;
let targetUser;
let token;
let db;

describe("Profiles Integration - GET & Follow/Unfollow", () => {
    beforeAll(async () => {
        jest.spyOn(console, "log").mockImplementation(() => {});
        jest.spyOn(console, "error").mockImplementation(() => {});

        try {
            db = await createTestSequelize();

            app = express();
            app.use(express.json());
            app.use("/profiles", verifyToken, profilesRouter);
            app.use(errorHandler);

            testUser = await db.User.create({
                username: "testuser",
                email: "test@example.com",
                password: await bcryptHash("password123"),
                bio: "Test bio",
            });

            targetUser = await db.User.create({
                username: "targetuser",
                email: "target@example.com",
                password: await bcryptHash("password123"),
                bio: "Target bio",
            });

            token = await jwtSign(testUser);
        } catch (error) {
            console.error("Setup error:", error);
            throw error;
        }
    });

    describe("GET /profiles/:username", () => {
        it("should return profile for existing user", async () => {
            const res = await request(app)
                .get("/profiles/targetuser")
                .set("Authorization", `Token ${token}`)
                .set("email", testUser.email);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("profile");
            expect(res.body.profile.username).toBe("targetuser");
            expect(res.body.profile.bio).toBe("Target bio");
        });

        it("should return 404 for non-existent user", async () => {
            const res = await request(app)
                .get("/profiles/nonexistent")
                .set("Authorization", `Token ${token}`)
                .set("email", testUser.email);

            expect(res.status).toBe(404);
        });
    });

    describe("POST /profiles/:username/follow", () => {
        it("should follow user", async () => {
            const res = await request(app)
                .post("/profiles/targetuser/follow")
                .set("Authorization", `Token ${token}`)
                .set("email", testUser.email);

            expect(res.status).toBe(200);
            expect(res.body.profile.username).toBe("targetuser");

            const followers = await targetUser.getFollowers();
            expect(followers.length).toBe(1);
            expect(followers[0].id).toBe(testUser.id);
        });

        it("should fail without auth", async () => {
            const res = await request(app)
                .post("/profiles/targetuser/follow");

            expect(res.status).toBe(401);
        });

        it("should return 404 for non-existent user", async () => {
            const res = await request(app)
                .post("/profiles/nonexistent/follow")
                .set("Authorization", `Token ${token}`)
                .set("email", testUser.email);

            expect(res.status).toBe(404);
        });
    });

    describe("DELETE /profiles/:username/follow", () => {
        beforeEach(async () => {
            await targetUser.addFollower(testUser);
        });

        it("should unfollow user", async () => {
            const res = await request(app)
                .delete("/profiles/targetuser/follow")
                .set("Authorization", `Token ${token}`)
                .set("email", testUser.email);

            expect(res.status).toBe(200);
            expect(res.body.profile.username).toBe("targetuser");

            const followers = await targetUser.getFollowers();
            expect(followers.length).toBe(0);
        });

        it("should fail without auth", async () => {
            const res = await request(app)
                .delete("/profiles/targetuser/follow");

            expect(res.status).toBe(401);
        });

        it("should return 404 for non-existent user", async () => {
            const res = await request(app)
                .delete("/profiles/nonexistent/follow")
                .set("Authorization", `Token ${token}`)
                .set("email", testUser.email);

            expect(res.status).toBe(404);
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
