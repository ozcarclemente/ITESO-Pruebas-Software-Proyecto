jest.mock("../../helper/customErrors", () => ({
    UnauthorizedError: class UnauthorizedError extends Error {
        constructor(message) {
            super(message);
            this.name = "UnauthorizedError";
        }
    },
    NotFoundError: class NotFoundError extends Error {
        constructor(message) {
            super(message);
            this.name = "NotFoundError";
        }
    },
}));

jest.mock("../../helper/helpers", () => ({
    appendFollowers: jest.fn(),
}));

jest.mock("../../models", () => ({
    User: {
        findOne: jest.fn(),
    },
}));

const { getProfile, followToggler } = require("../../controllers/profiles");
const { appendFollowers } = require("../../helper/helpers");
const { User } = require("../../models");

describe("Profiles Controller", () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            params: {},
            method: "GET",
            loggedUser: { id: 1, username: "currentuser" },
        };
        res = {
            json: jest.fn(),
        };
        next = jest.fn();

        jest.clearAllMocks();
    });

    describe("getProfile", () => {
        it("should return user profile", async () => {
            const mockProfile = {
                id: 2,
                username: "testuser",
                bio: "Test bio",
                image: "https://example.com/image.jpg",
            };

            req.params.username = "testuser";
            User.findOne.mockResolvedValue(mockProfile);
            appendFollowers.mockResolvedValue(undefined);

            await getProfile(req, res, next);

            expect(User.findOne).toHaveBeenCalledWith({
                where: { username: "testuser" },
                attributes: { exclude: "email" },
            });
            expect(appendFollowers).toHaveBeenCalledWith(
                req.loggedUser,
                mockProfile,
            );
            expect(res.json).toHaveBeenCalledWith({ profile: mockProfile });
        });

        it("should throw NotFoundError when user not found", async () => {
            req.params.username = "nonexistent";
            User.findOne.mockResolvedValue(null);

            await getProfile(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
        });
    });

    describe("followToggler", () => {
        it("should add follower on POST", async () => {
            const mockProfile = {
                id: 2,
                username: "testuser",
                addFollower: jest.fn().mockResolvedValue(undefined),
            };

            req.method = "POST";
            req.params.username = "testuser";
            User.findOne.mockResolvedValue(mockProfile);
            appendFollowers.mockResolvedValue(undefined);

            await followToggler(req, res, next);

            expect(mockProfile.addFollower).toHaveBeenCalledWith(
                req.loggedUser,
            );
            expect(res.json).toHaveBeenCalledWith({ profile: mockProfile });
        });

        it("should remove follower on DELETE", async () => {
            const mockProfile = {
                id: 2,
                username: "testuser",
                removeFollower: jest.fn().mockResolvedValue(undefined),
            };

            req.method = "DELETE";
            req.params.username = "testuser";
            User.findOne.mockResolvedValue(mockProfile);
            appendFollowers.mockResolvedValue(undefined);

            await followToggler(req, res, next);

            expect(mockProfile.removeFollower).toHaveBeenCalledWith(
                req.loggedUser,
            );
            expect(res.json).toHaveBeenCalledWith({ profile: mockProfile });
        });

        it("should throw UnauthorizedError when not logged in", async () => {
            req.loggedUser = null;
            req.method = "POST";

            await followToggler(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
        });

        it("should throw NotFoundError when profile not found", async () => {
            req.method = "POST";
            req.params.username = "nonexistent";
            User.findOne.mockResolvedValue(null);

            await followToggler(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
        });
    });
});
