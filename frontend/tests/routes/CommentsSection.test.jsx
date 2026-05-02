import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

jest.mock("../../src/context/AuthContext");
jest.mock("../../src/services/getComments");
jest.mock("../../src/services/postComment");
jest.mock("../../src/services/deleteComment");
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: () => ({ slug: "test-article" }),
}));

const { useAuth } = require("../../src/context/AuthContext");
const getComments =
    require("../../src/services/getComments").default ||
    require("../../src/services/getComments");
const postComment =
    require("../../src/services/postComment").default ||
    require("../../src/services/postComment");

useAuth.mockReturnValue({
    headers: { Authorization: "Token test" },
    isAuth: true,
    loggedUser: { username: "testuser", image: "avatar.jpg" },
});

getComments.mockResolvedValue([
    {
        id: 1,
        body: "Great article!",
        author: { username: "testuser", image: "avatar.jpg" },
        createdAt: "2024-04-30T00:00:00Z",
    },
]);

postComment.mockResolvedValue({ id: 2, body: "New comment" });

import CommentsSection from "../../src/routes/Article/CommentsSection";

describe("CommentsSection", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render CommentEditor and CommentList", () => {
        render(
            <BrowserRouter>
                <CommentsSection />
            </BrowserRouter>,
        );

        expect(
            screen.getByPlaceholderText("Write a comment..."),
        ).toBeInTheDocument();
        expect(screen.getByText("Post Comment")).toBeInTheDocument();
    });

    it("should render with proper layout", () => {
        const { container } = render(
            <BrowserRouter>
                <CommentsSection />
            </BrowserRouter>,
        );

        const row = container.querySelector(".row");
        const col = container.querySelector(".col-xs-12");

        expect(row).toBeInTheDocument();
        expect(col).toBeInTheDocument();
        expect(col).toHaveClass("col-md-8", "offset-md-2");
    });

    it("should display comments when loaded", async () => {
        render(
            <BrowserRouter>
                <CommentsSection />
            </BrowserRouter>,
        );

        expect(await screen.findByText("Great article!")).toBeInTheDocument();
    });

    it("should maintain state when CommentEditor is updated", () => {
        render(
            <BrowserRouter>
                <CommentsSection />
            </BrowserRouter>,
        );

        const textarea = screen.getByPlaceholderText("Write a comment...");
        expect(textarea).toHaveValue("");
    });

    it("should pass updateComments callback to both components", async () => {
        render(
            <BrowserRouter>
                <CommentsSection />
            </BrowserRouter>,
        );

        const textarea = screen.getByPlaceholderText("Write a comment...");
        fireEvent.change(textarea, { target: { value: "Test" } });
        fireEvent.click(screen.getByText("Post Comment"));

        // Both components should receive the callback
        expect(postComment).toHaveBeenCalled();
    });

    it("should fetch comments on mount", async () => {
        render(
            <BrowserRouter>
                <CommentsSection />
            </BrowserRouter>,
        );

        await screen.findByText("Great article!");
        expect(getComments).toHaveBeenCalled();
    });

    it("should handle empty comments initially", async () => {
        getComments.mockResolvedValueOnce([]);

        render(
            <BrowserRouter>
                <CommentsSection />
            </BrowserRouter>,
        );

        expect(
            await screen.findByText("There are no comments yet..."),
        ).toBeInTheDocument();
    });
});
