import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, jest } from "@jest/globals";
import Footer from "../../src/components/Footer/Footer";

jest.mock("../../src/components/SourceCodeLink", () => ({
    __esModule: true,
    default: () => <div data-testid="source-code-link" />,
}));

function renderFooter() {
    return render(
        <BrowserRouter>
            <Footer />
        </BrowserRouter>,
    );
}

describe("Footer Component", () => {
    it("should render footer container", () => {
        renderFooter();
        const container = screen.getByText("conduit").parentElement;
        expect(container).toHaveClass("container");
    });

    it("should render conduit brand link", () => {
        renderFooter();
        const brandLink = screen.getByText("conduit");
        expect(brandLink).toHaveClass("logo-font");
        expect(brandLink).toHaveAttribute("href", "/");
    });

    it("should render attribution text", () => {
        renderFooter();
        expect(
            screen.getByText(/An interactive learning project from/),
        ).toBeInTheDocument();
    });

    it("should render Thinkster link", () => {
        renderFooter();
        const thinksterLink = screen.getByText("Thinkster");
        expect(thinksterLink).toHaveAttribute("href", "https://thinkster.io");
    });

    it("should render MIT license text", () => {
        renderFooter();
        expect(screen.getByText(/licensed under MIT/)).toBeInTheDocument();
    });

    it("should render SourceCodeLink component", () => {
        renderFooter();
        expect(screen.getByTestId("source-code-link")).toBeInTheDocument();
    });

    it("should have proper anchor tag structure", () => {
        renderFooter();
        const thinksterLink = screen.getByText("Thinkster");
        expect(thinksterLink.tagName).toBe("A");
        expect(thinksterLink).toHaveAttribute("href", "https://thinkster.io");
    });

    it("should render all required footer elements in order", () => {
        renderFooter();
        const container = screen.getByText("conduit").parentElement;
        const children = container.children;

        expect(children[0].textContent).toContain("conduit");
        expect(children[1].textContent).toContain(
            "An interactive learning project",
        );
    });

    it("should have proper HTML structure", () => {
        const { container } = render(
            <BrowserRouter>
                <Footer />
            </BrowserRouter>,
        );

        const footerContainer = container.querySelector(".container");
        expect(footerContainer).toBeInTheDocument();

        const brandLink = footerContainer.querySelector(".logo-font");
        expect(brandLink).toBeInTheDocument();
        expect(brandLink.getAttribute("href")).toBe("/");
    });
});
