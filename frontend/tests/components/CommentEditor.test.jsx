import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

jest.mock("../../src/context/AuthContext");
jest.mock("../../src/services/postComment");
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: () => ({ slug: "test-article" }),
}));

const { useAuth } = require("../../src/context/AuthContext");
const postComment =
    require("../../src/services/postComment").default ||
    require("../../src/services/postComment");

useAuth.mockReturnValue({
    headers: { Authorization: "Token test" },
    isAuth: true,
    loggedUser: { username: "testuser", image: "avatar.jpg" },
});

postComment.mockResolvedValue({ id: 1, body: "Test" });

import CommentEditor from "../../src/components/CommentEditor/CommentEditor";

describe("CommentEditor", () => {
    const mockUpdateComments = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render textarea for authenticated users", () => {
        render(
            <BrowserRouter>
                <CommentEditor updateComments={mockUpdateComments} />
            </BrowserRouter>,
        );

        expect(
            screen.getByPlaceholderText("Write a comment..."),
        ).toBeInTheDocument();
        expect(screen.getByText("Post Comment")).toBeInTheDocument();
    });

    it("should render avatar for authenticated users", () => {
        render(
            <BrowserRouter>
                <CommentEditor updateComments={mockUpdateComments} />
            </BrowserRouter>,
        );

        const avatar = screen.getByAltText("testuser");
        expect(avatar).toBeInTheDocument();
    });

    it("should update textarea on change", () => {
        render(
            <BrowserRouter>
                <CommentEditor updateComments={mockUpdateComments} />
            </BrowserRouter>,
        );

        const textarea = screen.getByPlaceholderText("Write a comment...");
        fireEvent.change(textarea, { target: { value: "Great article!" } });

        expect(textarea.value).toBe("Great article!");
    });

    it("should submit comment when not empty", async () => {
        render(
            <BrowserRouter>
                <CommentEditor updateComments={mockUpdateComments} />
            </BrowserRouter>,
        );

        const textarea = screen.getByPlaceholderText("Write a comment...");
        fireEvent.change(textarea, { target: { value: "Test comment" } });
        fireEvent.click(screen.getByText("Post Comment"));

        await waitFor(() => {
            expect(postComment).toHaveBeenCalledWith({
                body: "Test comment",
                headers: { Authorization: "Token test" },
                slug: "test-article",
            });
        });
    });

    it("should call updateComments after submit", async () => {
        render(
            <BrowserRouter>
                <CommentEditor updateComments={mockUpdateComments} />
            </BrowserRouter>,
        );

        const textarea = screen.getByPlaceholderText("Write a comment...");
        fireEvent.change(textarea, { target: { value: "Test comment" } });
        fireEvent.click(screen.getByText("Post Comment"));

        await waitFor(() => {
            expect(mockUpdateComments).toHaveBeenCalled();
        });
    });

    it("should not submit empty comment", async () => {
        render(
            <BrowserRouter>
                <CommentEditor updateComments={mockUpdateComments} />
            </BrowserRouter>,
        );

        fireEvent.click(screen.getByText("Post Comment"));

        expect(postComment).not.toHaveBeenCalled();
        expect(mockUpdateComments).not.toHaveBeenCalled();
    });

    it("should not submit whitespace-only comment", async () => {
        render(
            <BrowserRouter>
                <CommentEditor updateComments={mockUpdateComments} />
            </BrowserRouter>,
        );

        const textarea = screen.getByPlaceholderText("Write a comment...");
        fireEvent.change(textarea, { target: { value: "   " } });
        fireEvent.click(screen.getByText("Post Comment"));

        expect(postComment).not.toHaveBeenCalled();
    });

    it("should show login links for unauthenticated users", () => {
        useAuth.mockReturnValueOnce({
            headers: {},
            isAuth: false,
            loggedUser: null,
        });

        render(
            <BrowserRouter>
                <CommentEditor updateComments={mockUpdateComments} />
            </BrowserRouter>,
        );

        expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
            "href",
            "/login",
        );
        expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute(
            "href",
            "/register",
        );
        expect(
            screen.queryByPlaceholderText("Write a comment..."),
        ).not.toBeInTheDocument();
    });

    it("should handle postComment error", async () => {
        const error = new Error("Network error");
        postComment.mockRejectedValueOnce(error);

        render(
            <BrowserRouter>
                <CommentEditor updateComments={mockUpdateComments} />
            </BrowserRouter>,
        );

        const textarea = screen.getByPlaceholderText("Write a comment...");
        fireEvent.change(textarea, { target: { value: "Test comment" } });
        fireEvent.click(screen.getByText("Post Comment"));

        await waitFor(() => {
            expect(console.error).toHaveBeenCalledWith(error);
        });
    });
});
