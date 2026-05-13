import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "@jest/globals";
import ProfileFavArticles from "../../src/routes/Profile/ProfileFavArticles";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: () => ({
        username: "testuser",
    }),
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

describe("ProfileFavArticles Route", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("loading state", () => {
        it("should display loading state initially", () => {
            const useArticles = require("../../src/hooks/useArticles");
            useArticles.mockReturnValue({
                articles: [],
                articlesCount: 0,
                loading: true,
                setArticlesData: jest.fn(),
            });

            render(<ProfileFavArticles />);

            expect(
                screen.getByText(/Loading testuser favorites articles.../),
            ).toBeInTheDocument();
        });

        it("should show loading message with correct username", () => {
            const useArticles = require("../../src/hooks/useArticles");
            useArticles.mockReturnValue({
                articles: [],
                articlesCount: 0,
                loading: true,
                setArticlesData: jest.fn(),
            });

            render(<ProfileFavArticles />);

            expect(screen.getByText(/testuser/)).toBeInTheDocument();
        });
    });

    describe("articles display", () => {
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

            render(<ProfileFavArticles />);

            expect(screen.getByTestId("articles-preview")).toBeInTheDocument();
            expect(
                screen.getByTestId("articles-pagination"),
            ).toBeInTheDocument();
        });

        it("should display both ArticlesPreview and ArticlesPagination", () => {
            const useArticles = require("../../src/hooks/useArticles");
            useArticles.mockReturnValue({
                articles: [{ slug: "article-1" }],
                articlesCount: 5,
                loading: false,
                setArticlesData: jest.fn(),
            });

            render(<ProfileFavArticles />);

            expect(screen.getByTestId("articles-preview")).toBeInTheDocument();
            expect(
                screen.getByTestId("articles-pagination"),
            ).toBeInTheDocument();
        });
    });

    describe("empty state", () => {
        it("should display empty message when user has no favorites", () => {
            const useArticles = require("../../src/hooks/useArticles");
            useArticles.mockReturnValue({
                articles: [],
                articlesCount: 0,
                loading: false,
                setArticlesData: jest.fn(),
            });

            render(<ProfileFavArticles />);

            expect(
                screen.getByText("testuser doesn't have favorites."),
            ).toBeInTheDocument();
        });

        it("should not render ArticlesPreview when empty", () => {
            const useArticles = require("../../src/hooks/useArticles");
            useArticles.mockReturnValue({
                articles: [],
                articlesCount: 0,
                loading: false,
                setArticlesData: jest.fn(),
            });

            render(<ProfileFavArticles />);

            expect(
                screen.queryByTestId("articles-preview"),
            ).not.toBeInTheDocument();
        });

        it("should not render ArticlesPagination when empty", () => {
            const useArticles = require("../../src/hooks/useArticles");
            useArticles.mockReturnValue({
                articles: [],
                articlesCount: 0,
                loading: false,
                setArticlesData: jest.fn(),
            });

            render(<ProfileFavArticles />);

            expect(
                screen.queryByTestId("articles-pagination"),
            ).not.toBeInTheDocument();
        });
    });

    describe("hook integration", () => {
        it("should pass correct parameters to useArticles hook", () => {
            const useArticles = require("../../src/hooks/useArticles");
            useArticles.mockReturnValue({
                articles: [],
                articlesCount: 0,
                loading: false,
                setArticlesData: jest.fn(),
            });

            render(<ProfileFavArticles />);

            expect(useArticles).toHaveBeenCalledWith({
                location: "favorites",
                username: "testuser",
            });
        });

        it("should call useArticles with favorites location", () => {
            const useArticles = require("../../src/hooks/useArticles");
            useArticles.mockReturnValue({
                articles: [],
                articlesCount: 0,
                loading: false,
                setArticlesData: jest.fn(),
            });

            render(<ProfileFavArticles />);

            expect(useArticles).toHaveBeenCalledWith(
                expect.objectContaining({
                    location: "favorites",
                }),
            );
        });

        it("should call useArticles with username from params", () => {
            const useArticles = require("../../src/hooks/useArticles");
            useArticles.mockReturnValue({
                articles: [],
                articlesCount: 0,
                loading: false,
                setArticlesData: jest.fn(),
            });

            render(<ProfileFavArticles />);

            expect(useArticles).toHaveBeenCalledWith(
                expect.objectContaining({
                    username: "testuser",
                }),
            );
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

            render(<ProfileFavArticles />);

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

            render(<ProfileFavArticles />);

            expect(
                screen.getByTestId("articles-pagination"),
            ).toBeInTheDocument();
        });
    });

    describe("component styling", () => {
        it("should use article-preview class", () => {
            const useArticles = require("../../src/hooks/useArticles");
            useArticles.mockReturnValue({
                articles: [],
                articlesCount: 0,
                loading: true,
                setArticlesData: jest.fn(),
            });

            const { container } = render(<ProfileFavArticles />);

            expect(
                container.querySelector(".article-preview"),
            ).toBeInTheDocument();
        });
    });
});
