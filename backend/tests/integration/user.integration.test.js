process.env.NODE_ENV = "development";

const request = require("supertest");
const { createTestSequelize } = require("./sequelize-helper");
const { jwtSign } = require("../../helper/jwt");
const { bcryptHash, bcryptCompare } = require("../../helper/bcrypt");
const express = require("express");
const errorHandler = require("../../middleware/errorHandler");
const userRouter = require("../../routes/user");
const verifyToken = require("../../middleware/authentication");

let app;
let testUser;
let token;
let db;

describe("User Integration - GET & PUT /user", () => {
    beforeAll(async () => {
        jest.spyOn(console, "log").mockImplementation(() => {});
        jest.spyOn(console, "error").mockImplementation(() => {});

        try {
            db = await createTestSequelize();

            app = express();
            app.use(express.json());
            app.use("/user", verifyToken, userRouter);
            app.use(errorHandler);

            testUser = await db.User.create({
                username: "testuser",
                email: "test@example.com",
                password: await bcryptHash("password123"),
                bio: "Original bio",
                image: "https://example.com/image.jpg",
            });

            token = await jwtSign(testUser);
        } catch (error) {
            console.error("Setup error:", error);
            throw error;
        }
    });

    describe("GET /user", () => {
        it("should return current user with auth", async () => {
            const res = await request(app)
                .get("/user")
                .set("Authorization", `Token ${token}`)
                .set("email", testUser.email);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("user");
            expect(res.body.user.username).toBe("testuser");
            expect(res.body.user.email).toBe("test@example.com");
        });

        it("should fail without auth", async () => {
            const res = await request(app).get("/user");

            expect(res.status).toBe(401);
        });
    });

    describe("PUT /user", () => {
        it("should fail without auth", async () => {
            const res = await request(app)
                .put("/user")
                .send({
                    user: {
                        username: "hacker",
                    },
                });

            expect(res.status).toBe(401);
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
