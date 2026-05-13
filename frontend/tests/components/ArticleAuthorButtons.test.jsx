import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "@jest/globals";
import ArticleAuthorButtons from "../../src/components/ArticleAuthorButtons";

jest.mock("react-router-dom", () => ({
    Link: ({ to, children, ...props }) => (
        <a href={to} {...props}>
            {children}
        </a>
    ),
    useNavigate: jest.fn(),
}));

jest.mock("../../src/context/AuthContext", () => ({
    useAuth: jest.fn(),
}));

jest.mock("../../src/services/deleteArticle", () => jest.fn());

describe("ArticleAuthorButtons Component", () => {
    const mockArticleData = {
        slug: "how-to-train-your-dragon",
        title: "How to train your dragon",
        description: "Ever wonder how?",
        body: "It takes a Jacobian",
        tagList: ["dragons", "training"],
    };

    const mockNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        const { useNavigate } = require("react-router-dom");
        const { useAuth } = require("../../src/context/AuthContext");
        const deleteArticle = require("../../src/services/deleteArticle");

        useNavigate.mockReturnValue(mockNavigate);
        useAuth.mockReturnValue({
            headers: { Authorization: "Bearer token" },
            isAuth: true,
        });
        deleteArticle.mockResolvedValue({});

        window.confirm = jest.fn(() => true);
    });

    it("should render delete button", () => {
        render(<ArticleAuthorButtons {...mockArticleData} />);

        expect(screen.getByText(/Delete Article/)).toBeInTheDocument();
    });

    it("should render edit button", () => {
        render(<ArticleAuthorButtons {...mockArticleData} />);

        expect(screen.getByText(/Edit Article/)).toBeInTheDocument();
    });

    it("should call deleteArticle when delete button clicked", async () => {
        const deleteArticle = require("../../src/services/deleteArticle");

        render(<ArticleAuthorButtons {...mockArticleData} />);

        const deleteBtn = screen.getByText(/Delete Article/);
        fireEvent.click(deleteBtn);

        // Wait for async operations
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(deleteArticle).toHaveBeenCalledWith({
            headers: expect.any(Object),
            slug: "how-to-train-your-dragon",
        });
    });

    it("should navigate to home after delete", async () => {
        const deleteArticle = require("../../src/services/deleteArticle");
        deleteArticle.mockResolvedValue({});

        render(<ArticleAuthorButtons {...mockArticleData} />);

        const deleteBtn = screen.getByText(/Delete Article/);
        fireEvent.click(deleteBtn);

        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("should show confirm dialog before deleting", () => {
        render(<ArticleAuthorButtons {...mockArticleData} />);

        const deleteBtn = screen.getByText(/Delete Article/);
        fireEvent.click(deleteBtn);

        expect(window.confirm).toHaveBeenCalledWith(
            "Want to delete the article?",
        );
    });

    it("should not delete if user cancels confirm", async () => {
        const deleteArticle = require("../../src/services/deleteArticle");
        window.confirm = jest.fn(() => false);

        render(<ArticleAuthorButtons {...mockArticleData} />);

        const deleteBtn = screen.getByText(/Delete Article/);
        fireEvent.click(deleteBtn);

        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(deleteArticle).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should render edit link with correct href", () => {
        render(<ArticleAuthorButtons {...mockArticleData} />);

        const editLink = screen.getByText(/Edit Article/).closest("a");
        expect(editLink).toHaveAttribute(
            "href",
            "/editor/how-to-train-your-dragon",
        );
    });

    it("should pass article data to edit link", () => {
        const { container } = render(
            <ArticleAuthorButtons {...mockArticleData} />,
        );

        const editButton = container.querySelector("button:nth-child(2)");
        expect(editButton).toBeInTheDocument();
    });

    it("should have delete button with red color", () => {
        const { container } = render(
            <ArticleAuthorButtons {...mockArticleData} />,
        );

        const deleteBtn = container.querySelector("button:first-child");
        expect(deleteBtn).toHaveStyle({ color: "#d00" });
    });

    it("should have edit button with gray color", () => {
        const { container } = render(
            <ArticleAuthorButtons {...mockArticleData} />,
        );

        const editBtn = container.querySelector("button:nth-child(2)");
        expect(editBtn).toHaveStyle({ color: "#777" });
    });
});
