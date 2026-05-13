import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "@jest/globals";
import BannerContainer from "../../src/components/BannerContainer/BannerContainer";

describe("BannerContainer Component", () => {
    it("should render banner and container classes", () => {
        const { container } = render(
            <BannerContainer>
                <div>Test Content</div>
            </BannerContainer>,
        );

        const banner = container.querySelector(".banner");
        expect(banner).toBeInTheDocument();

        const innerContainer = banner.querySelector(".container");
        expect(innerContainer).toBeInTheDocument();
    });

    it("should render children inside container", () => {
        render(
            <BannerContainer>
                <div data-testid="test-child">Test Content</div>
            </BannerContainer>,
        );

        expect(screen.getByTestId("test-child")).toBeInTheDocument();
        expect(screen.getByText("Test Content")).toBeInTheDocument();
    });

    it("should render multiple children", () => {
        render(
            <BannerContainer>
                <h1 data-testid="heading">Title</h1>
                <p data-testid="paragraph">Description</p>
            </BannerContainer>,
        );

        expect(screen.getByTestId("heading")).toBeInTheDocument();
        expect(screen.getByTestId("paragraph")).toBeInTheDocument();
    });

    it("should wrap children inside nested divs with correct classes", () => {
        const { container } = render(
            <BannerContainer>
                <span data-testid="inner-span">Content</span>
            </BannerContainer>,
        );

        const banner = container.querySelector(".banner");
        const innerContainer = banner.querySelector(".container");
        const span = innerContainer.querySelector('[data-testid="inner-span"]');

        expect(span).toBeInTheDocument();
        expect(span.parentElement).toBe(innerContainer);
        expect(innerContainer.parentElement).toBe(banner);
    });

    it("should render complex nested components", () => {
        const ComplexChild = () => (
            <div>
                <h2>Header</h2>
                <div>
                    <p>Nested paragraph</p>
                </div>
            </div>
        );

        render(
            <BannerContainer>
                <ComplexChild />
            </BannerContainer>,
        );

        expect(screen.getByText("Header")).toBeInTheDocument();
        expect(screen.getByText("Nested paragraph")).toBeInTheDocument();
    });

    it("should have proper DOM hierarchy", () => {
        const { container } = render(
            <BannerContainer>
                <div data-testid="content">Banner content</div>
            </BannerContainer>,
        );

        const banner = container.firstChild;
        const containerDiv = banner.firstChild;
        const content = containerDiv.firstChild;

        expect(banner).toHaveClass("banner");
        expect(containerDiv).toHaveClass("container");
        expect(content).toHaveAttribute("data-testid", "content");
    });

    it("should work with text content", () => {
        render(<BannerContainer>Simple text content</BannerContainer>);

        expect(screen.getByText("Simple text content")).toBeInTheDocument();
    });

    it("should preserve HTML elements", () => {
        const { container } = render(
            <BannerContainer>
                <article>
                    <header>Article Header</header>
                    <section>Article content</section>
                </article>
            </BannerContainer>,
        );

        expect(container.querySelector("article")).toBeInTheDocument();
        expect(container.querySelector("header")).toBeInTheDocument();
        expect(container.querySelector("section")).toBeInTheDocument();
    });

    it("should render empty when no children provided", () => {
        const { container } = render(<BannerContainer />);

        const banner = container.querySelector(".banner");
        const innerContainer = banner.querySelector(".container");

        expect(banner).toBeInTheDocument();
        expect(innerContainer).toBeInTheDocument();
        expect(innerContainer.children.length).toBe(0);
    });
});
