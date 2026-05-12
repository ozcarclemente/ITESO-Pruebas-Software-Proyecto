import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "@jest/globals";
import useArticles from "../../src/hooks/useArticles";

jest.mock("../../src/context/AuthContext", () => ({
    useAuth: jest.fn(),
}));

jest.mock("../../src/services/getArticles");

const { useAuth } = require("../../src/context/AuthContext");
const mockGetArticles = require("../../src/services/getArticles").default;

describe("useArticles Hook", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue({ headers: null });
        mockGetArticles.mockResolvedValue({
            articles: [],
            articlesCount: 0,
        });
    });

    describe("initial state", () => {
        it("should initialize with empty articles", () => {
            const { result } = renderHook(() =>
                useArticles({ location: "global" }),
            );

            expect(result.current.articles).toEqual([]);
        });

        it("should initialize with zero articles count", () => {
            const { result } = renderHook(() =>
                useArticles({ location: "global" }),
            );

            expect(result.current.articlesCount).toBe(0);
        });

        it("should initialize with loading true", () => {
            const { result } = renderHook(() =>
                useArticles({ location: "global" }),
            );

            expect(result.current.loading).toBe(true);
        });

        it("should initialize with setArticlesData function", () => {
            const { result } = renderHook(() =>
                useArticles({ location: "global" }),
            );

            expect(typeof result.current.setArticlesData).toBe("function");
        });
    });

    describe("getArticles call", () => {
        it("should call getArticles when rendering", async () => {
            mockGetArticles.mockResolvedValueOnce({
                articles: [],
                articlesCount: 0,
            });

            renderHook(() => useArticles({ location: "global" }));

            await waitFor(() => {
                expect(mockGetArticles).toHaveBeenCalled();
            });
        });

        it("should pass correct parameters to getArticles", async () => {
            mockGetArticles.mockResolvedValueOnce({
                articles: [],
                articlesCount: 0,
            });

            renderHook(() =>
                useArticles({
                    location: "global",
                    tabName: "global",
                    tagName: "",
                    username: undefined,
                }),
            );

            await waitFor(() => {
                expect(mockGetArticles).toHaveBeenCalledWith({
                    headers: null,
                    location: "global",
                    tabName: "global",
                    tagName: "",
                    username: undefined,
                });
            });
        });

        it("should not call getArticles for feed without headers", () => {
            renderHook(() => useArticles({ location: "feed", tabName: "feed" }));

            expect(mockGetArticles).not.toHaveBeenCalled();
        });

        it("should call getArticles for feed with headers", async () => {
            useAuth.mockReturnValue({ headers: "test-token" });
            mockGetArticles.mockResolvedValueOnce({
                articles: [],
                articlesCount: 0,
            });

            renderHook(() => useArticles({ location: "feed", tabName: "feed" }));

            await waitFor(() => {
                expect(mockGetArticles).toHaveBeenCalled();
            });
        });
    });

    describe("loading state", () => {
        it("should set loading to false after data is fetched", async () => {
            mockGetArticles.mockResolvedValueOnce({
                articles: [{ slug: "test" }],
                articlesCount: 1,
            });

            const { result } = renderHook(() =>
                useArticles({ location: "global" }),
            );

            expect(result.current.loading).toBe(true);

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });
        });

        it("should set loading to false on error", async () => {
            mockGetArticles.mockRejectedValueOnce(new Error("Fetch failed"));

            const { result } = renderHook(() =>
                useArticles({ location: "global" }),
            );

            expect(result.current.loading).toBe(true);

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });
        });
    });

    describe("articles data", () => {
        it("should update articles with fetched data", async () => {
            const mockArticles = [
                { slug: "article-1", title: "Article 1" },
                { slug: "article-2", title: "Article 2" },
            ];

            mockGetArticles.mockResolvedValueOnce({
                articles: mockArticles,
                articlesCount: 2,
            });

            const { result } = renderHook(() =>
                useArticles({ location: "global" }),
            );

            await waitFor(() => {
                expect(result.current.articles).toEqual(mockArticles);
            });
        });

        it("should update articlesCount with fetched data", async () => {
            mockGetArticles.mockResolvedValueOnce({
                articles: [{ slug: "article-1" }],
                articlesCount: 10,
            });

            const { result } = renderHook(() =>
                useArticles({ location: "global" }),
            );

            await waitFor(() => {
                expect(result.current.articlesCount).toBe(10);
            });
        });

        it("should have empty articles on error", async () => {
            mockGetArticles.mockRejectedValueOnce(new Error("Fetch failed"));

            const { result } = renderHook(() =>
                useArticles({ location: "global" }),
            );

            await waitFor(() => {
                expect(result.current.articles).toEqual([]);
            });
        });
    });

    describe("dependency changes", () => {
        it("should call getArticles with location parameter", async () => {
            renderHook(() => useArticles({ location: "profile" }));

            await waitFor(() => {
                expect(mockGetArticles).toHaveBeenCalledWith(
                    expect.objectContaining({ location: "profile" }),
                );
            });
        });

        it("should call getArticles with username parameter", async () => {
            renderHook(() =>
                useArticles({ location: "profile", username: "testuser" }),
            );

            await waitFor(() => {
                expect(mockGetArticles).toHaveBeenCalledWith(
                    expect.objectContaining({ username: "testuser" }),
                );
            });
        });
    });

    describe("setArticlesData", () => {
        it("should allow manual update of articles", async () => {
            mockGetArticles.mockResolvedValueOnce({
                articles: [],
                articlesCount: 0,
            });

            const { result } = renderHook(() =>
                useArticles({ location: "global" }),
            );

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            const newArticles = [{ slug: "new-article" }];
            result.current.setArticlesData({
                articles: newArticles,
                articlesCount: 1,
            });

            await waitFor(() => {
                expect(result.current.articles).toEqual(newArticles);
                expect(result.current.articlesCount).toBe(1);
            });
        });
    });

    describe("different locations", () => {
        it("should handle global location", async () => {
            mockGetArticles.mockResolvedValueOnce({
                articles: [],
                articlesCount: 0,
            });

            renderHook(() =>
                useArticles({ location: "global", tabName: "global" }),
            );

            await waitFor(() => {
                expect(mockGetArticles).toHaveBeenCalledWith(
                    expect.objectContaining({ location: "global" }),
                );
            });
        });

        it("should handle profile location with username", async () => {
            mockGetArticles.mockResolvedValueOnce({
                articles: [],
                articlesCount: 0,
            });

            renderHook(() =>
                useArticles({ location: "profile", username: "testuser" }),
            );

            await waitFor(() => {
                expect(mockGetArticles).toHaveBeenCalledWith(
                    expect.objectContaining({
                        location: "profile",
                        username: "testuser",
                    }),
                );
            });
        });

        it("should handle favorites location", async () => {
            mockGetArticles.mockResolvedValueOnce({
                articles: [],
                articlesCount: 0,
            });

            renderHook(() =>
                useArticles({ location: "favorites", username: "testuser" }),
            );

            await waitFor(() => {
                expect(mockGetArticles).toHaveBeenCalledWith(
                    expect.objectContaining({ location: "favorites" }),
                );
            });
        });
    });
});
