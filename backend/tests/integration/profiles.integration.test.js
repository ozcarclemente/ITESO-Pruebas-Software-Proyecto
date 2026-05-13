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

describe("Profiles Routes Integration Tests", () => {
    describe("GET /api/profiles/:username", () => {
        it("returns profile by username", async () => {
            await seedUser({ username: "profileuser" });

            const response = await request(app)
                .get("/api/profiles/profileuser")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.profile.username).toBe("profileuser");
        });

        it("returns 404 for nonexistent profile", async () => {
            const response = await request(app)
                .get("/api/profiles/nonexistent")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(404);
        });

        it("works without auth", async () => {
            await seedUser({ username: "publicprofile" });

            const response = await request(app).get(
                "/api/profiles/publicprofile",
            );

            expect(response.status).toBe(200);
            expect(response.body.profile.username).toBe("publicprofile");
        });
    });

    describe("POST /api/profiles/:username/follow", () => {
        it("follows profile", async () => {
            await seedUser({ username: "tofollow" });

            const response = await request(app)
                .post("/api/profiles/tofollow/follow")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.profile.following).toBe(true);
        });

        it("returns 404 for nonexistent profile", async () => {
            const response = await request(app)
                .post("/api/profiles/nonexistent/follow")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(404);
        });

        it("requires auth", async () => {
            await seedUser({ username: "needsauth" });

            const response = await request(app).post(
                "/api/profiles/needsauth/follow",
            );

            expect(response.status).toBe(401);
        });

        it("can follow multiple times", async () => {
            await seedUser({ username: "multfollow" });

            const res1 = await request(app)
                .post("/api/profiles/multfollow/follow")
                .set("Authorization", `Bearer ${authToken}`);

            expect(res1.status).toBe(200);

            const res2 = await request(app)
                .post("/api/profiles/multfollow/follow")
                .set("Authorization", `Bearer ${authToken}`);

            expect(res2.status).toBe(200);
        });
    });

    describe("DELETE /api/profiles/:username/follow", () => {
        it("unfollows profile", async () => {
            const profileUser = await seedUser({ username: "tounfollow" });
            await testUser.addFollowing(profileUser);

            const response = await request(app)
                .delete("/api/profiles/tounfollow/follow")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.profile.following).toBe(false);
        });

        it("returns 404 for nonexistent profile", async () => {
            const response = await request(app)
                .delete("/api/profiles/nonexistent/follow")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(404);
        });

        it("requires auth", async () => {
            await seedUser({ username: "unfollowauth" });

            const response = await request(app).delete(
                "/api/profiles/unfollowauth/follow",
            );

            expect(response.status).toBe(401);
        });

        it("can unfollow when not following", async () => {
            await seedUser({ username: "unfollownotfollowing" });

            const response = await request(app)
                .delete("/api/profiles/unfollownotfollowing/follow")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
        });
    });
});
