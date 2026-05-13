import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Home from "../../src/routes/Home";
const { useAuth } = require("../../src/context/AuthContext");

jest.mock("../../src/context/AuthContext");
jest.mock("../../src/components/BannerContainer", () => ({
    __esModule: true,
    default: ({ children }) => <div data-testid="banner">{children}</div>,
}));
jest.mock("../../src/components/ContainerRow", () => ({
    __esModule: true,
    default: ({ children }) => <div data-testid="container">{children}</div>,
}));
jest.mock("../../src/components/FeedToggler", () => ({
    __esModule: true,
    default: () => <div data-testid="feed-toggler" />,
}));
jest.mock("../../src/components/PopularTags", () => ({
    __esModule: true,
    default: () => <div data-testid="popular-tags" />,
}));
jest.mock("../../src/context/FeedContext", () => ({
    __esModule: true,
    default: ({ children }) => (
        <div data-testid="feed-provider">{children}</div>
    ),
}));
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    Outlet: () => <div data-testid="outlet" />,
}));

function renderHome() {
    return render(
        <BrowserRouter>
            <Home />
        </BrowserRouter>,
    );
}

describe("Home Route", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("banner rendering", () => {
        it("should render banner when user is not authenticated", () => {
            useAuth.mockReturnValue({
                isAuth: false,
                headers: null,
                loggedUser: {},
            });

            renderHome();

            expect(screen.getByTestId("banner")).toBeInTheDocument();
            expect(screen.getByText("conduit")).toBeInTheDocument();
            expect(
                screen.getByText("A place to share your knowledge."),
            ).toBeInTheDocument();
        });

        it("should not render banner when user is authenticated", () => {
            useAuth.mockReturnValue({
                isAuth: true,
                headers: { Authorization: "Token test" },
                loggedUser: { username: "testuser" },
            });

            const { container } = renderHome();

            const banner = container.querySelector(".home-page");
            const bannerChildren = banner.querySelectorAll(
                "[data-testid='banner']",
            );
            expect(bannerChildren.length).toBe(0);
        });

        it("should render banner with correct CSS class", () => {
            useAuth.mockReturnValue({
                isAuth: false,
                headers: null,
                loggedUser: {},
            });

            const { container } = renderHome();

            expect(container.querySelector(".home-page")).toBeInTheDocument();
        });
    });

    describe("feed layout", () => {
        it("should render main feed section", () => {
            useAuth.mockReturnValue({
                isAuth: true,
                headers: { Authorization: "Token test" },
                loggedUser: { username: "testuser" },
            });

            renderHome();

            expect(screen.getByTestId("container")).toBeInTheDocument();
            expect(screen.getByTestId("feed-provider")).toBeInTheDocument();
        });

        it("should render FeedToggler component", () => {
            useAuth.mockReturnValue({
                isAuth: true,
                headers: { Authorization: "Token test" },
                loggedUser: { username: "testuser" },
            });

            renderHome();

            expect(screen.getByTestId("feed-toggler")).toBeInTheDocument();
        });

        it("should render Outlet for nested routes", () => {
            useAuth.mockReturnValue({
                isAuth: true,
                headers: { Authorization: "Token test" },
                loggedUser: { username: "testuser" },
            });

            renderHome();

            expect(screen.getByTestId("outlet")).toBeInTheDocument();
        });

        it("should render PopularTags component", () => {
            useAuth.mockReturnValue({
                isAuth: true,
                headers: { Authorization: "Token test" },
                loggedUser: { username: "testuser" },
            });

            renderHome();

            expect(screen.getByTestId("popular-tags")).toBeInTheDocument();
        });

        it("should render col-md-9 for feed section", () => {
            useAuth.mockReturnValue({
                isAuth: true,
                headers: { Authorization: "Token test" },
                loggedUser: { username: "testuser" },
            });

            const { container } = renderHome();

            expect(container.querySelector(".col-md-9")).toBeInTheDocument();
        });
    });

    describe("auth state handling", () => {
        it("should render correctly for authenticated users", () => {
            useAuth.mockReturnValue({
                isAuth: true,
                headers: { Authorization: "Token abc123" },
                loggedUser: { username: "authenticated-user" },
            });

            renderHome();

            expect(screen.getByTestId("feed-toggler")).toBeInTheDocument();
            expect(screen.getByTestId("outlet")).toBeInTheDocument();
        });

        it("should render correctly for unauthenticated users", () => {
            useAuth.mockReturnValue({
                isAuth: false,
                headers: null,
                loggedUser: {},
            });

            renderHome();

            expect(screen.getByText("conduit")).toBeInTheDocument();
            expect(screen.getByTestId("feed-provider")).toBeInTheDocument();
        });
    });

    describe("page structure", () => {
        it("should render home-page wrapper", () => {
            useAuth.mockReturnValue({
                isAuth: false,
                headers: null,
                loggedUser: {},
            });

            const { container } = renderHome();

            expect(container.querySelector(".home-page")).toBeInTheDocument();
        });

        it("should render FeedProvider context wrapper", () => {
            useAuth.mockReturnValue({
                isAuth: true,
                headers: { Authorization: "Token test" },
                loggedUser: { username: "testuser" },
            });

            renderHome();

            expect(screen.getByTestId("feed-provider")).toBeInTheDocument();
        });

        it("should have correct grid layout with col-md-9 and sidebar", () => {
            useAuth.mockReturnValue({
                isAuth: true,
                headers: { Authorization: "Token test" },
                loggedUser: { username: "testuser" },
            });

            const { container } = renderHome();

            expect(container.querySelector(".col-md-9")).toBeInTheDocument();
            expect(screen.getByTestId("popular-tags")).toBeInTheDocument();
        });
    });
});
