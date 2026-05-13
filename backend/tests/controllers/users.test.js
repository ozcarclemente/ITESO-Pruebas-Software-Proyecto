jest.mock("../../models", () => ({
    User: {
        findOne: jest.fn(),
        create: jest.fn(),
    },
}));

jest.mock("../../helper/jwt", () => ({
    jwtSign: jest.fn(),
}));

jest.mock("../../helper/bcrypt", () => ({
    bcryptHash: jest.fn(),
    bcryptCompare: jest.fn(),
}));

jest.mock("../../helper/customErrors", () => ({
    ValidationError: class ValidationError extends Error {
        constructor(message) {
            super(message);
            this.name = "ValidationError";
        }
    },
    FieldRequiredError: class FieldRequiredError extends Error {
        constructor(message) {
            super(message);
            this.name = "FieldRequiredError";
        }
    },
    AlreadyTakenError: class AlreadyTakenError extends Error {
        constructor(message) {
            super(message);
            this.name = "AlreadyTakenError";
        }
    },
    NotFoundError: class NotFoundError extends Error {
        constructor(message) {
            super(message);
            this.name = "NotFoundError";
        }
    },
}));

const { signUp, signIn } = require("../../controllers/users");
const { User } = require("../../models");
const { jwtSign } = require("../../helper/jwt");
const { bcryptHash, bcryptCompare } = require("../../helper/bcrypt");

describe("Users Controller", () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();

        jest.clearAllMocks();
    });

    describe("signUp", () => {
        it("should create new user with valid data", async () => {
            const mockUser = {
                id: 1,
                username: "newuser",
                email: "newuser@test.com",
                bio: "New user",
                image: "https://example.com/image.jpg",
                password: "hashed_password",
                dataValues: {},
            };

            req.body.user = {
                username: "newuser",
                email: "newuser@test.com",
                bio: "New user",
                image: "https://example.com/image.jpg",
                password: "password123",
            };

            bcryptHash.mockResolvedValue("hashed_password");
            User.create.mockResolvedValue(mockUser);
            jwtSign.mockResolvedValue("test_token");

            await signUp(req, res, next);

            expect(User.findOne).toHaveBeenCalledWith({
                where: { email: "newuser@test.com" },
            });
            expect(bcryptHash).toHaveBeenCalledWith("password123");
            expect(User.create).toHaveBeenCalledWith({
                email: "newuser@test.com",
                username: "newuser",
                bio: "New user",
                image: "https://example.com/image.jpg",
                password: "hashed_password",
            });
            expect(jwtSign).toHaveBeenCalledWith(mockUser);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalled();
        });

        it("should throw FieldRequiredError when username missing", async () => {
            req.body.user = {
                email: "test@test.com",
                password: "password123",
            };

            await signUp(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
        });

        it("should throw FieldRequiredError when email missing", async () => {
            req.body.user = {
                username: "testuser",
                password: "password123",
            };

            await signUp(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
        });

        it("should throw FieldRequiredError when password missing", async () => {
            req.body.user = {
                username: "testuser",
                email: "test@test.com",
            };

            await signUp(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
        });

        it("should throw AlreadyTakenError when email exists", async () => {
            const { User: MockUser } = require("../../models");
            MockUser.findOne.mockResolvedValue({
                id: 2,
                email: "existing@test.com",
            });

            req.body.user = {
                username: "newuser",
                email: "existing@test.com",
                password: "password123",
            };

            await signUp(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
        });
    });

    describe("signIn", () => {
        it("should sign in user with valid credentials", async () => {
            const mockUser = {
                id: 1,
                username: "testuser",
                email: "test@test.com",
                password: "hashed_password",
                dataValues: {},
            };

            req.body.user = {
                email: "test@test.com",
                password: "password123",
            };

            User.findOne.mockResolvedValue(mockUser);
            bcryptCompare.mockResolvedValue(true);
            jwtSign.mockResolvedValue("test_token");

            await signIn(req, res, next);

            expect(User.findOne).toHaveBeenCalledWith({
                where: { email: "test@test.com" },
            });
            expect(bcryptCompare).toHaveBeenCalledWith(
                "password123",
                "hashed_password",
            );
            expect(jwtSign).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalled();
        });

        it("should throw NotFoundError when user not found", async () => {
            req.body.user = {
                email: "nonexistent@test.com",
                password: "password123",
            };

            User.findOne.mockResolvedValue(null);

            await signIn(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
        });

        it("should throw ValidationError with wrong password", async () => {
            const mockUser = {
                id: 1,
                email: "test@test.com",
                password: "hashed_password",
            };

            req.body.user = {
                email: "test@test.com",
                password: "wrongpassword",
            };

            User.findOne.mockResolvedValue(mockUser);
            bcryptCompare.mockResolvedValue(false);

            await signIn(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
        });
    });
});
