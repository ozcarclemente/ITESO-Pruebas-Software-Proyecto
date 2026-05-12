jest.mock("../../helper/customErrors", () => ({
    NotFoundError: class NotFoundError extends Error {
        constructor(message) {
            super(message);
            this.name = "NotFoundError";
        }
    },
}));

jest.mock("../../helper/jwt", () => ({
    jwtVerify: jest.fn(),
}));

jest.mock("../../models", () => ({
    User: {
        findOne: jest.fn(),
    },
}));

const verifyToken = require("../../middleware/authentication");
const { jwtVerify } = require("../../helper/jwt");
const { User } = require("../../models");

describe("Authentication Middleware", () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {},
        };
        res = {};
        next = jest.fn();

        jest.clearAllMocks();
    });

    it("should call next without token", async () => {
        await verifyToken(req, res, next);

        expect(next).toHaveBeenCalledWith();
        expect(User.findOne).not.toHaveBeenCalled();
    });

    it("should call next with valid token and user found", async () => {
        const mockUser = {
            id: 1,
            username: "testuser",
            dataValues: {},
        };

        req.headers.authorization = "Bearer valid.token.here";
        jwtVerify.mockResolvedValue({ email: "test@test.com" });
        User.findOne.mockResolvedValue(mockUser);

        await verifyToken(req, res, next);

        expect(jwtVerify).toHaveBeenCalledWith("valid.token.here");
        expect(User.findOne).toHaveBeenCalledWith({
            attributes: { exclude: ["email"] },
            where: { email: "test@test.com" },
        });
        expect(req.loggedUser).toBe(mockUser);
        expect(req.loggedUser.dataValues.token).toBe("valid.token.here");
        expect(req.headers.email).toBe("test@test.com");
        expect(next).toHaveBeenCalledWith();
    });

    it("should throw error with malformed token", async () => {
        req.headers.authorization = "Bearer";

        await verifyToken(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    });

    it("should throw error with invalid token", async () => {
        req.headers.authorization = "Bearer invalid.token";
        jwtVerify.mockResolvedValue(null);

        await verifyToken(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    });

    it("should call next with error when user not found", async () => {
        req.headers.authorization = "Bearer valid.token.here";
        jwtVerify.mockResolvedValue({ email: "notfound@test.com" });
        User.findOne.mockResolvedValue(null);

        await verifyToken(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it("should handle jwt verification errors", async () => {
        req.headers.authorization = "Bearer bad.token";
        const jwtError = new Error("JWT Error");
        jwtVerify.mockRejectedValue(jwtError);

        await verifyToken(req, res, next);

        expect(next).toHaveBeenCalledWith(jwtError);
    });
});
