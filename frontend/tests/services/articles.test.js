import axios from "axios";

jest.mock("axios");
jest.mock("../../src/helpers/errorHandler", () => jest.fn());

import getArticles from "../../src/services/getArticles";
import getArticle from "../../src/services/getArticle";
import setArticle from "../../src/services/setArticle";
import deleteArticle from "../../src/services/deleteArticle";
import errorHandler from "../../src/helpers/errorHandler";

describe("Articles Services", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getArticles", () => {
        it("should fetch articles from global feed", async () => {
            const mockArticles = [
                { slug: "article-1", title: "First Article", body: "Content 1" },
                { slug: "article-2", title: "Second Article", body: "Content 2" },
            ];

            axios.mockResolvedValueOnce({
                data: { articles: mockArticles, articlesCount: 2 },
            });

            const result = await getArticles({
                location: "global",
                limit: 3,
                page: 0,
            });

            expect(axios).toHaveBeenCalledWith({
                url: "api/articles?limit=3&&offset=0",
                headers: undefined,
            });
            expect(result).toEqual({
                articles: mockArticles,
                articlesCount: 2,
            });
        });

        it("should fetch user feed articles", async () => {
            const headers = { Authorization: "Token test123" };

            axios.mockResolvedValueOnce({
                data: { articles: [], articlesCount: 0 },
            });

            await getArticles({
                headers,
                location: "feed",
                limit: 5,
                page: 1,
            });

            expect(axios).toHaveBeenCalledWith({
                url: "api/articles/feed?limit=5&&offset=1",
                headers,
            });
        });

        it("should fetch articles by author (profile)", async () => {
            axios.mockResolvedValueOnce({
                data: { articles: [], articlesCount: 0 },
            });

            await getArticles({
                location: "profile",
                username: "john-doe",
                limit: 10,
                page: 0,
            });

            expect(axios).toHaveBeenCalledWith({
                url: "api/articles?author=john-doe&&limit=10&&offset=0",
                headers: undefined,
            });
        });

        it("should fetch favorited articles by user", async () => {
            axios.mockResolvedValueOnce({
                data: { articles: [], articlesCount: 0 },
            });

            await getArticles({
                location: "favorites",
                username: "jane-smith",
                limit: 3,
                page: 0,
            });

            expect(axios).toHaveBeenCalledWith({
                url: "api/articles?favorited=jane-smith&&limit=3&&offset=0",
                headers: undefined,
            });
        });

        it("should fetch articles by tag", async () => {
            axios.mockResolvedValueOnce({
                data: { articles: [], articlesCount: 0 },
            });

            await getArticles({
                location: "tag",
                tagName: "javascript",
                limit: 3,
                page: 2,
            });

            expect(axios).toHaveBeenCalledWith({
                url: "api/articles?tag=javascript&&limit=3&&offset=2",
                headers: undefined,
            });
        });

        it("should handle getArticles error", async () => {
            const error = new Error("Network error");
            axios.mockRejectedValueOnce(error);

            await getArticles({
                location: "global",
            });

            expect(errorHandler).toHaveBeenCalledWith(error);
        });

        it("should use default pagination values", async () => {
            axios.mockResolvedValueOnce({
                data: { articles: [], articlesCount: 0 },
            });

            await getArticles({
                location: "global",
            });

            expect(axios).toHaveBeenCalledWith({
                url: "api/articles?limit=3&&offset=0",
                headers: undefined,
            });
        });
    });

    describe("getArticle", () => {
        it("should fetch single article by slug", async () => {
            const mockArticle = {
                slug: "how-to-train-dragons",
                title: "How to Train Dragons",
                body: "Lorem ipsum dolor sit amet.",
                author: { username: "jake-jake" },
            };

            axios.mockResolvedValueOnce({
                data: { article: mockArticle },
            });

            const result = await getArticle({
                slug: "how-to-train-dragons",
            });

            expect(axios).toHaveBeenCalledWith({
                headers: undefined,
                url: "api/articles/how-to-train-dragons",
            });
            expect(result).toEqual(mockArticle);
        });

        it("should include headers in request", async () => {
            const headers = { Authorization: "Token test123" };

            axios.mockResolvedValueOnce({
                data: { article: {} },
            });

            await getArticle({
                headers,
                slug: "test-article",
            });

            expect(axios).toHaveBeenCalledWith({
                headers,
                url: "api/articles/test-article",
            });
        });

        it("should handle getArticle error", async () => {
            const error = new Error("Article not found");
            axios.mockRejectedValueOnce(error);

            await getArticle({
                slug: "nonexistent-article",
            });

            expect(errorHandler).toHaveBeenCalledWith(error);
        });

        it("should return only article property from response", async () => {
            const fullResponse = {
                article: { slug: "test", title: "Test" },
                profile: { username: "user" },
            };

            axios.mockResolvedValueOnce({
                data: fullResponse,
            });

            const result = await getArticle({
                slug: "test",
            });

            expect(result).toEqual(fullResponse.article);
            expect(result.profile).toBeUndefined();
        });
    });

    describe("setArticle", () => {
        it("should create new article with POST", async () => {
            const headers = { Authorization: "Token test123" };
            const mockSlug = "new-article-slug";

            axios.mockResolvedValueOnce({
                data: {
                    article: {
                        slug: mockSlug,
                        title: "New Article",
                        body: "Content",
                    },
                },
            });

            const result = await setArticle({
                body: "Content",
                description: "A new article",
                headers,
                title: "New Article",
                tagList: ["tech", "tutorial"],
            });

            expect(axios).toHaveBeenCalledWith({
                data: {
                    article: {
                        title: "New Article",
                        description: "A new article",
                        body: "Content",
                        tagList: ["tech", "tutorial"],
                    },
                },
                headers,
                method: "POST",
                url: "api/articles",
            });
            expect(result).toBe(mockSlug);
        });

        it("should update article with PUT when slug provided", async () => {
            const headers = { Authorization: "Token test123" };
            const slug = "existing-article";

            axios.mockResolvedValueOnce({
                data: {
                    article: {
                        slug,
                        title: "Updated Title",
                        body: "Updated content",
                    },
                },
            });

            const result = await setArticle({
                body: "Updated content",
                description: "Updated description",
                headers,
                slug,
                title: "Updated Title",
                tagList: ["updated"],
            });

            expect(axios).toHaveBeenCalledWith({
                data: {
                    article: {
                        title: "Updated Title",
                        description: "Updated description",
                        body: "Updated content",
                        tagList: ["updated"],
                    },
                },
                headers,
                method: "PUT",
                url: "api/articles/existing-article",
            });
            expect(result).toBe(slug);
        });

        it("should return article slug from response", async () => {
            const returnedSlug = "article-slug-123";

            axios.mockResolvedValueOnce({
                data: {
                    article: {
                        slug: returnedSlug,
                        title: "Test",
                    },
                },
            });

            const result = await setArticle({
                body: "Test",
                description: "Test",
                headers: {},
                title: "Test",
                tagList: [],
            });

            expect(result).toBe(returnedSlug);
        });

        it("should handle setArticle error", async () => {
            const error = new Error("Validation failed");
            axios.mockRejectedValueOnce(error);

            await setArticle({
                body: "",
                description: "",
                headers: {},
                title: "",
                tagList: [],
            });

            expect(errorHandler).toHaveBeenCalledWith(error);
        });

        it("should support empty tagList", async () => {
            axios.mockResolvedValueOnce({
                data: { article: { slug: "test" } },
            });

            await setArticle({
                body: "Content",
                description: "Desc",
                headers: {},
                title: "Title",
                tagList: [],
            });

            expect(axios).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: {
                        article: expect.objectContaining({
                            tagList: [],
                        }),
                    },
                }),
            );
        });
    });

    describe("deleteArticle", () => {
        it("should delete article with DELETE method", async () => {
            const headers = { Authorization: "Token test123" };

            axios.mockResolvedValueOnce({
                data: { message: "Article deleted" },
            });

            const result = await deleteArticle({
                slug: "article-to-delete",
                headers,
            });

            expect(axios).toHaveBeenCalledWith({
                headers,
                method: "DELETE",
                url: "api/articles/article-to-delete/",
            });
            expect(result).toEqual({ message: "Article deleted" });
        });

        it("should handle deleteArticle error", async () => {
            const error = new Error("Article not found");
            axios.mockRejectedValueOnce(error);

            await deleteArticle({
                slug: "nonexistent",
                headers: { Authorization: "Token test" },
            });

            expect(errorHandler).toHaveBeenCalledWith(error);
        });

        it("should use correct DELETE URL format with trailing slash", async () => {
            axios.mockResolvedValueOnce({
                data: {},
            });

            await deleteArticle({
                slug: "my-article-slug",
                headers: {},
            });

            expect(axios).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: "api/articles/my-article-slug/",
                }),
            );
        });

        it("should pass headers from parameters", async () => {
            const headers = {
                Authorization: "Token abc123",
                "Content-Type": "application/json",
            };

            axios.mockResolvedValueOnce({
                data: {},
            });

            await deleteArticle({
                slug: "test",
                headers,
            });

            expect(axios).toHaveBeenCalledWith(
                expect.objectContaining({
                    headers,
                }),
            );
        });
    });
});
