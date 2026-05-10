jest.mock("../../models/index.js", () => ({
    Article: { findOne: jest.fn() },
    Comment: { findByPk: jest.fn(), create: jest.fn() },
    User: { create: jest.fn() },
}));

jest.mock("../../helper/helpers", () => ({
    appendFollowers: jest.fn().mockResolvedValue(),
}));

const {
    allComments,
    createComment,
    deleteComment,
} = require("../../controllers/comments");
const {
    NotFoundError,
    UnauthorizedError,
    FieldRequiredError,
    ForbiddenError,
} = require("../../helper/customErrors");
const { Article, Comment } = require("../../models");

describe("Comments Controller", () => {
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        mockRes = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    describe("allComments", () => {
        it("should get all comments for an article", async () => {
            const mockComments = [
                {
                    id: 1,
                    body: "Great article!",
                    author: { username: "testuser" },
                },
            ];

            mockReq = {
                params: { slug: "test-article" },
                loggedUser: { id: 1, username: "testuser" },
            };

            Article.findOne.mockResolvedValueOnce({
                getComments: jest.fn().mockResolvedValueOnce(mockComments),
            });

            await allComments(mockReq, mockRes, mockNext);

            expect(mockRes.json).toHaveBeenCalledWith({
                comments: mockComments,
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it("should throw NotFoundError when article not found", async () => {
            mockReq = {
                params: { slug: "nonexistent" },
                loggedUser: { id: 1 },
            };

            Article.findOne.mockResolvedValueOnce(null);

            await allComments(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
        });

        it("should handle empty comments list", async () => {
            mockReq = {
                params: { slug: "test-article" },
                loggedUser: { id: 1 },
            };

            Article.findOne.mockResolvedValueOnce({
                getComments: jest.fn().mockResolvedValueOnce([]),
            });

            await allComments(mockReq, mockRes, mockNext);

            expect(mockRes.json).toHaveBeenCalledWith({ comments: [] });
        });
    });

    describe("createComment", () => {
        it("should create a comment for an article", async () => {
            const testUser = {
                id: 1,
                username: "testuser",
                dataValues: { token: "test-token" },
            };

            mockReq = {
                params: { slug: "test-article" },
                body: { comment: { body: "Great article!" } },
                loggedUser: testUser,
            };

            Article.findOne.mockResolvedValueOnce({
                id: 1,
                slug: "test-article",
            });
            Comment.create.mockResolvedValueOnce({
                body: "Great article!",
                userId: 1,
                dataValues: { author: testUser },
            });

            await createComment(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalled();
            expect(Comment.create).toHaveBeenCalledWith({
                body: "Great article!",
                articleId: 1,
                userId: 1,
            });
        });

        it("should throw UnauthorizedError when user not logged in", async () => {
            mockReq = {
                params: { slug: "test-article" },
                body: { comment: { body: "Test" } },
                loggedUser: null,
            };

            await createComment(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(
                expect.any(UnauthorizedError),
            );
        });

        it("should throw FieldRequiredError when comment body is missing", async () => {
            mockReq = {
                params: { slug: "test-article" },
                body: { comment: {} },
                loggedUser: { id: 1 },
            };

            await createComment(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(
                expect.any(FieldRequiredError),
            );
        });

        it("should throw NotFoundError when article not found", async () => {
            mockReq = {
                params: { slug: "nonexistent" },
                body: { comment: { body: "Test" } },
                loggedUser: { id: 1 },
            };

            Article.findOne.mockResolvedValueOnce(null);

            await createComment(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
        });
    });

    describe("deleteComment", () => {
        it("should delete own comment", async () => {
            const mockComment = {
                id: 1,
                userId: 1,
                destroy: jest.fn().mockResolvedValue(),
            };

            mockReq = {
                params: { commentId: 1 },
                loggedUser: { id: 1 },
            };

            Comment.findByPk.mockResolvedValueOnce(mockComment);

            await deleteComment(mockReq, mockRes, mockNext);

            expect(mockComment.destroy).toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalledWith({
                message: { body: ["Comment deleted successfully"] },
            });
        });

        it("should throw UnauthorizedError when user not logged in", async () => {
            mockReq = {
                params: { commentId: 1 },
                loggedUser: null,
            };

            await deleteComment(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(
                expect.any(UnauthorizedError),
            );
        });

        it("should throw NotFoundError when comment not found", async () => {
            mockReq = {
                params: { commentId: 999 },
                loggedUser: { id: 1 },
            };

            Comment.findByPk.mockResolvedValueOnce(null);

            await deleteComment(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
        });

        it("should throw ForbiddenError when deleting others comment", async () => {
            const mockComment = {
                id: 1,
                userId: 2,
                destroy: jest.fn(),
            };

            mockReq = {
                params: { commentId: 1 },
                loggedUser: { id: 1 },
            };

            Comment.findByPk.mockResolvedValueOnce(mockComment);

            await deleteComment(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
            expect(mockComment.destroy).not.toHaveBeenCalled();
        });
    });
});
