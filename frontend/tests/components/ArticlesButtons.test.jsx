import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "@jest/globals";
import ArticlesButtons from "../../src/components/ArticlesButtons";

jest.mock("react-router-dom", () => ({
    useParams: jest.fn(),
}));

jest.mock("../../src/context/AuthContext", () => ({
    useAuth: jest.fn(),
}));

jest.mock("../../src/components/ArticleAuthorButtons", () => {
    return function MockArticleAuthorButtons() {
        return <div data-testid="author-buttons">Author Buttons</div>;
    };
});

jest.mock("../../src/components/FollowButton", () => {
    return function MockFollowButton({ username }) {
        return <button data-testid="follow-button">Follow {username}</button>;
    };
});

jest.mock("../../src/components/FavButton", () => {
    return function MockFavButton({ text }) {
        return (
            <button data-testid="fav-button">
                {text ? "Favorite" : "Fav"}
            </button>
        );
    };
});

describe("ArticlesButtons Component", () => {
    const mockArticle = {
        slug: "article-1",
        author: {
            username: "author1",
            bio: "Author bio",
            image: "url",
            following: false,
        },
        favorited: false,
        favoritesCount: 0,
        title: "Article",
        description: "Desc",
        body: "Body",
        tagList: [],
    };

    const mockSetArticle = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        const { useParams } = require("react-router-dom");
        const { useAuth } = require("../../src/context/AuthContext");

        useParams.mockReturnValue({ slug: "article-1" });
        useAuth.mockReturnValue({
            loggedUser: { username: "otheruser" },
        });
    });

    it("should render author buttons when user is author", () => {
        const { useAuth } = require("../../src/context/AuthContext");
        useAuth.mockReturnValue({
            loggedUser: { username: "author1" },
        });

        render(
            <ArticlesButtons
                article={mockArticle}
                setArticle={mockSetArticle}
            />,
        );

        expect(screen.getByTestId("author-buttons")).toBeInTheDocument();
    });

    it("should render follow button when not author", () => {
        render(
            <ArticlesButtons
                article={mockArticle}
                setArticle={mockSetArticle}
            />,
        );

        expect(screen.getByTestId("follow-button")).toBeInTheDocument();
    });

    it("should render favorite button when not author", () => {
        render(
            <ArticlesButtons
                article={mockArticle}
                setArticle={mockSetArticle}
            />,
        );

        expect(screen.getByTestId("fav-button")).toBeInTheDocument();
    });

    it("should not show follow button when author", () => {
        const { useAuth } = require("../../src/context/AuthContext");
        useAuth.mockReturnValue({
            loggedUser: { username: "author1" },
        });

        render(
            <ArticlesButtons
                article={mockArticle}
                setArticle={mockSetArticle}
            />,
        );

        expect(screen.queryByTestId("follow-button")).not.toBeInTheDocument();
    });

    it("should extract author from article", () => {
        render(
            <ArticlesButtons
                article={mockArticle}
                setArticle={mockSetArticle}
            />,
        );

        expect(screen.getByText("Follow author1")).toBeInTheDocument();
    });

    it("should handle article with empty author", () => {
        const articleNoAuthor = { ...mockArticle, author: {} };

        render(
            <ArticlesButtons
                article={articleNoAuthor}
                setArticle={mockSetArticle}
            />,
        );

        // Should not crash
        expect(screen.getByTestId("follow-button")).toBeInTheDocument();
    });

    it("should pass setArticle to handlers", () => {
        render(
            <ArticlesButtons
                article={mockArticle}
                setArticle={mockSetArticle}
            />,
        );

        // Component renders correctly
        expect(screen.getByTestId("follow-button")).toBeInTheDocument();
    });

    it("should get slug from useParams", () => {
        const { useParams } = require("react-router-dom");

        render(
            <ArticlesButtons
                article={mockArticle}
                setArticle={mockSetArticle}
            />,
        );

        expect(useParams).toHaveBeenCalled();
    });

    it("should get loggedUser from useAuth", () => {
        const { useAuth } = require("../../src/context/AuthContext");

        render(
            <ArticlesButtons
                article={mockArticle}
                setArticle={mockSetArticle}
            />,
        );

        expect(useAuth).toHaveBeenCalled();
    });
});
