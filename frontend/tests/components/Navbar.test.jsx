import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import Navbar from "../../src/components/Navbar/Navbar";
import { useAuth } from "../../src/context/AuthContext";

jest.mock("../../src/context/AuthContext");
jest.mock("../../src/components/NavItem", () => ({
    __esModule: true,
    default: ({ text }) => <div data-testid={`nav-item-${text}`}>{text}</div>,
}));
jest.mock("../../src/components/SourceCodeLink", () => ({
    __esModule: true,
    default: () => <div data-testid="source-code-link" />,
}));
jest.mock("../../src/components/Navbar/DropdownMenu", () => ({
    __esModule: true,
    default: () => <div data-testid="dropdown-menu" />,
}));

function renderNavbar() {
    return render(
        <BrowserRouter>
            <Navbar />
        </BrowserRouter>,
    );
}

describe("Navbar Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should always render Home NavItem", () => {
        useAuth.mockReturnValue({ isAuth: false });
        renderNavbar();
        expect(screen.getByTestId("nav-item-Home")).toBeInTheDocument();
    });

    it("should render conduit brand link", () => {
        useAuth.mockReturnValue({ isAuth: false });
        renderNavbar();
        const brandLink = screen.getByText("conduit");
        expect(brandLink).toHaveClass("navbar-brand");
        expect(brandLink).toHaveAttribute("href", "/");
    });

    it("should render SourceCodeLink component", () => {
        useAuth.mockReturnValue({ isAuth: false });
        renderNavbar();
        expect(screen.getByTestId("source-code-link")).toBeInTheDocument();
    });

    describe("when user is authenticated", () => {
        beforeEach(() => {
            useAuth.mockReturnValue({ isAuth: true });
        });

        it("should render New Article NavItem", () => {
            renderNavbar();
            expect(screen.getByTestId("nav-item-New Article")).toBeInTheDocument();
        });

        it("should render DropdownMenu", () => {
            renderNavbar();
            expect(screen.getByTestId("dropdown-menu")).toBeInTheDocument();
        });

        it("should not render Login and Sign up items", () => {
            renderNavbar();
            expect(screen.queryByTestId("nav-item-Login")).not.toBeInTheDocument();
            expect(screen.queryByTestId("nav-item-Sign up")).not.toBeInTheDocument();
        });
    });

    describe("when user is not authenticated", () => {
        beforeEach(() => {
            useAuth.mockReturnValue({ isAuth: false });
        });

        it("should render Login NavItem", () => {
            renderNavbar();
            expect(screen.getByTestId("nav-item-Login")).toBeInTheDocument();
        });

        it("should render Sign up NavItem", () => {
            renderNavbar();
            expect(screen.getByTestId("nav-item-Sign up")).toBeInTheDocument();
        });

        it("should not render New Article NavItem", () => {
            renderNavbar();
            expect(screen.queryByTestId("nav-item-New Article")).not.toBeInTheDocument();
        });

        it("should not render DropdownMenu", () => {
            renderNavbar();
            expect(screen.queryByTestId("dropdown-menu")).not.toBeInTheDocument();
        });
    });

    it("should have navbar-light class", () => {
        useAuth.mockReturnValue({ isAuth: false });
        renderNavbar();
        const nav = screen.getByRole("navigation");
        expect(nav).toHaveClass("navbar");
        expect(nav).toHaveClass("navbar-light");
    });

    it("should have container and pull-xs-right classes", () => {
        useAuth.mockReturnValue({ isAuth: false });
        renderNavbar();
        const container = screen.getByRole("navigation").querySelector(".container");
        expect(container).toBeInTheDocument();
        const navList = container.querySelector(".pull-xs-right");
        expect(navList).toBeInTheDocument();
    });
});
