import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect } from "@jest/globals";
import NavItem from "../../src/components/NavItem/NavItem";

function renderNavItem(props = {}) {
    const defaultProps = {
        text: "Home",
        url: "/",
        ...props,
    };
    return render(
        <BrowserRouter>
            <NavItem {...defaultProps} />
        </BrowserRouter>,
    );
}

describe("NavItem Component", () => {
    it("should render NavLink with text", () => {
        renderNavItem({ text: "Test Link", url: "/test" });
        expect(screen.getByText("Test Link")).toBeInTheDocument();
    });

    it("should render icon when provided", () => {
        renderNavItem({ icon: "ion-compose" });
        expect(screen.getByRole("link").querySelector(".ion-compose")).toBeInTheDocument();
    });

    it("should not render icon when not provided", () => {
        renderNavItem({ icon: null });
        const link = screen.getByRole("link");
        expect(link.querySelector("i")).not.toBeInTheDocument();
    });

    it("should apply nav-item and nav-link classes", () => {
        renderNavItem();
        expect(screen.getByRole("listitem")).toHaveClass("nav-item");
        expect(screen.getByRole("link")).toHaveClass("nav-link");
    });

    it("should have correct href attribute", () => {
        renderNavItem({ url: "/editor" });
        expect(screen.getByRole("link")).toHaveAttribute("href", "/editor");
    });

    it("should apply active class when route matches", () => {
        renderNavItem({ url: "/" });
        const link = screen.getByRole("link");
        expect(link).toHaveClass("nav-link");
    });

    it("should pass state prop to NavLink", () => {
        const state = { user: "test" };
        renderNavItem({ state });
        const link = screen.getByRole("link");
        expect(link).toHaveAttribute("href");
    });

    it("should render multiple icons and text together", () => {
        renderNavItem({ text: "New Article", icon: "ion-compose" });
        expect(screen.getByText("New Article")).toBeInTheDocument();
        expect(screen.getByRole("link").querySelector(".ion-compose")).toBeInTheDocument();
    });
});
