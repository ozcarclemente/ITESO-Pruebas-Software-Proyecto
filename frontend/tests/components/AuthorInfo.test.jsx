import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import AuthorInfo from "../../src/components/AuthorInfo/AuthorInfo";
import { useAuth } from "../../src/context/AuthContext";
import getProfile from "../../src/services/getProfile";
import * as reactRouter from "react-router-dom";

jest.mock("../../src/context/AuthContext");
jest.mock("../../src/services/getProfile");
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: jest.fn(),
    useLocation: jest.fn(),
    useNavigate: jest.fn(),
    Link: ({ to, children, ...props }) => (
        <a href={to} {...props}>
            {children}
        </a>
    ),
}));
jest.mock("../../src/components/Avatar", () => ({
    __esModule: true,
    default: ({ alt, src, className }) => (
        <img alt={alt} src={src} className={className} data-testid="avatar" />
    ),
}));
jest.mock("../../src/components/FollowButton", () => ({
    __esModule: true,
    default: ({ username }) => <button data-testid="follow-button">{username}</button>,
}));
jest.mock("markdown-to-jsx", () => ({
    __esModule: true,
    default: ({ children }) => <div data-testid="markdown">{children}</div>,
}));

function renderAuthorInfo(username = "testuser", state = {}) {
    reactRouter.useParams.mockReturnValue({ username });
    reactRouter.useLocation.mockReturnValue({ state });
    reactRouter.useNavigate.mockReturnValue(jest.fn());

    return render(<AuthorInfo />);
}

