process.env.NODE_ENV = "development";

const { seedUser } = require("./setup");
const request = require("supertest");
const app = require("../../index");
const bcrypt = require("bcrypt");

describe("Users Routes Integration Tests", () => {
    describe("POST /api/users", () => {
        it("creates new user with valid data", async () => {
            const response = await request(app)
                .post("/api/users")
                .send({
                    user: {
                        username: "newuser",
                        email: "newuser@example.com",
                        password: "securepassword123",
                    },
                });

            expect(response.status).toBe(201);
            expect(response.body.user.username).toBe("newuser");
            expect(response.body.user.email).toBe("newuser@example.com");
            expect(response.body.user.token).toBeDefined();
        });

        it("rejects duplicate email", async () => {
            await seedUser({ email: "existing@example.com" });

            const response = await request(app)
                .post("/api/users")
                .send({
                    user: {
                        username: "differentuser",
                        email: "existing@example.com",
                        password: "password123",
                    },
                });

            expect(response.status).toBe(422);
        });

        it("allows duplicate username (different users)", async () => {
            await seedUser({ username: "sameusername" });

            const response = await request(app)
                .post("/api/users")
                .send({
                    user: {
                        username: "sameusername",
                        email: "different@example.com",
                        password: "password123",
                    },
                });

            expect(response.status).toBe(201);
        });

        it("rejects missing username", async () => {
            const response = await request(app)
                .post("/api/users")
                .send({
                    user: {
                        email: "test@example.com",
                        password: "password123",
                    },
                });

            expect(response.status).toBe(422);
        });

        it("rejects missing email", async () => {
            const response = await request(app)
                .post("/api/users")
                .send({
                    user: {
                        username: "testuser",
                        password: "password123",
                    },
                });

            expect(response.status).toBe(422);
        });

        it("rejects missing password", async () => {
            const response = await request(app)
                .post("/api/users")
                .send({
                    user: {
                        username: "testuser",
                        email: "test@example.com",
                    },
                });

            expect(response.status).toBe(422);
        });
    });

    describe("POST /api/users/login", () => {
        it("logs in with valid credentials", async () => {
            const email = "login@example.com";
            const password = "correctpassword";

            await seedUser({
                email,
                password: await bcrypt.hash(password, 10),
            });

            const response = await request(app)
                .post("/api/users/login")
                .send({
                    user: {
                        email,
                        password,
                    },
                });

            expect(response.status).toBe(200);
            expect(response.body.user.email).toBe(email);
            expect(response.body.user.token).toBeDefined();
        });

        it("rejects nonexistent email", async () => {
            const response = await request(app)
                .post("/api/users/login")
                .send({
                    user: {
                        email: "nonexistent@example.com",
                        password: "somepassword",
                    },
                });

            expect(response.status).toBe(404);
        });

        it("rejects invalid password", async () => {
            const email = "user@example.com";

            await seedUser({
                email,
                password: await bcrypt.hash("correctpassword", 10),
            });

            const response = await request(app)
                .post("/api/users/login")
                .send({
                    user: {
                        email,
                        password: "wrongpassword",
                    },
                });

            expect(response.status).toBe(422);
        });

        it("returns user without password", async () => {
            const email = "nopwd@example.com";
            const password = "testpassword";

            await seedUser({
                email,
                password: await bcrypt.hash(password, 10),
            });

            const response = await request(app)
                .post("/api/users/login")
                .send({
                    user: {
                        email,
                        password,
                    },
                });

            expect(response.status).toBe(200);
            expect(response.body.user.password).toBeUndefined();
        });
    });
});
