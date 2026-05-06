import axios from "axios";

jest.mock("axios");
jest.mock("../../src/helpers/errorHandler", () => jest.fn());

import getComments from "../../src/services/getComments";
import postComment from "../../src/services/postComment";
import deleteComment from "../../src/services/deleteComment";
import errorHandler from "../../src/helpers/errorHandler";

describe("Comments Services", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getComments", () => {
        it("should fetch comments for an article", async () => {
            const mockComments = [
                { id: 1, body: "Great article!" },
                { id: 2, body: "Nice post!" },
            ];

            axios.mockResolvedValueOnce({
                data: { comments: mockComments },
            });

            const result = await getComments({ slug: "test-article" });

            expect(axios).toHaveBeenCalledWith({
                url: "api/articles/test-article/comments",
            });
            expect(result).toEqual(mockComments);
        });

        it("should handle getComments error", async () => {
            const error = new Error("Network error");
            axios.mockRejectedValueOnce(error);

            await getComments({ slug: "test-article" });

            expect(errorHandler).toHaveBeenCalledWith(error);
        });

        it("should return empty array when no comments", async () => {
            axios.mockResolvedValueOnce({
                data: { comments: [] },
            });

            const result = await getComments({ slug: "empty-article" });

            expect(result).toEqual([]);
        });
    });

    describe("postComment", () => {
        it("should create a new comment", async () => {
            const mockComment = {
                id: 1,
                body: "Great article!",
                author: { username: "testuser" },
            };

            axios.mockResolvedValueOnce({
                data: { comment: mockComment },
            });

            const result = await postComment({
                body: "Great article!",
                headers: { Authorization: "Token test" },
                slug: "test-article",
            });

            expect(axios).toHaveBeenCalledWith({
                data: { comment: { body: "Great article!" } },
                headers: { Authorization: "Token test" },
                method: "POST",
                url: "api/articles/test-article/comments",
            });
            expect(result).toEqual(mockComment);
        });

        it("should handle postComment error", async () => {
            const error = new Error("Request failed");
            axios.mockRejectedValueOnce(error);

            await postComment({
                body: "Test",
                headers: { Authorization: "Token test" },
                slug: "test-article",
            });

            expect(errorHandler).toHaveBeenCalledWith(error);
        });

        it("should pass correct headers for authenticated request", async () => {
            const headers = { Authorization: "Token abc123" };

            axios.mockResolvedValueOnce({
                data: { comment: {} },
            });

            await postComment({
                body: "Test comment",
                headers,
                slug: "test-article",
            });

            expect(axios).toHaveBeenCalledWith(
                expect.objectContaining({
                    headers,
                }),
            );
        });
    });

    describe("deleteComment", () => {
        it("should delete a comment", async () => {
            axios.mockResolvedValueOnce({
                data: { message: { body: ["Comment deleted"] } },
            });

            const result = await deleteComment({
                commentId: 1,
                headers: { Authorization: "Token test" },
                slug: "test-article",
            });

            expect(axios).toHaveBeenCalledWith({
                headers: { Authorization: "Token test" },
                method: "DELETE",
                url: "api/articles/test-article/comments/1",
            });
            expect(result).toHaveProperty("message");
        });

        it("should handle deleteComment error", async () => {
            const error = new Error("Delete failed");
            axios.mockRejectedValueOnce(error);

            await deleteComment({
                commentId: 1,
                headers: { Authorization: "Token test" },
                slug: "test-article",
            });

            expect(errorHandler).toHaveBeenCalledWith(error);
        });

        it("should use correct DELETE method", async () => {
            axios.mockResolvedValueOnce({
                data: { message: { body: ["Deleted"] } },
            });

            await deleteComment({
                commentId: 5,
                headers: { Authorization: "Token test" },
                slug: "my-article",
            });

            expect(axios).toHaveBeenCalledWith(
                expect.objectContaining({
                    method: "DELETE",
                }),
            );
        });
    });
});
