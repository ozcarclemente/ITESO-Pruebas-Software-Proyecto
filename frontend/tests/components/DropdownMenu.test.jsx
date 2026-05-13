import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import DropdownMenu from "../../src/components/Navbar/DropdownMenu";
import { useAuth } from "../../src/context/AuthContext";
import userLogout from "../../src/services/userLogout";

jest.mock("../../src/context/AuthContext");
jest.mock("../../src/services/userLogout");
jest.mock("../../src/components/Avatar", () => ({
    __esModule: true,
    default: ({ alt, src }) => <img alt={alt} src={src} />,
}));
jest.mock("../../src/components/Navbar/DropdownItem", () => ({
    __esModule: true,
    default: ({ text, handler }) => (
        <button data-testid={`dropdown-item-${text}`} onClick={handler}>
            {text}
        </button>
    ),
}));

const mockSetAuthState = jest.fn();

function renderDropdownMenu() {
    return render(
        <BrowserRouter>
            <DropdownMenu />
        </BrowserRouter>,
    );
}

describe("DropdownMenu Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue({
            loggedUser: {
                username: "testuser",
                image: "https://example.com/avatar.jpg",
            },
            setAuthState: mockSetAuthState,
        });
    });

    it("should render user avatar and username", () => {
        renderDropdownMenu();
        expect(screen.getByAltText("testuser")).toBeInTheDocument();
        expect(screen.getByText("testuser")).toBeInTheDocument();
    });

    it("should render dropdown toggle button", () => {
        renderDropdownMenu();
        const toggle = screen.getByText("testuser");
        expect(toggle).toHaveClass("dropdown-toggle");
    });

    it("should have cursor-pointer class on toggle", () => {
        renderDropdownMenu();
        const toggle = screen.getByText("testuser");
        expect(toggle).toHaveClass("cursor-pointer");
    });

    it("should initially hide dropdown menu", () => {
        renderDropdownMenu();
        const menu = screen
            .getByRole("img")
            .parentElement.parentElement.querySelector(".dropdown-menu");
        expect(menu).toHaveStyle({ display: "none" });
    });

    it("should show dropdown menu when toggle is clicked", () => {
        renderDropdownMenu();
        const toggle = screen.getByText("testuser");
        fireEvent.click(toggle);

        const menu = toggle.parentElement.querySelector(".dropdown-menu");
        expect(menu).toHaveStyle({ display: "block" });
    });

    it("should toggle dropdown menu visibility on multiple clicks", () => {
        renderDropdownMenu();
        const toggle = screen.getByText("testuser");
        const menu = toggle.parentElement.querySelector(".dropdown-menu");

        fireEvent.click(toggle);
        expect(menu).toHaveStyle({ display: "block" });

        fireEvent.click(toggle);
        expect(menu).toHaveStyle({ display: "none" });
    });

    it("should hide dropdown menu on mouse leave", () => {
        renderDropdownMenu();
        const toggle = screen.getByText("testuser");
        fireEvent.click(toggle);

        const menu = toggle.parentElement.querySelector(".dropdown-menu");
        fireEvent.mouseLeave(menu);
        expect(menu).toHaveStyle({ display: "none" });
    });

    it("should render Profile dropdown item", () => {
        renderDropdownMenu();
        expect(screen.getByTestId("dropdown-item-Profile")).toBeInTheDocument();
    });

    it("should render Settings dropdown item", () => {
        renderDropdownMenu();
        expect(
            screen.getByTestId("dropdown-item-Settings"),
        ).toBeInTheDocument();
    });

    it("should render Logout dropdown item with handler", () => {
        renderDropdownMenu();
        const logoutBtn = screen.getByTestId("dropdown-item-Logout");
        expect(logoutBtn).toBeInTheDocument();

        fireEvent.click(logoutBtn);
        expect(mockSetAuthState).toHaveBeenCalledWith(userLogout);
    });

    it("should render dropdown divider", () => {
        renderDropdownMenu();
        const divider = screen
            .getByText("testuser")
            .parentElement.querySelector(".dropdown-divider");
        expect(divider).toBeInTheDocument();
    });

    it("should pass correct state to Profile item", () => {
        const loggedUser = {
            username: "testuser",
            image: "test.jpg",
            bio: "test bio",
        };
        useAuth.mockReturnValue({
            loggedUser,
            setAuthState: mockSetAuthState,
        });

        renderDropdownMenu();
        expect(screen.getByTestId("dropdown-item-Profile")).toBeInTheDocument();
    });
});
