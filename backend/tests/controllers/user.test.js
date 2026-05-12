jest.mock("../../helper/customErrors", () => ({
    UnauthorizedError: class UnauthorizedError extends Error {
        constructor(message) {
            super(message);
            this.name = "UnauthorizedError";
        }
    },
}));

jest.mock("../../helper/bcrypt", () => ({
    bcryptHash: jest.fn(),
}));

const { currentUser, updateUser } = require("../../controllers/user");
const { bcryptHash } = require("../../helper/bcrypt");

describe("User Controller", () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {},
            loggedUser: {
                id: 1,
                username: "testuser",
                email: "test@test.com",
                bio: "Test bio",
                image: "https://example.com/image.jpg",
                password: "hashed_password",
                dataValues: {},
                save: jest.fn().mockResolvedValue(undefined),
            },
            body: {},
        };
        res = {
            json: jest.fn(),
        };
        next = jest.fn();

        jest.clearAllMocks();
    });

    describe("currentUser", () => {
        it("should return current user with email", async () => {
            req.headers.email = "test@test.com";

            await currentUser(req, res, next);

            expect(req.loggedUser.dataValues.email).toBe("test@test.com");
            expect(req.headers.email).toBeUndefined();
            expect(res.json).toHaveBeenCalledWith({ user: req.loggedUser });
        });

        it("should throw UnauthorizedError when not logged in", async () => {
            req.loggedUser = null;

            await currentUser(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
        });
    });

    describe("updateUser", () => {
        it("should update user without password", async () => {
            req.body.user = {
                username: "newusername",
                bio: "New bio",
            };

            await updateUser(req, res, next);

            expect(req.loggedUser.username).toBe("newusername");
            expect(req.loggedUser.bio).toBe("New bio");
            expect(req.loggedUser.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ user: req.loggedUser });
        });

        it("should update user with password", async () => {
            const hashedPassword = "new_hashed_password";
            bcryptHash.mockResolvedValue(hashedPassword);

            req.body.user = {
                username: "newusername",
                password: "newpassword",
            };

            await updateUser(req, res, next);

            expect(bcryptHash).toHaveBeenCalledWith("newpassword");
            expect(req.loggedUser.password).toBe(hashedPassword);
            expect(req.loggedUser.username).toBe("newusername");
            expect(req.loggedUser.save).toHaveBeenCalled();
        });

        it("should ignore empty password", async () => {
            req.body.user = {
                username: "newusername",
                password: "",
            };

            await updateUser(req, res, next);

            expect(bcryptHash).not.toHaveBeenCalled();
            expect(req.loggedUser.save).toHaveBeenCalled();
        });

        it("should skip undefined values", async () => {
            const originalPassword = req.loggedUser.password;
            req.body.user = {
                username: "newusername",
                password: undefined,
            };

            await updateUser(req, res, next);

            expect(req.loggedUser.password).toBe(originalPassword);
            expect(bcryptHash).not.toHaveBeenCalled();
        });

        it("should throw UnauthorizedError when not logged in", async () => {
            req.loggedUser = null;

            await updateUser(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
        });
    });
});
