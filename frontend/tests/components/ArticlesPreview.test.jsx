import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "@jest/globals";
import ArticlesPreview from "../../src/components/ArticlesPreview";

jest.mock("react-router-dom", () => ({
    Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}));

jest.mock("../../src/components/ArticleMeta", () => {
    return function MockArticleMeta({ children }) {
        return <div data-testid="article-meta">{children}</div>;
    };
});

jest.mock("../../src/components/ArticleTags", () => {
    return function MockArticleTags({ tagList }) {
        return <ul data-testid="article-tags">{tagList?.map(tag => <li key={tag}>{tag}</li>)}</ul>;
    };
});

jest.mock("../../src/components/FavButton", () => {
    return function MockFavButton({ handler, slug }) {
        return <button data-testid="fav-button" onClick={() => handler({ slug })}>Fav</button>;
    };
});

describe("ArticlesPreview Component", () => {
    const mockArticles = [
        {
            slug: "article-1",
            title: "Article 1",
            description: "Desc 1",
            author: { username: "user1" },
            createdAt: "2026-05-11",
            favorited: false,
            favoritesCount: 0,
            tagList: ["react"],
        },
        {
            slug: "article-2",
            title: "Article 2",
            description: "Desc 2",
            author: { username: "user2" },
            createdAt: "2026-05-10",
            favorited: true,
            favoritesCount: 5,
            tagList: ["javascript", "testing"],
        },
    ];

    const mockUpdateArticles = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render all articles", () => {
        render(
            <ArticlesPreview
                articles={mockArticles}
                loading={false}
                updateArticles={mockUpdateArticles}
            />
        );

        expect(screen.getByText("Article 1")).toBeInTheDocument();
        expect(screen.getByText("Article 2")).toBeInTheDocument();
    });

    it("should render article descriptions", () => {
        render(
            <ArticlesPreview
                articles={mockArticles}
                loading={false}
                updateArticles={mockUpdateArticles}
            />
        );

        expect(screen.getByText("Desc 1")).toBeInTheDocument();
        expect(screen.getByText("Desc 2")).toBeInTheDocument();
    });

    it("should render preview containers for each article", () => {
        const { container } = render(
            <ArticlesPreview
                articles={mockArticles}
                loading={false}
                updateArticles={mockUpdateArticles}
            />
        );

        const previews = container.querySelectorAll(".article-preview");
        expect(previews).toHaveLength(2);
    });

    it("should show loading state", () => {
        render(
            <ArticlesPreview
                articles={[]}
                loading={true}
                updateArticles={mockUpdateArticles}
            />
        );

        expect(screen.getByText(/Loading article/)).toBeInTheDocument();
    });

    it("should show empty state when no articles", () => {
        render(
            <ArticlesPreview
                articles={[]}
                loading={false}
                updateArticles={mockUpdateArticles}
            />
        );

        expect(screen.getByText(/No articles available/)).toBeInTheDocument();
    });

    it("should render correct number of article links", () => {
        render(
            <ArticlesPreview
                articles={mockArticles}
                loading={false}
                updateArticles={mockUpdateArticles}
            />
        );

        const links = screen.getAllByRole("link");
        expect(links.length).toBeGreaterThanOrEqual(2);
    });

    it("should have correct href for article link", () => {
        render(
            <ArticlesPreview
                articles={mockArticles}
                loading={false}
                updateArticles={mockUpdateArticles}
            />
        );

        const link = screen.getAllByRole("link")[0];
        expect(link.href).toContain("/article/article-1");
    });

    it("should render article tags", () => {
        render(
            <ArticlesPreview
                articles={mockArticles}
                loading={false}
                updateArticles={mockUpdateArticles}
            />
        );

        const tagElements = screen.getAllByTestId("article-tags");
        expect(tagElements.length).toBeGreaterThanOrEqual(2);
    });

    it("should render favorite buttons", () => {
        render(
            <ArticlesPreview
                articles={mockArticles}
                loading={false}
                updateArticles={mockUpdateArticles}
            />
        );

        const favButtons = screen.getAllByTestId("fav-button");
        expect(favButtons).toHaveLength(2);
    });

    it("should show 'Read more' link text", () => {
        render(
            <ArticlesPreview
                articles={mockArticles}
                loading={false}
                updateArticles={mockUpdateArticles}
            />
        );

        const readMoreElements = screen.getAllByText("Read more...");
        expect(readMoreElements.length).toBeGreaterThanOrEqual(2);
    });

    it("should call updateArticles with correct data when favorite button is clicked", () => {
        render(
            <ArticlesPreview
                articles={mockArticles}
                loading={false}
                updateArticles={mockUpdateArticles}
            />
        );

        const favButtons = screen.getAllByTestId("fav-button");
        favButtons[0].click();

        expect(mockUpdateArticles).toHaveBeenCalled();
        const updateCall = mockUpdateArticles.mock.calls[0][0];
        const result = updateCall({ articles: mockArticles });
        expect(result.articles[0].slug).toBe("article-1");
    });

    it("should pass article state to Link component", () => {
        const { container } = render(
            <ArticlesPreview
                articles={mockArticles}
                loading={false}
                updateArticles={mockUpdateArticles}
            />
        );

        const links = container.querySelectorAll("a.preview-link");
        expect(links).toHaveLength(2);
        expect(links[0]).toHaveAttribute("href", "/article/article-1");
    });

    it("should pass correct author and createdAt to ArticleMeta", () => {
        render(
            <ArticlesPreview
                articles={mockArticles}
                loading={false}
                updateArticles={mockUpdateArticles}
            />
        );

        const metaElements = screen.getAllByTestId("article-meta");
        expect(metaElements).toHaveLength(2);
    });

    it("should handle articles with empty tagList", () => {
        const articlesWithoutTags = [
            {
                slug: "article-no-tags",
                title: "No Tags Article",
                description: "Article without tags",
                author: { username: "user3" },
                createdAt: "2026-05-09",
                favorited: false,
                favoritesCount: 0,
                tagList: [],
            },
        ];

        render(
            <ArticlesPreview
                articles={articlesWithoutTags}
                loading={false}
                updateArticles={mockUpdateArticles}
            />
        );

        expect(screen.getByText("No Tags Article")).toBeInTheDocument();
        const tagElements = screen.queryAllByTestId("article-tags");
        expect(tagElements.length).toBeGreaterThanOrEqual(1);
    });

    it("should handle undefined articles prop", () => {
        render(
            <ArticlesPreview
                articles={undefined}
                loading={false}
                updateArticles={mockUpdateArticles}
            />
        );

        expect(screen.getByText(/No articles available/)).toBeInTheDocument();
    });

    it("should maintain correct article order", () => {
        render(
            <ArticlesPreview
                articles={mockArticles}
                loading={false}
                updateArticles={mockUpdateArticles}
            />
        );

        const links = screen.getAllByRole("link");
        expect(links[0].href).toContain("/article/article-1");
        expect(links[1].href).toContain("/article/article-2");
    });

    it("should pass correct props to FavButton handler", () => {
        render(
            <ArticlesPreview
                articles={mockArticles}
                loading={false}
                updateArticles={mockUpdateArticles}
            />
        );

        const favButtons = screen.getAllByTestId("fav-button");
        favButtons[1].click();

        expect(mockUpdateArticles).toHaveBeenCalled();
    });
});
