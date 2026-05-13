import { describe, it, expect, beforeEach } from "@jest/globals";
import axios from "axios";
import getArticle from "../../src/services/getArticle";

jest.mock("axios");
jest.mock("../../src/helpers/errorHandler", () => ({
    default: jest.fn(),
}));

describe("getArticle Service", () => {
    const mockHeaders = { Authorization: "Bearer token" };
    const mockArticle = {
        id: 1,
        slug: "how-to-train-your-dragon",
        title: "How to train your dragon",
        description: "Ever wonder how?",
        body: "It takes a Jacobian",
        tagList: ["dragons", "training"],
        author: {
            username: "jake",
            bio: "I work at statefarm",
            image: "https://i.stack.imgur.com/xHWG8.jpg",
            following: false,
        },
        createdAt: "2016-02-18T03:48:35.824Z",
        updatedAt: "2016-02-18T03:48:35.824Z",
        favorited: false,
        favoritesCount: 0,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should fetch single article by slug", async () => {
        axios.mockResolvedValue({
            data: { article: mockArticle },
        });

        const result = await getArticle({
            headers: mockHeaders,
            slug: "how-to-train-your-dragon",
        });

        expect(result).toEqual(mockArticle);
        expect(axios).toHaveBeenCalledWith({
            headers: mockHeaders,
            url: "api/articles/how-to-train-your-dragon",
        });
    });

    it("should return only article data, not wrapper", async () => {
        const fullResponse = {
            article: mockArticle,
            extra: "data",
        };

        axios.mockResolvedValue({
            data: fullResponse,
        });

        const result = await getArticle({
            headers: mockHeaders,
            slug: "article-slug",
        });

        expect(result).toEqual(mockArticle);
        expect(result.id).toBe(1);
        expect(result.title).toBe("How to train your dragon");
    });

    it("should pass correct slug in URL", async () => {
        axios.mockResolvedValue({
            data: { article: mockArticle },
        });

        await getArticle({
            headers: mockHeaders,
            slug: "custom-slug",
        });

        expect(axios).toHaveBeenCalledWith(
            expect.objectContaining({
                url: "api/articles/custom-slug",
            }),
        );
    });

    it("should include headers in request", async () => {
        axios.mockResolvedValue({
            data: { article: mockArticle },
        });

        const customHeaders = { Authorization: "Bearer customtoken" };

        await getArticle({
            headers: customHeaders,
            slug: "article",
        });

        expect(axios).toHaveBeenCalledWith(
            expect.objectContaining({
                headers: customHeaders,
            }),
        );
    });

    it("should handle article without tags", async () => {
        const articleNoTags = { ...mockArticle, tagList: [] };

        axios.mockResolvedValue({
            data: { article: articleNoTags },
        });

        const result = await getArticle({
            headers: mockHeaders,
            slug: "notags-article",
        });

        expect(result.tagList).toEqual([]);
    });

    it("should handle article with many tags", async () => {
        const articleManyTags = {
            ...mockArticle,
            tagList: ["dragons", "training", "advanced", "tips", "guide"],
        };

        axios.mockResolvedValue({
            data: { article: articleManyTags },
        });

        const result = await getArticle({
            headers: mockHeaders,
            slug: "manytags-article",
        });

        expect(result.tagList).toHaveLength(5);
    });
});
