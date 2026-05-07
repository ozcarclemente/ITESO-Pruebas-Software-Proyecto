process.env.NODE_ENV = "development";

const request = require("supertest");
const { createTestSequelize } = require("./sequelize-helper");
const express = require("express");
const errorHandler = require("../../middleware/errorHandler");
const usersRouter = require("../../routes/users");

let app;
let db;

describe("Users Integration - Signup & Login", () => {
    beforeAll(async () => {
        jest.spyOn(console, "log").mockImplementation(() => {});
        jest.spyOn(console, "error").mockImplementation(() => {});

        try {
            db = await createTestSequelize();

            app = express();
            app.use(express.json());
            app.use("/users", usersRouter);
            app.use(errorHandler);
        } catch (error) {
            console.error("Setup error:", error);
            throw error;
        }
    });

    describe("POST /users (Signup)", () => {
        it("should create user with valid credentials", async () => {
            const uniqueEmail = `test${Date.now()}@example.com`;
            const res = await request(app)
                .post("/users")
                .send({
                    user: {
                        username: "testuser",
                        email: uniqueEmail,
                        password: "password123",
                        bio: "Test bio",
                        image: "https://example.com/image.jpg",
                    },
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("user");
            expect(res.body.user.username).toBe("testuser");
            expect(res.body.user.email).toBe(uniqueEmail);
            expect(res.body.user).toHaveProperty("token");

            const userInDb = await db.User.findOne({
                where: { email: uniqueEmail },
            });
            expect(userInDb).toBeDefined();
        });

        it("should fail without username", async () => {
            const res = await request(app)
                .post("/users")
                .send({
                    user: {
                        email: "nouser@example.com",
                        password: "password123",
                    },
                });

            expect(res.status).toBe(422);
        });

        it("should fail without email", async () => {
            const res = await request(app)
                .post("/users")
                .send({
                    user: {
                        username: "noemail",
                        password: "password123",
                    },
                });

            expect(res.status).toBe(422);
        });

        it("should fail without password", async () => {
            const res = await request(app)
                .post("/users")
                .send({
                    user: {
                        username: "nopass",
                        email: "nopass@example.com",
                    },
                });

            expect(res.status).toBe(422);
        });

        it("should fail with duplicate email", async () => {
            await request(app)
                .post("/users")
                .send({
                    user: {
                        username: "user1",
                        email: "duplicate@example.com",
                        password: "password123",
                    },
                });

            const res = await request(app)
                .post("/users")
                .send({
                    user: {
                        username: "user2",
                        email: "duplicate@example.com",
                        password: "password123",
                    },
                });

            expect(res.status).toBe(422);
        });
    });

    describe("POST /users/login (Signin)", () => {
        beforeEach(async () => {
            await db.User.create({
                username: "loginuser",
                email: "login@example.com",
                password:
                    "$2b$10$S2RYg0L.FptGZu4ZbWxmnOXmIgi4HyUcKoIs62zyAR9Giej9ev7lm", // password123
                bio: "Login test",
            });
        });

        it("should login with correct credentials", async () => {
            const res = await request(app)
                .post("/users/login")
                .send({
                    user: {
                        email: "login@example.com",
                        password: "password123",
                    },
                });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("user");
            expect(res.body.user.username).toBe("loginuser");
            expect(res.body.user.email).toBe("login@example.com");
            expect(res.body.user).toHaveProperty("token");
        });

        it("should fail with non-existent email", async () => {
            const res = await request(app)
                .post("/users/login")
                .send({
                    user: {
                        email: "nonexistent@example.com",
                        password: "password123",
                    },
                });

            expect(res.status).toBe(404);
        });

        it("should fail with wrong password", async () => {
            const res = await request(app)
                .post("/users/login")
                .send({
                    user: {
                        email: "login@example.com",
                        password: "wrongpassword",
                    },
                });

            expect(res.status).toBe(422);
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
