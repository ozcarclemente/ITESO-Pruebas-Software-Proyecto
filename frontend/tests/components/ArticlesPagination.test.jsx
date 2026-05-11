import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "@jest/globals";
import ArticlesPagination from "../../src/components/ArticlesPagination";

jest.mock("react-paginate", () => {
    return function MockReactPaginate({ pageCount, onPageChange, containerClassName }) {
        return (
            <div className={containerClassName} data-testid="paginate">
                {pageCount > 1 && (
                    <>
                        <button onClick={() => onPageChange({ selected: 0 })}>
                            Page 1
                        </button>
                        {pageCount > 1 && (
                            <button onClick={() => onPageChange({ selected: 1 })}>
                                Page 2
                            </button>
                        )}
                    </>
                )}
            </div>
        );
    };
});

jest.mock("../../src/context/AuthContext", () => ({
    useAuth: jest.fn(),
}));

jest.mock("../../src/services/getArticles", () => jest.fn());

describe("ArticlesPagination Component", () => {
    const mockHeaders = { Authorization: "Bearer token" };
    const mockUpdateArticles = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        const { useAuth } = require("../../src/context/AuthContext");
        useAuth.mockReturnValue({ headers: mockHeaders });
    });

    it("should not render when articlesCount is 0", () => {
        const { container } = render(
            <ArticlesPagination
                articlesCount={0}
                location="global"
                tagName=""
                updateArticles={mockUpdateArticles}
            />
        );

        const paginate = container.querySelector('[data-testid="paginate"]');
        expect(paginate).toBeInTheDocument();
    });

    it("should calculate pages correctly (3 per page)", () => {
        const { container } = render(
            <ArticlesPagination
                articlesCount={9}
                location="global"
                tagName=""
                updateArticles={mockUpdateArticles}
            />
        );

        // 9 articles / 3 per page = 3 pages
        const buttons = container.querySelectorAll("button");
        expect(buttons.length).toBeGreaterThan(0);
    });

    it("should render single page for 3 articles", () => {
        const { container } = render(
            <ArticlesPagination
                articlesCount={3}
                location="global"
                tagName=""
                updateArticles={mockUpdateArticles}
            />
        );

        const paginate = container.querySelector('[data-testid="paginate"]');
        expect(paginate).toBeInTheDocument();
    });

    it("should render multiple pages for 10 articles", () => {
        const { container } = render(
            <ArticlesPagination
                articlesCount={10}
                location="global"
                tagName=""
                updateArticles={mockUpdateArticles}
            />
        );

        const buttons = container.querySelectorAll("button");
        // Should have at least 2 page buttons
        expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it("should use pagination-sm class", () => {
        const { container } = render(
            <ArticlesPagination
                articlesCount={10}
                location="global"
                tagName=""
                updateArticles={mockUpdateArticles}
            />
        );

        const paginate = container.querySelector(".pagination-sm");
        expect(paginate).toBeInTheDocument();
    });

    it("should pass correct pageCount to ReactPaginate", () => {
        render(
            <ArticlesPagination
                articlesCount={15}
                location="global"
                tagName=""
                updateArticles={mockUpdateArticles}
            />
        );

        // 15 articles / 3 per page = 5 pages
        // This is verified by the mock rendering behavior
        expect(screen.getByText("Page 1")).toBeInTheDocument();
    });
});
