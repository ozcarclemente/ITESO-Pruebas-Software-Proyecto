import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import FollowButton from "../../src/components/FollowButton/FollowButton";
import { useAuth } from "../../src/context/AuthContext";
import toggleFollow from "../../src/services/toggleFollow";

jest.mock("../../src/context/AuthContext");
jest.mock("../../src/services/toggleFollow");

const mockHandler = jest.fn();

describe("FollowButton Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        window.alert = jest.fn();
    });

    describe("when user is not authenticated", () => {
        beforeEach(() => {
            useAuth.mockReturnValue({ isAuth: false, headers: null });
        });

        it("should display followers count", () => {
            render(<FollowButton followersCount={10} following={false} />);
            expect(screen.getByText("( 10 )")).toBeInTheDocument();
        });

        it("should display Followers text instead of Follow/Unfollow", () => {
            render(<FollowButton followersCount={5} following={false} />);
            expect(screen.getByText(/Followers/)).toBeInTheDocument();
        });

        it("should not display icon when not authenticated", () => {
            render(<FollowButton followersCount={5} following={false} />);
            expect(
                screen.getByRole("button").querySelector("i"),
            ).not.toBeInTheDocument();
        });

        it("should show alert when clicked without authentication", () => {
            render(
                <FollowButton
                    followersCount={5}
                    following={false}
                    username="testuser"
                />,
            );
            fireEvent.click(screen.getByRole("button"));
            expect(window.alert).toHaveBeenCalledWith(
                "You need to login first",
            );
        });

        it("should not call toggleFollow when not authenticated", () => {
            render(
                <FollowButton
                    followersCount={5}
                    following={false}
                    username="testuser"
                />,
            );
            fireEvent.click(screen.getByRole("button"));
            expect(toggleFollow).not.toHaveBeenCalled();
        });

        it("should not call handler when not authenticated", () => {
            render(
                <FollowButton
                    followersCount={5}
                    following={false}
                    handler={mockHandler}
                    username="testuser"
                />,
            );
            fireEvent.click(screen.getByRole("button"));
            expect(mockHandler).not.toHaveBeenCalled();
        });
    });

    describe("when user is authenticated and not following", () => {
        beforeEach(() => {
            useAuth.mockReturnValue({
                isAuth: true,
                headers: { Authorization: "Token test" },
            });
        });

        it("should display Follow text", () => {
            render(
                <FollowButton
                    followersCount={5}
                    following={false}
                    username="testuser"
                />,
            );
            expect(screen.getByText(/Follow/)).toBeInTheDocument();
        });

        it("should display plus icon", () => {
            render(
                <FollowButton
                    followersCount={5}
                    following={false}
                    username="testuser"
                />,
            );
            expect(
                screen.getByRole("button").querySelector(".ion-plus-round"),
            ).toBeInTheDocument();
        });

        it("should not have btn-secondary class", () => {
            render(
                <FollowButton
                    followersCount={5}
                    following={false}
                    username="testuser"
                />,
            );
            expect(screen.getByRole("button")).not.toHaveClass("btn-secondary");
        });

        it("should call toggleFollow with correct params when clicked", async () => {
            toggleFollow.mockResolvedValue({ following: true });

            render(
                <FollowButton
                    followersCount={5}
                    following={false}
                    username="testuser"
                    handler={mockHandler}
                />,
            );

            fireEvent.click(screen.getByRole("button"));

            expect(toggleFollow).toHaveBeenCalledWith({
                following: false,
                headers: { Authorization: "Token test" },
                username: "testuser",
            });

            await waitFor(() => {
                expect(mockHandler).toHaveBeenCalled();
            });
        });

        it("should be disabled while loading", async () => {
            toggleFollow.mockReturnValue(new Promise(() => {}));

            render(
                <FollowButton
                    followersCount={5}
                    following={false}
                    username="testuser"
                />,
            );

            fireEvent.click(screen.getByRole("button"));
            expect(screen.getByRole("button")).toBeDisabled();
        });
    });

    describe("when user is authenticated and following", () => {
        beforeEach(() => {
            useAuth.mockReturnValue({
                isAuth: true,
                headers: { Authorization: "Token test" },
            });
        });

        it("should display Unfollow text", () => {
            render(
                <FollowButton
                    followersCount={5}
                    following={true}
                    username="testuser"
                />,
            );
            expect(screen.getByText(/Unfollow/)).toBeInTheDocument();
        });

        it("should display minus icon", () => {
            render(
                <FollowButton
                    followersCount={5}
                    following={true}
                    username="testuser"
                />,
            );
            expect(
                screen.getByRole("button").querySelector(".ion-minus-round"),
            ).toBeInTheDocument();
        });

        it("should have btn-secondary class", () => {
            render(
                <FollowButton
                    followersCount={5}
                    following={true}
                    username="testuser"
                />,
            );
            expect(screen.getByRole("button")).toHaveClass("btn-secondary");
        });

        it("should call toggleFollow with following=true when clicked", async () => {
            toggleFollow.mockResolvedValue({ following: false });

            render(
                <FollowButton
                    followersCount={5}
                    following={true}
                    username="testuser"
                    handler={mockHandler}
                />,
            );

            fireEvent.click(screen.getByRole("button"));

            expect(toggleFollow).toHaveBeenCalledWith({
                following: true,
                headers: { Authorization: "Token test" },
                username: "testuser",
            });

            await waitFor(() => {
                expect(mockHandler).toHaveBeenCalled();
            });
        });
    });

    it("should have action-btn class", () => {
        useAuth.mockReturnValue({
            isAuth: true,
            headers: { Authorization: "Token test" },
        });
        render(
            <FollowButton
                followersCount={5}
                following={false}
                username="testuser"
            />,
        );
        expect(screen.getByRole("button")).toHaveClass("action-btn");
    });

    it("should display username when authenticated", () => {
        useAuth.mockReturnValue({
            isAuth: true,
            headers: { Authorization: "Token test" },
        });
        render(
            <FollowButton
                followersCount={5}
                following={false}
                username="john_doe"
            />,
        );
        expect(screen.getByRole("button")).toHaveTextContent("john_doe");
    });

    it("should handle error from toggleFollow gracefully", async () => {
        useAuth.mockReturnValue({
            isAuth: true,
            headers: { Authorization: "Token test" },
        });
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation();
        toggleFollow.mockRejectedValue(new Error("Network error"));

        render(
            <FollowButton
                followersCount={5}
                following={false}
                username="testuser"
                handler={mockHandler}
            />,
        );

        fireEvent.click(screen.getByRole("button"));

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalled();
            expect(mockHandler).not.toHaveBeenCalled();
        });

        consoleErrorSpy.mockRestore();
    });

    it("should re-enable button after loading completes", async () => {
        useAuth.mockReturnValue({
            isAuth: true,
            headers: { Authorization: "Token test" },
        });
        toggleFollow.mockResolvedValue({ following: true });

        render(
            <FollowButton
                followersCount={5}
                following={false}
                username="testuser"
                handler={mockHandler}
            />,
        );

        const button = screen.getByRole("button");
        fireEvent.click(button);

        expect(button).toBeDisabled();

        await waitFor(() => {
            expect(button).not.toBeDisabled();
        });
    });
});
