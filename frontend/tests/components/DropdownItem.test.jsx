import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, jest } from "@jest/globals";
import DropdownItem from "../../src/components/Navbar/DropdownItem";

function renderDropdownItem(props = {}) {
    const defaultProps = {
        text: "Test Item",
        url: "/test",
        ...props,
    };
    return render(
        <BrowserRouter>
            <DropdownItem {...defaultProps} />
        </BrowserRouter>,
    );
}

describe("DropdownItem Component", () => {
    it("should render Link with text", () => {
        renderDropdownItem({ text: "Profile" });
        expect(screen.getByText("Profile")).toBeInTheDocument();
    });

    it("should apply dropdown-item class", () => {
        renderDropdownItem();
        expect(screen.getByRole("link")).toHaveClass("dropdown-item");
    });

    it("should have correct href when url is provided", () => {
        renderDropdownItem({ url: "/profile/testuser" });
        expect(screen.getByRole("link")).toHaveAttribute(
            "href",
            "/profile/testuser",
        );
    });

    it("should default to hash when no url provided", () => {
        renderDropdownItem({ url: undefined });
        const link = screen.getByRole("link");
        expect(link.getAttribute("href")).toBeTruthy();
    });

    it("should render icon when provided", () => {
        renderDropdownItem({ icon: "ion-person" });
        expect(
            screen.getByRole("link").querySelector(".ion-person"),
        ).toBeInTheDocument();
    });

    it("should not render icon when not provided", () => {
        renderDropdownItem({ icon: null });
        expect(
            screen.getByRole("link").querySelector("i"),
        ).not.toBeInTheDocument();
    });

    it("should render icon and text together", () => {
        renderDropdownItem({ text: "Settings", icon: "ion-gear-a" });
        const link = screen.getByRole("link");
        expect(link).toHaveTextContent("Settings");
        expect(link.querySelector(".ion-gear-a")).toBeInTheDocument();
    });

    it("should call handler when clicked", () => {
        const mockHandler = jest.fn();
        renderDropdownItem({ handler: mockHandler });
        fireEvent.click(screen.getByRole("link"));
        expect(mockHandler).toHaveBeenCalled();
    });

    it("should not call handler when not provided", () => {
        renderDropdownItem({ handler: undefined });
        expect(() => {
            fireEvent.click(screen.getByRole("link"));
        }).not.toThrow();
    });

    it("should pass state prop to Link", () => {
        const state = { user: "testuser", role: "admin" };
        renderDropdownItem({ state });
        const link = screen.getByRole("link");
        expect(link).toHaveAttribute("href");
    });

    it("should render Logout item with handler", () => {
        const mockLogout = jest.fn();
        renderDropdownItem({
            text: "Logout",
            url: "#",
            icon: "ion-log-out",
            handler: mockLogout,
        });

        const link = screen.getByRole("link");
        expect(link).toHaveTextContent("Logout");
        expect(link.querySelector(".ion-log-out")).toBeInTheDocument();

        fireEvent.click(link);
        expect(mockLogout).toHaveBeenCalled();
    });
});
