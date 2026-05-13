import { describe, it, expect, beforeEach } from "@jest/globals";
import axios from "axios";
import getArticles from "../../src/services/getArticles";

jest.mock("axios");
jest.mock("../../src/helpers/errorHandler", () => ({
    default: jest.fn(),
}));

describe("getArticles Service", () => {
    const mockHeaders = { Authorization: "Bearer token" };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should fetch global articles with default pagination", async () => {
        const mockData = {
            articles: [{ id: 1, title: "Article 1" }],
            articlesCount: 1,
        };

        axios.mockResolvedValue({ data: mockData });

        const result = await getArticles({
            headers: mockHeaders,
            location: "global",
        });

        expect(result).toEqual(mockData);
        expect(axios).toHaveBeenCalledWith({
            url: "api/articles?limit=3&&offset=0",
            headers: mockHeaders,
        });
    });

    it("should fetch feed articles with pagination", async () => {
        const mockData = {
            articles: [{ id: 1, title: "Fed Article" }],
            articlesCount: 10,
        };

        axios.mockResolvedValue({ data: mockData });

        const result = await getArticles({
            headers: mockHeaders,
            location: "feed",
            page: 1,
            limit: 5,
        });

        expect(result).toEqual(mockData);
        expect(axios).toHaveBeenCalledWith({
            url: "api/articles/feed?limit=5&&offset=1",
            headers: mockHeaders,
        });
    });

    it("should fetch articles filtered by tag", async () => {
        const mockData = {
            articles: [{ id: 1, title: "JS Article", tagList: ["javascript"] }],
            articlesCount: 5,
        };

        axios.mockResolvedValue({ data: mockData });

        const result = await getArticles({
            headers: mockHeaders,
            location: "tag",
            tagName: "javascript",
            page: 0,
        });

        expect(result).toEqual(mockData);
        expect(axios).toHaveBeenCalledWith({
            url: "api/articles?tag=javascript&&limit=3&&offset=0",
            headers: mockHeaders,
        });
    });

    it("should fetch articles filtered by author", async () => {
        const mockData = {
            articles: [
                {
                    id: 1,
                    title: "Author Article",
                    author: { username: "jake" },
                },
            ],
            articlesCount: 3,
        };

        axios.mockResolvedValue({ data: mockData });

        const result = await getArticles({
            headers: mockHeaders,
            location: "profile",
            username: "jake",
        });

        expect(result).toEqual(mockData);
        expect(axios).toHaveBeenCalledWith({
            url: "api/articles?author=jake&&limit=3&&offset=0",
            headers: mockHeaders,
        });
    });

    it("should fetch user favorites", async () => {
        const mockData = {
            articles: [{ id: 1, title: "Favorited Article", favorited: true }],
            articlesCount: 2,
        };

        axios.mockResolvedValue({ data: mockData });

        const result = await getArticles({
            headers: mockHeaders,
            location: "favorites",
            username: "jake",
            page: 0,
        });

        expect(result).toEqual(mockData);
        expect(axios).toHaveBeenCalledWith({
            url: "api/articles?favorited=jake&&limit=3&&offset=0",
            headers: mockHeaders,
        });
    });

    it("should handle pagination offset correctly", async () => {
        axios.mockResolvedValue({
            data: { articles: [], articlesCount: 0 },
        });

        await getArticles({
            headers: mockHeaders,
            location: "global",
            page: 2,
            limit: 5,
        });

        expect(axios).toHaveBeenCalledWith({
            url: "api/articles?limit=5&&offset=2",
            headers: mockHeaders,
        });
    });

    it("should fetch articles with custom limit", async () => {
        axios.mockResolvedValue({
            data: { articles: [], articlesCount: 0 },
        });

        await getArticles({
            headers: mockHeaders,
            location: "global",
            limit: 10,
        });

        expect(axios).toHaveBeenCalledWith({
            url: "api/articles?limit=10&&offset=0",
            headers: mockHeaders,
        });
    });

    it("should include tag name in URL", async () => {
        axios.mockResolvedValue({
            data: { articles: [], articlesCount: 0 },
        });

        await getArticles({
            headers: mockHeaders,
            location: "tag",
            tagName: "react",
            page: 0,
            limit: 3,
        });

        expect(axios).toHaveBeenCalledWith({
            url: "api/articles?tag=react&&limit=3&&offset=0",
            headers: mockHeaders,
        });
    });

    it("should handle multiple pagination parameters for feed", async () => {
        axios.mockResolvedValue({
            data: { articles: [], articlesCount: 0 },
        });

        await getArticles({
            headers: mockHeaders,
            location: "feed",
            page: 3,
            limit: 10,
        });

        // offset should equal page number when passed directly
        expect(axios).toHaveBeenCalledWith({
            url: "api/articles/feed?limit=10&&offset=3",
            headers: mockHeaders,
        });
    });
});
