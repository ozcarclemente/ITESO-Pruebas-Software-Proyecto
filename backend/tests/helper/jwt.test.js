jest.mock("jsonwebtoken");

// Set env var before requiring module
process.env.JWT_KEY = "test-secret-key";

const jwt = require("jsonwebtoken");
const { jwtSign, jwtVerify } = require("../../helper/jwt");

describe("JWT Helper", () => {
    const mockPayload = {
        username: "testuser",
        email: "test@test.com",
        id: 1,
    };

    const mockToken = "mocked.jwt.token";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("jwtSign", () => {
        it("should sign token with username and email", async () => {
            jwt.sign.mockReturnValue(mockToken);

            const token = await jwtSign(mockPayload);

            expect(jwt.sign).toHaveBeenCalledWith(
                { username: "testuser", email: "test@test.com" },
                "test-secret-key",
            );
            expect(token).toBe(mockToken);
        });

        it("should ignore extra payload properties", async () => {
            jwt.sign.mockReturnValue(mockToken);

            await jwtSign({
                ...mockPayload,
                password: "secret",
                bio: "extra",
            });

            expect(jwt.sign).toHaveBeenCalledWith(
                { username: "testuser", email: "test@test.com" },
                "test-secret-key",
            );
        });
    });

    describe("jwtVerify", () => {
        it("should verify valid token", async () => {
            const decodedPayload = {
                username: "testuser",
                email: "test@test.com",
                iat: 1234567890,
            };

            jwt.verify.mockReturnValue(decodedPayload);

            const result = await jwtVerify(mockToken);

            expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test-secret-key");
            expect(result).toEqual(decodedPayload);
        });

        it("should throw error on invalid token", async () => {
            const error = new Error("Invalid token");
            jwt.verify.mockImplementation(() => {
                throw error;
            });

            await expect(jwtVerify("invalid.token")).rejects.toThrow(
                "Invalid token",
            );
        });

        it("should throw error on expired token", async () => {
            const error = new Error("Token expired");
            jwt.verify.mockImplementation(() => {
                throw error;
            });

            await expect(jwtVerify("expired.token")).rejects.toThrow(
                "Token expired",
            );
        });
    });
});