describe("AuthorInfo Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue({
            headers: { Authorization: "Token test" },
            loggedUser: { username: "currentuser" },
        });
    });

    describe("profile rendering", () => {
        it("should render username", async () => {
            const profile = {
                username: "testuser",
                bio: "Test bio",
                image: "https://example.com/image.jpg",
                followersCount: 10,
                following: false,
            };

            getProfile.mockResolvedValue(profile);

            renderAuthorInfo("testuser");

            await waitFor(() => {
                expect(screen.getByRole("heading", { level: 4 })).toHaveTextContent("testuser");
            });
        });

        it("should render avatar with username as alt", async () => {
            const profile = {
                username: "john_doe",
                image: "https://example.com/john.jpg",
                bio: "",
                followersCount: 5,
                following: false,
            };

            getProfile.mockResolvedValue(profile);

            renderAuthorInfo("john_doe");

            await waitFor(() => {
                const avatar = screen.getByTestId("avatar");
                expect(avatar).toHaveAttribute("alt", "john_doe");
            });
        });

        it("should render bio when available", async () => {
            const profile = {
                username: "testuser",
                bio: "I am a developer",
                image: "https://example.com/image.jpg",
                followersCount: 10,
                following: false,
            };

            getProfile.mockResolvedValue(profile);

            renderAuthorInfo("testuser", null);

            await waitFor(() => {
                expect(screen.getByTestId("markdown")).toBeInTheDocument();
            });
        });

        it("should not render bio when not available", async () => {
            const profile = {
                username: "testuser",
                bio: null,
                image: "https://example.com/image.jpg",
                followersCount: 10,
                following: false,
            };

            getProfile.mockResolvedValue(profile);

            renderAuthorInfo("testuser");

            await waitFor(() => {
                expect(screen.getByRole("heading", { level: 4 })).toHaveTextContent("testuser");
            });
        });
    });

    describe("profile fetch", () => {
        it("should call getProfile with username and headers", async () => {
            const profile = {
                username: "testuser",
                bio: "Test bio",
                image: "",
                followersCount: 0,
                following: false,
            };

            getProfile.mockResolvedValue(profile);

            renderAuthorInfo("testuser", null);

            await waitFor(() => {
                expect(getProfile).toHaveBeenCalled();
            });
        });

        it("should use state data when available", async () => {
            const stateData = {
                username: "testuser",
                bio: "State bio",
                image: "https://example.com/image.jpg",
                followersCount: 20,
                following: true,
            };

            renderAuthorInfo("testuser", stateData);

            expect(screen.getByRole("heading", { level: 4 })).toHaveTextContent("testuser");
        });

        it("should handle profile fetch error", async () => {
            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
            getProfile.mockRejectedValueOnce(new Error("Failed to fetch"));

            renderAuthorInfo("testuser", null);

            await waitFor(() => {
                expect(getProfile).toHaveBeenCalled();
            });

            consoleErrorSpy.mockRestore();
        });
    });

    describe("own profile vs other user profile", () => {
        it("should render Edit Profile button when viewing own profile", async () => {
            useAuth.mockReturnValue({
                headers: { Authorization: "Token test" },
                loggedUser: { username: "testuser" },
            });

            const profile = {
                username: "testuser",
                bio: "",
                image: "",
                followersCount: 0,
                following: false,
            };

            getProfile.mockResolvedValue(profile);

            renderAuthorInfo("testuser");

            await waitFor(() => {
                const editButton = screen.queryByRole("link", { name: /Edit Profile/ });
                expect(editButton).toBeInTheDocument();
            });
        });

        it("should render Follow button when viewing other user profile", async () => {
            useAuth.mockReturnValue({
                headers: { Authorization: "Token test" },
                loggedUser: { username: "currentuser" },
            });

            getProfile.mockResolvedValue({
                username: "otheruser",
                bio: "",
                image: "",
                followersCount: 10,
                following: false,
            });

            renderAuthorInfo("otheruser");

            await waitFor(() => {
                expect(screen.getByTestId("follow-button")).toBeInTheDocument();
            });
        });

        it("should not render Follow button when viewing own profile", async () => {
            useAuth.mockReturnValue({
                headers: { Authorization: "Token test" },
                loggedUser: { username: "testuser" },
            });

            getProfile.mockResolvedValue({
                username: "testuser",
                bio: "",
                image: "",
                followersCount: 10,
                following: false,
            });

            renderAuthorInfo("testuser");

            await waitFor(() => {
                expect(screen.queryByTestId("follow-button")).not.toBeInTheDocument();
            });
        });

        it("should have correct Edit Profile link href", async () => {
            useAuth.mockReturnValue({
                headers: { Authorization: "Token test" },
                loggedUser: { username: "testuser" },
            });

            getProfile.mockResolvedValue({
                username: "testuser",
                bio: "",
                image: "",
                followersCount: 0,
                following: false,
            });

            renderAuthorInfo("testuser");

            await waitFor(() => {
                const editButton = screen.getByRole("link", { name: /Edit Profile/ });
                expect(editButton).toHaveAttribute("href", "/settings");
            });
        });

        it("should have action-btn class on Edit Profile button", async () => {
            useAuth.mockReturnValue({
                headers: { Authorization: "Token test" },
                loggedUser: { username: "testuser" },
            });

            getProfile.mockResolvedValue({
                username: "testuser",
                bio: "",
                image: "",
                followersCount: 0,
                following: false,
            });

            renderAuthorInfo("testuser");

            await waitFor(() => {
                const editButton = screen.getByRole("link", { name: /Edit Profile/ });
                expect(editButton).toHaveClass("action-btn");
            });
        });
    });

    it("should render with col-xs-12 col-md-10 offset-md-1 classes", async () => {
        const profile = {
            username: "testuser",
            bio: "",
            image: "",
            followersCount: 0,
            following: false,
        };

        getProfile.mockResolvedValue(profile);

        const { container } = renderAuthorInfo("testuser");

        await waitFor(() => {
            const colDiv = container.querySelector(".col-xs-12");
            expect(colDiv).toHaveClass("col-md-10");
            expect(colDiv).toHaveClass("offset-md-1");
        });
    });

    it("should render user-img class on avatar", async () => {
        const profile = {
            username: "testuser",
            image: "https://example.com/image.jpg",
            bio: "",
            followersCount: 0,
            following: false,
        };

        getProfile.mockResolvedValue(profile);

        const { container } = renderAuthorInfo("testuser");

        await waitFor(() => {
            const avatar = container.querySelector(".user-img");
            expect(avatar).toBeInTheDocument();
        });
    });
});
