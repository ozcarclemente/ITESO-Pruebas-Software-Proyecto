import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "@jest/globals";
import ContainerRow from "../../src/components/ContainerRow/ContainerRow";

describe("ContainerRow Component", () => {
    it("should render with container and row classes", () => {
        const { container } = render(
            <ContainerRow>
                <div>Test Content</div>
            </ContainerRow>,
        );

        const mainDiv = container.querySelector(".container");
        expect(mainDiv).toBeInTheDocument();
        expect(mainDiv).toHaveClass("container");

        const rowDiv = mainDiv.querySelector(".row");
        expect(rowDiv).toBeInTheDocument();
        expect(rowDiv).toHaveClass("row");
    });

    it("should render children inside row", () => {
        render(
            <ContainerRow>
                <div data-testid="child-element">Test Content</div>
            </ContainerRow>,
        );

        expect(screen.getByTestId("child-element")).toBeInTheDocument();
        expect(screen.getByText("Test Content")).toBeInTheDocument();
    });

    it("should render multiple children", () => {
        render(
            <ContainerRow>
                <div data-testid="child-1">First</div>
                <div data-testid="child-2">Second</div>
                <div data-testid="child-3">Third</div>
            </ContainerRow>,
        );

        expect(screen.getByTestId("child-1")).toBeInTheDocument();
        expect(screen.getByTestId("child-2")).toBeInTheDocument();
        expect(screen.getByTestId("child-3")).toBeInTheDocument();
    });

    it("should apply type class when provided", () => {
        const { container } = render(
            <ContainerRow type="page">
                <div>Content</div>
            </ContainerRow>,
        );

        const mainDiv = container.querySelector(".container");
        expect(mainDiv).toHaveClass("container");
        expect(mainDiv).toHaveClass("page");
    });

    it("should not apply type class when not provided", () => {
        const { container } = render(
            <ContainerRow>
                <div>Content</div>
            </ContainerRow>,
        );

        const mainDiv = container.querySelector(".container");
        expect(mainDiv.className).toMatch(/^container\s*$/);
    });

    it("should handle different type values", () => {
        const { container } = render(
            <ContainerRow type="custom-type">
                <div>Content</div>
            </ContainerRow>,
        );

        const mainDiv = container.querySelector(".container");
        expect(mainDiv).toHaveClass("custom-type");
    });

    it("should preserve HTML structure", () => {
        const { container } = render(
            <ContainerRow type="test-type">
                <p>Paragraph content</p>
            </ContainerRow>,
        );

        expect(container.querySelector(".container.test-type")).toBeInTheDocument();
        expect(
            container.querySelector(".container.test-type > .row > p"),
        ).toBeInTheDocument();
    });

    it("should render nested components", () => {
        const NestedComponent = () => (
            <div>
                <h1>Nested Title</h1>
                <p>Nested Content</p>
            </div>
        );

        render(
            <ContainerRow>
                <NestedComponent />
            </ContainerRow>,
        );

        expect(screen.getByText("Nested Title")).toBeInTheDocument();
        expect(screen.getByText("Nested Content")).toBeInTheDocument();
    });
});
