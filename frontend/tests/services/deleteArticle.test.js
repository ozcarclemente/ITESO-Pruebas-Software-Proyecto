import { describe, it, expect, beforeEach } from "@jest/globals";
import axios from "axios";
import deleteArticle from "../../src/services/deleteArticle";

jest.mock("axios");
jest.mock("../../src/helpers/errorHandler", () => ({
    default: jest.fn(),
}));

describe("deleteArticle Service", () => {
    const mockHeaders = { Authorization: "Bearer token" };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should delete article by slug", async () => {
        const mockResponse = {
            message: { body: ["Article deleted successfully"] },
        };

        axios.mockResolvedValue({
            data: mockResponse,
        });

        const result = await deleteArticle({
            headers: mockHeaders,
            slug: "how-to-train-your-dragon",
        });

        expect(result).toEqual(mockResponse);
        expect(axios).toHaveBeenCalledWith(
            expect.objectContaining({
                method: "DELETE",
                url: "api/articles/how-to-train-your-dragon/",
            })
        );
    });

    it("should use DELETE HTTP method", async () => {
        axios.mockResolvedValue({ data: {} });

        await deleteArticle({
            headers: mockHeaders,
            slug: "test-article",
        });

        expect(axios).toHaveBeenCalledWith(
            expect.objectContaining({
                method: "DELETE",
            })
        );
    });

    it("should include slug in URL with trailing slash", async () => {
        axios.mockResolvedValue({ data: {} });

        await deleteArticle({
            headers: mockHeaders,
            slug: "my-article",
        });

        expect(axios).toHaveBeenCalledWith(
            expect.objectContaining({
                url: "api/articles/my-article/",
            })
        );
    });

    it("should include headers in request", async () => {
        const customHeaders = { Authorization: "Bearer customtoken" };

        axios.mockResolvedValue({ data: {} });

        await deleteArticle({
            headers: customHeaders,
            slug: "article",
        });

        expect(axios).toHaveBeenCalledWith(
            expect.objectContaining({
                headers: customHeaders,
            })
        );
    });

    it("should return response data", async () => {
        const mockResponse = {
            message: { body: ["Article deleted successfully"] },
        };

        axios.mockResolvedValue({
            data: mockResponse,
        });

        const result = await deleteArticle({
            headers: mockHeaders,
            slug: "article-to-delete",
        });

        expect(result).toEqual(mockResponse);
        expect(result.message.body[0]).toBe("Article deleted successfully");
    });

    it("should handle different slug formats", async () => {
        axios.mockResolvedValue({ data: {} });

        const slugs = [
            "simple-slug",
            "slug-with-many-words-here",
            "slug123",
        ];

        for (const slug of slugs) {
            jest.clearAllMocks();
            axios.mockResolvedValue({ data: {} });

            await deleteArticle({
                headers: mockHeaders,
                slug: slug,
            });

            expect(axios).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: `api/articles/${slug}/`,
                })
            );
        }
    });

    it("should work without additional response data", async () => {
        axios.mockResolvedValue({
            data: {},
        });

        const result = await deleteArticle({
            headers: mockHeaders,
            slug: "article",
        });

        expect(result).toEqual({});
    });
});
