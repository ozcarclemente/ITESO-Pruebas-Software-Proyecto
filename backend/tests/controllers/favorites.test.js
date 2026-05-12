const { describe, it, expect, beforeEach } = require("@jest/globals");
const { Article } = require("../../models");
const { favoriteToggler } = require("../../controllers/favorites");
const {
    UnauthorizedError,
    NotFoundError,
} = require("../../helper/customErrors");

jest.mock("../../models", () => ({
    Article: {
        findOne: jest.fn(),
    },
    Tag: {},
    User: {},
}));

jest.mock("../../helper/helpers", () => {
    const realHelpers = jest.requireActual("../../helper/helpers");
    return {
        ...realHelpers,
        appendFollowers: jest.fn(),
        appendFavorites: jest.fn(),
    };
});

describe("Favorite Toggler Controller", () => {
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRes = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
        };
        mockNext = jest.fn();
    });

    it("should throw UnauthorizedError if user is not logged in", async () => {
        mockReq = {
            loggedUser: null,
            params: { slug: "test-slug" },
            method: "POST",
        };

        await favoriteToggler(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it("should throw NotFoundError if article is not found", async () => {
        mockReq = {
            loggedUser: { id: 1 },
            params: { slug: "non-existent" },
            method: "POST",
        };
        Article.findOne.mockResolvedValue(null);

        await favoriteToggler(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    it("should favorite an article (POST method)", async () => {
        const mockArticle = {
            slug: "test-slug",
            addUser: jest.fn().mockResolvedValue(true),
            tagList: [],
            author: {},
            dataValues: {},
        };
        mockReq = {
            loggedUser: { id: 1 },
            params: { slug: "test-slug" },
            method: "POST",
        };
        Article.findOne.mockResolvedValue(mockArticle);

        await favoriteToggler(mockReq, mockRes, mockNext);

        expect(mockArticle.addUser).toHaveBeenCalledWith(mockReq.loggedUser);
        expect(mockRes.json).toHaveBeenCalledWith({ article: mockArticle });
    });

    it("should unfavorite an article (DELETE method)", async () => {
        const mockArticle = {
            slug: "test-slug",
            removeUser: jest.fn().mockResolvedValue(true),
            tagList: [],
            author: {},
            dataValues: {},
        };
        mockReq = {
            loggedUser: { id: 1 },
            params: { slug: "test-slug" },
            method: "DELETE",
        };
        Article.findOne.mockResolvedValue(mockArticle);

        await favoriteToggler(mockReq, mockRes, mockNext);

        expect(mockArticle.removeUser).toHaveBeenCalledWith(mockReq.loggedUser);
        expect(mockRes.json).toHaveBeenCalledWith({ article: mockArticle });
    });
});
