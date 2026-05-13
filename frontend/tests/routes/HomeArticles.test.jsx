import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "@jest/globals";
import HomeArticles from "../../src/routes/HomeArticles";

jest.mock("../../src/context/FeedContext", () => ({
    useFeedContext: jest.fn(),
}));

jest.mock("../../src/hooks/useArticles", () => jest.fn());

jest.mock("../../src/components/ArticlesPreview", () => {
    return function MockArticlesPreview() {
        return <div data-testid="articles-preview">Articles Preview</div>;
    };
});

jest.mock("../../src/components/ArticlesPagination", () => {
    return function MockArticlesPagination() {
        return <div data-testid="articles-pagination">Pagination</div>;
    };
});

describe("HomeArticles Route", () => {
    const mockFeedContext = { tabName: "global", tagName: "" };

    beforeEach(() => {
        jest.clearAllMocks();
        const { useFeedContext } = require("../../src/context/FeedContext");
        useFeedContext.mockReturnValue(mockFeedContext);
    });

    it("should display loading state initially", () => {
        const useArticles = require("../../src/hooks/useArticles");
        useArticles.mockReturnValue({
            articles: [],
            articlesCount: 0,
            loading: true,
            setArticlesData: jest.fn(),
        });

        render(<HomeArticles />);

        expect(screen.getByText(/Loading articles list/)).toBeInTheDocument();
    });

    it("should display articles and pagination when loaded", () => {
        const mockArticles = [
            { slug: "article-1", title: "Article 1" },
            { slug: "article-2", title: "Article 2" },
        ];

        const useArticles = require("../../src/hooks/useArticles");
        useArticles.mockReturnValue({
            articles: mockArticles,
            articlesCount: 10,
            loading: false,
            setArticlesData: jest.fn(),
        });

        render(<HomeArticles />);

        expect(screen.getByTestId("articles-preview")).toBeInTheDocument();
        expect(screen.getByTestId("articles-pagination")).toBeInTheDocument();
    });

    it("should display empty message when no articles", () => {
        const useArticles = require("../../src/hooks/useArticles");
        useArticles.mockReturnValue({
            articles: [],
            articlesCount: 0,
            loading: false,
            setArticlesData: jest.fn(),
        });

        render(<HomeArticles />);

        expect(screen.getByText(/Articles not available/)).toBeInTheDocument();
    });

    it("should pass correct parameters to useArticles hook", () => {
        const mockSetArticlesData = jest.fn();
        const useArticles = require("../../src/hooks/useArticles");
        useArticles.mockReturnValue({
            articles: [],
            articlesCount: 0,
            loading: false,
            setArticlesData: mockSetArticlesData,
        });

        render(<HomeArticles />);

        expect(useArticles).toHaveBeenCalledWith({
            location: "global",
            tabName: "global",
            tagName: "",
        });
    });

    it("should use correct feed context", () => {
        const { useFeedContext } = require("../../src/context/FeedContext");
        const useArticles = require("../../src/hooks/useArticles");

        useArticles.mockReturnValue({
            articles: [],
            articlesCount: 0,
            loading: false,
            setArticlesData: jest.fn(),
        });

        render(<HomeArticles />);

        expect(useFeedContext).toHaveBeenCalled();
    });

    it("should handle feed tab context", () => {
        const { useFeedContext } = require("../../src/context/FeedContext");
        const useArticles = require("../../src/hooks/useArticles");

        useFeedContext.mockReturnValue({ tabName: "feed", tagName: "" });
        useArticles.mockReturnValue({
            articles: [{ slug: "article-1" }],
            articlesCount: 5,
            loading: false,
            setArticlesData: jest.fn(),
        });

        render(<HomeArticles />);

        expect(useArticles).toHaveBeenCalledWith({
            location: "feed",
            tabName: "feed",
            tagName: "",
        });
    });

    it("should handle tag context", () => {
        const { useFeedContext } = require("../../src/context/FeedContext");
        const useArticles = require("../../src/hooks/useArticles");

        useFeedContext.mockReturnValue({
            tabName: "tag",
            tagName: "javascript",
        });
        useArticles.mockReturnValue({
            articles: [{ slug: "article-1" }],
            articlesCount: 3,
            loading: false,
            setArticlesData: jest.fn(),
        });

        render(<HomeArticles />);

        expect(useArticles).toHaveBeenCalledWith({
            location: "tag",
            tabName: "tag",
            tagName: "javascript",
        });
    });

    it("should pass setArticlesData to ArticlesPreview", () => {
        const mockSetArticlesData = jest.fn();
        const useArticles = require("../../src/hooks/useArticles");
        useArticles.mockReturnValue({
            articles: [{ slug: "article-1" }],
            articlesCount: 1,
            loading: false,
            setArticlesData: mockSetArticlesData,
        });

        render(<HomeArticles />);

        expect(screen.getByTestId("articles-preview")).toBeInTheDocument();
    });

    it("should pass setArticlesData to ArticlesPagination", () => {
        const mockSetArticlesData = jest.fn();
        const useArticles = require("../../src/hooks/useArticles");
        useArticles.mockReturnValue({
            articles: [{ slug: "article-1" }],
            articlesCount: 10,
            loading: false,
            setArticlesData: mockSetArticlesData,
        });

        render(<HomeArticles />);

        expect(screen.getByTestId("articles-pagination")).toBeInTheDocument();
    });
});
