import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import CommentAuthor from "../../src/components/CommentList/CommentAuthor";

describe("CommentAuthor", () => {
    const authorProps = {
        username: "johndoe",
        image: "https://example.com/avatar.jpg",
        bio: "Developer",
        following: false,
        followersCount: 10,
    };

    it("should render author username", () => {
        render(
            <BrowserRouter>
                <CommentAuthor {...authorProps} />
            </BrowserRouter>,
        );

        expect(screen.getByText("johndoe")).toBeInTheDocument();
    });

    it("should render author avatar", () => {
        render(
            <BrowserRouter>
                <CommentAuthor {...authorProps} />
            </BrowserRouter>,
        );

        const avatar = screen.getByAltText("johndoe");
        expect(avatar).toBeInTheDocument();
    });

    it("should link to author profile", () => {
        render(
            <BrowserRouter>
                <CommentAuthor {...authorProps} />
            </BrowserRouter>,
        );

        const links = screen.getAllByRole("link");
        expect(links[0]).toHaveAttribute("href", "/profile/johndoe");
        expect(links[1]).toHaveAttribute("href", "/profile/johndoe");
    });
});
