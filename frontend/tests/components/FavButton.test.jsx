import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import FavButton from "../../src/components/FavButton/FavButton";
import { useAuth } from "../../src/context/AuthContext";
import toggleFav from "../../src/services/toggleFav";

jest.mock("../../src/context/AuthContext");
jest.mock("../../src/services/toggleFav");

const mockHandler = jest.fn();

describe("FavButton Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        window.alert = jest.fn();
    });

    it("should display favorites count", () => {
        useAuth.mockReturnValue({ isAuth: false, headers: null });
        render(<FavButton favoritesCount={5} favorited={false} />);
        expect(screen.getByText("( 5 )")).toBeDefined();
    });

    it("should show alert if clicking when not authenticated", () => {
        useAuth.mockReturnValue({ isAuth: false, headers: null });
        render(<FavButton favoritesCount={5} favorited={false} />);

        fireEvent.click(screen.getByRole("button"));
        expect(window.alert).toHaveBeenCalledWith("You need to login first");
        expect(toggleFav).not.toHaveBeenCalled();
    });

    it("should call toggleFav and handler when authenticated and clicked", async () => {
        useAuth.mockReturnValue({
            isAuth: true,
            headers: { Authorization: "Token test" },
        });
        toggleFav.mockResolvedValue({ slug: "test", favorited: true });

        render(
            <FavButton
                favoritesCount={5}
                favorited={false}
                slug="test-slug"
                handler={mockHandler}
            />,
        );

        fireEvent.click(screen.getByRole("button"));

        expect(toggleFav).toHaveBeenCalledWith({
            slug: "test-slug",
            favorited: false,
            headers: { Authorization: "Token test" },
        });

        await waitFor(() => {
            expect(mockHandler).toHaveBeenCalled();
        });
    });

    it("should be disabled while loading", async () => {
        useAuth.mockReturnValue({
            isAuth: true,
            headers: { Authorization: "Token test" },
        });
        toggleFav.mockReturnValue(new Promise(() => {})); // Never resolves

        render(
            <FavButton
                favoritesCount={5}
                favorited={false}
                slug="test-slug"
                handler={mockHandler}
            />,
        );

        fireEvent.click(screen.getByRole("button"));
        expect(screen.getByRole("button").hasAttribute("disabled")).toBe(true);
    });
});
