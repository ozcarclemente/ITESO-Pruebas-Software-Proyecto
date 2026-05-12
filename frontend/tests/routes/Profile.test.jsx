import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Profile from "../../src/routes/Profile/Profile";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useLocation: () => ({
        state: undefined,
    }),
    Outlet: () => <div data-testid="outlet" />,
}));

jest.mock("../../src/components/AuthorInfo", () => ({
    __esModule: true,
    default: () => <div data-testid="author-info">Author Info</div>,
}));

jest.mock("../../src/components/ContainerRow", () => ({
    __esModule: true,
    default: ({ children }) => <div data-testid="container">{children}</div>,
}));

jest.mock("../../src/components/NavItem", () => ({
    __esModule: true,
    default: ({ text, url, state }) => (
        <li data-testid={`nav-item-${text.replace(/ /g, "-").toLowerCase()}`}>
            {text}
        </li>
    ),
}));

function renderProfile() {
    return render(
        <BrowserRouter>
            <Profile />
        </BrowserRouter>,
    );
}

describe("Profile Route", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("page structure", () => {
        it("should render profile-page wrapper", () => {
            const { container } = renderProfile();
            expect(container.querySelector(".profile-page")).toBeInTheDocument();
        });

        it("should render user-info section", () => {
            const { container } = renderProfile();
            expect(container.querySelector(".user-info")).toBeInTheDocument();
        });

        it("should render AuthorInfo component", () => {
            renderProfile();
            expect(screen.getByTestId("author-info")).toBeInTheDocument();
        });

        it("should render articles-toggle section", () => {
            const { container } = renderProfile();
            expect(
                container.querySelector(".articles-toggle"),
            ).toBeInTheDocument();
        });
    });

    describe("navigation items", () => {
        it("should render My Articles nav item", () => {
            renderProfile();
            expect(
                screen.getByTestId("nav-item-my-articles"),
            ).toBeInTheDocument();
            expect(screen.getByText("My Articles")).toBeInTheDocument();
        });

        it("should render Favorited Articles nav item", () => {
            renderProfile();
            expect(
                screen.getByTestId("nav-item-favorited-articles"),
            ).toBeInTheDocument();
            expect(screen.getByText("Favorited Articles")).toBeInTheDocument();
        });

        it("should render nav list", () => {
            const { container } = renderProfile();
            const navList = container.querySelector(".nav.nav-pills");
            expect(navList).toBeInTheDocument();
        });

        it("should have outline-active class on nav", () => {
            const { container } = renderProfile();
            expect(container.querySelector(".outline-active")).toBeInTheDocument();
        });
    });

    describe("layout structure", () => {
        it("should render col-xs-12 col-md-10 offset-md-1 layout", () => {
            const { container } = renderProfile();
            expect(
                container.querySelector(".col-xs-12.col-md-10.offset-md-1"),
            ).toBeInTheDocument();
        });

        it("should render Outlet for nested routes", () => {
            renderProfile();
            expect(screen.getByTestId("outlet")).toBeInTheDocument();
        });

        it("should render multiple ContainerRow components", () => {
            renderProfile();
            const containers = screen.getAllByTestId("container");
            expect(containers.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe("component composition", () => {
        it("should have AuthorInfo inside first ContainerRow", () => {
            const { container } = renderProfile();
            const userInfo = container.querySelector(".user-info");
            expect(userInfo.textContent).toContain("Author Info");
        });

        it("should have navigation and outlet in second section", () => {
            const { container } = renderProfile();
            const toggle = container.querySelector(".articles-toggle");
            const outlet = screen.getByTestId("outlet");

            expect(toggle).toBeInTheDocument();
            expect(outlet).toBeInTheDocument();
        });

        it("should render NavItem components with correct props", () => {
            renderProfile();
            const myArticlesItem = screen.getByTestId("nav-item-my-articles");
            const favoritedItem = screen.getByTestId("nav-item-favorited-articles");

            expect(myArticlesItem).toBeInTheDocument();
            expect(favoritedItem).toBeInTheDocument();
        });
    });
});
