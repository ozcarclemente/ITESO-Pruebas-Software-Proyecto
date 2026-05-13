import { describe, it, expect, beforeEach } from "@jest/globals";
import axios from "axios";
import setArticle from "../../src/services/setArticle";

jest.mock("axios");
jest.mock("../../src/helpers/errorHandler", () => ({
    default: jest.fn(),
}));

describe("setArticle Service", () => {
    const mockHeaders = { Authorization: "Bearer token" };
    const mockArticleData = {
        title: "How to train your dragon",
        description: "Ever wonder how?",
        body: "It takes a Jacobian",
        tagList: ["dragons", "training"],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should create new article with POST", async () => {
        const responseSlug = "how-to-train-your-dragon";

        axios.mockResolvedValue({
            data: {
                article: { ...mockArticleData, slug: responseSlug },
            },
        });

        const result = await setArticle({
            headers: mockHeaders,
            ...mockArticleData,
        });

        expect(result).toBe(responseSlug);
        expect(axios).toHaveBeenCalledWith(
            expect.objectContaining({
                method: "POST",
                url: "api/articles",
            }),
        );
    });

    it("should update article with PUT when slug provided", async () => {
        const slug = "how-to-train-your-dragon";
        const responseSlug = "updated-slug";

        axios.mockResolvedValue({
            data: {
                article: { ...mockArticleData, slug: responseSlug },
            },
        });

        const result = await setArticle({
            headers: mockHeaders,
            slug: slug,
            ...mockArticleData,
        });

        expect(result).toBe(responseSlug);
        expect(axios).toHaveBeenCalledWith(
            expect.objectContaining({
                method: "PUT",
                url: `api/articles/${slug}`,
            }),
        );
    });

    it("should send article data in request body", async () => {
        axios.mockResolvedValue({
            data: { article: { slug: "test" } },
        });

        await setArticle({
            headers: mockHeaders,
            ...mockArticleData,
        });

        expect(axios).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
                    article: mockArticleData,
                },
            }),
        );
    });

    it("should include headers in request", async () => {
        const customHeaders = { Authorization: "Bearer customtoken" };

        axios.mockResolvedValue({
            data: { article: { slug: "test" } },
        });

        await setArticle({
            headers: customHeaders,
            ...mockArticleData,
        });

        expect(axios).toHaveBeenCalledWith(
            expect.objectContaining({
                headers: customHeaders,
            }),
        );
    });

    it("should handle empty tagList", async () => {
        axios.mockResolvedValue({
            data: { article: { slug: "test" } },
        });

        await setArticle({
            headers: mockHeaders,
            title: "Title",
            description: "Desc",
            body: "Body",
            tagList: [],
        });

        expect(axios).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
                    article: {
                        title: "Title",
                        description: "Desc",
                        body: "Body",
                        tagList: [],
                    },
                },
            }),
        );
    });

    it("should return slug from response", async () => {
        const expectedSlug = "my-custom-slug";

        axios.mockResolvedValue({
            data: {
                article: {
                    ...mockArticleData,
                    slug: expectedSlug,
                },
            },
        });

        const result = await setArticle({
            headers: mockHeaders,
            ...mockArticleData,
        });

        expect(result).toBe(expectedSlug);
    });

    it("should handle article with many tags on update", async () => {
        const slug = "article-to-update";
        const manyTags = ["tag1", "tag2", "tag3", "tag4", "tag5"];

        axios.mockResolvedValue({
            data: { article: { slug: slug } },
        });

        await setArticle({
            headers: mockHeaders,
            slug: slug,
            title: "Title",
            description: "Desc",
            body: "Body",
            tagList: manyTags,
        });

        expect(axios).toHaveBeenCalledWith(
            expect.objectContaining({
                method: "PUT",
                data: {
                    article: {
                        title: "Title",
                        description: "Desc",
                        body: "Body",
                        tagList: manyTags,
                    },
                },
            }),
        );
    });
});
