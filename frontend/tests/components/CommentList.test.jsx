import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

jest.mock("../../src/context/AuthContext");
jest.mock("../../src/services/getComments");
jest.mock("../../src/services/deleteComment");
jest.mock("../../src/helpers/dateFormatter");
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: () => ({ slug: "test-article" }),
}));

const { useAuth } = require("../../src/context/AuthContext");
const getComments =
    require("../../src/services/getComments").default ||
    require("../../src/services/getComments");
const deleteComment =
    require("../../src/services/deleteComment").default ||
    require("../../src/services/deleteComment");

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

deleteComment.mockResolvedValue();

import CommentList from "../../src/components/CommentList/CommentList";

describe("CommentList", () => {
    const mockUpdateComments = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        window.confirm = jest.fn(() => true);
        global.alert = jest.fn();
    });

    it("should render comments", async () => {
        render(
            <BrowserRouter>
                <CommentList
                    triggerUpdate={false}
                    updateComments={mockUpdateComments}
                />
            </BrowserRouter>,
        );

        expect(await screen.findByText("Great article!")).toBeInTheDocument();
    });

    it("should show delete button for own comments", async () => {
        render(
            <BrowserRouter>
                <CommentList
                    triggerUpdate={false}
                    updateComments={mockUpdateComments}
                />
            </BrowserRouter>,
        );

        const deleteButton = await screen.findByRole("button");
        expect(deleteButton).toBeInTheDocument();
        expect(deleteButton).toHaveClass("btn-outline-secondary");
    });

    it("should show no comments message when empty", async () => {
        getComments.mockResolvedValueOnce([]);

        render(
            <BrowserRouter>
                <CommentList
                    triggerUpdate={false}
                    updateComments={mockUpdateComments}
                />
            </BrowserRouter>,
        );

        expect(
            await screen.findByText("There are no comments yet..."),
        ).toBeInTheDocument();
    });

    it("should not show delete button for others comments", async () => {
        getComments.mockResolvedValueOnce([
            {
                id: 2,
                body: "Other user comment",
                author: { username: "otheruser", image: "avatar.jpg" },
                createdAt: "2024-04-30T00:00:00Z",
            },
        ]);

        render(
            <BrowserRouter>
                <CommentList
                    triggerUpdate={false}
                    updateComments={mockUpdateComments}
                />
            </BrowserRouter>,
        );

        await screen.findByText("Other user comment");
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should delete comment when confirmed", async () => {
        render(
            <BrowserRouter>
                <CommentList
                    triggerUpdate={false}
                    updateComments={mockUpdateComments}
                />
            </BrowserRouter>,
        );

        const deleteButton = await screen.findByRole("button");
        fireEvent.click(deleteButton);

        expect(window.confirm).toHaveBeenCalledWith(
            "Want to delete the comment?",
        );
        await waitFor(() => {
            expect(deleteComment).toHaveBeenCalledWith({
                commentId: 1,
                headers: { Authorization: "Token test" },
                slug: "test-article",
            });
        });
        expect(mockUpdateComments).toHaveBeenCalled();
    });

    it("should not delete comment when not confirmed", async () => {
        window.confirm.mockReturnValueOnce(false);

        render(
            <BrowserRouter>
                <CommentList
                    triggerUpdate={false}
                    updateComments={mockUpdateComments}
                />
            </BrowserRouter>,
        );

        const deleteButton = await screen.findByRole("button");
        fireEvent.click(deleteButton);

        expect(window.confirm).toHaveBeenCalled();
        expect(deleteComment).not.toHaveBeenCalled();
    });

    it("should alert user when not authenticated", async () => {
        useAuth.mockReturnValueOnce({
            headers: {},
            isAuth: false,
            loggedUser: null,
        });

        getComments.mockResolvedValueOnce([
            {
                id: 1,
                body: "Comment",
                author: { username: "testuser", image: "avatar.jpg" },
                createdAt: "2024-04-30T00:00:00Z",
            },
        ]);

        render(
            <BrowserRouter>
                <CommentList
                    triggerUpdate={false}
                    updateComments={mockUpdateComments}
                />
            </BrowserRouter>,
        );

        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should fetch comments with correct slug", async () => {
        render(
            <BrowserRouter>
                <CommentList
                    triggerUpdate={false}
                    updateComments={mockUpdateComments}
                />
            </BrowserRouter>,
        );

        await waitFor(() => {
            expect(getComments).toHaveBeenCalledWith({ slug: "test-article" });
        });
    });

    it("should refetch comments when triggerUpdate changes", async () => {
        const { rerender } = render(
            <BrowserRouter>
                <CommentList
                    triggerUpdate={false}
                    updateComments={mockUpdateComments}
                />
            </BrowserRouter>,
        );

        getComments.mockClear();

        rerender(
            <BrowserRouter>
                <CommentList
                    triggerUpdate={true}
                    updateComments={mockUpdateComments}
                />
            </BrowserRouter>,
        );

        await waitFor(() => {
            expect(getComments).toHaveBeenCalled();
        });
    });

    it("should handle getComments error", async () => {
        const error = new Error("Fetch failed");
        getComments.mockRejectedValueOnce(error);
        global.console.error = jest.fn();

        render(
            <BrowserRouter>
                <CommentList
                    triggerUpdate={false}
                    updateComments={mockUpdateComments}
                />
            </BrowserRouter>,
        );

        await waitFor(() => {
            expect(global.console.error).toHaveBeenCalledWith(error);
        });
    });

    it("should handle deleteComment error", async () => {
        deleteComment.mockRejectedValueOnce(new Error("Delete failed"));
        global.console.error = jest.fn();

        render(
            <BrowserRouter>
                <CommentList
                    triggerUpdate={false}
                    updateComments={mockUpdateComments}
                />
            </BrowserRouter>,
        );

        const deleteButton = await screen.findByRole("button");
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(global.console.error).toHaveBeenCalled();
        });
    });
});
