process.env.NODE_ENV = "development";

const { seedUser } = require("./setup");
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

describe("User Routes Integration Tests", () => {
    describe("GET /api/user", () => {
        it("returns current user", async () => {
            const response = await request(app)
                .get("/api/user")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.user.username).toBe(testUser.username);
            expect(response.body.user.email).toBe(testUser.email);
        });

        it("requires auth", async () => {
            const response = await request(app)
                .get("/api/user");

            expect(response.status).toBe(401);
        });

        it("rejects invalid token", async () => {
            const response = await request(app)
                .get("/api/user")
                .set("Authorization", "Bearer invalid-token");

            expect(response.status).toBe(500);
        });

        it("returns user data without password", async () => {
            const response = await request(app)
                .get("/api/user")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.user.password).toBeUndefined();
        });
    });

    describe("PUT /api/user", () => {
        it("updates user bio", async () => {
            const response = await request(app)
                .put("/api/user")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    user: {
                        bio: "Updated bio",
                    },
                });

            expect(response.status).toBe(200);
            expect(response.body.user.bio).toBe("Updated bio");
        });

        it("updates user image", async () => {
            const response = await request(app)
                .put("/api/user")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    user: {
                        image: "https://example.com/newimage.jpg",
                    },
                });

            expect(response.status).toBe(200);
            expect(response.body.user.image).toBe("https://example.com/newimage.jpg");
        });

        it("updates user password", async () => {
            const newPassword = "newpassword123";
            const response = await request(app)
                .put("/api/user")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    user: {
                        password: newPassword,
                    },
                });

            expect(response.status).toBe(200);

            const loginResponse = await request(app)
                .post("/api/users/login")
                .send({
                    user: {
                        email: testUser.email,
                        password: newPassword,
                    },
                });

            expect(loginResponse.status).toBe(200);
        });

        it("updates multiple fields", async () => {
            const response = await request(app)
                .put("/api/user")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    user: {
                        bio: "New bio",
                        image: "https://example.com/image.jpg",
                    },
                });

            expect(response.status).toBe(200);
            expect(response.body.user.bio).toBe("New bio");
            expect(response.body.user.image).toBe("https://example.com/image.jpg");
        });

        it("allows updating username and email", async () => {
            const response = await request(app)
                .put("/api/user")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    user: {
                        username: "newusername",
                        email: "newemail@example.com",
                        bio: "New bio",
                    },
                });

            expect(response.status).toBe(200);
            expect(response.body.user.username).toBe("newusername");
            expect(response.body.user.email).toBe("newemail@example.com");
            expect(response.body.user.bio).toBe("New bio");
        });

        it("requires auth", async () => {
            const response = await request(app)
                .put("/api/user")
                .send({
                    user: {
                        bio: "New bio",
                    },
                });

            expect(response.status).toBe(401);
        });

        it("allows empty password update", async () => {
            const response = await request(app)
                .put("/api/user")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    user: {
                        password: "",
                        bio: "New bio",
                    },
                });

            expect(response.status).toBe(200);
            expect(response.body.user.bio).toBe("New bio");
        });
    });
});
